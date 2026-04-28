import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';
import { findTier } from '../_lib/exchange-tiers';

const EXCHANGE_MODE = (process.env.EXCHANGE_MODE ?? 'mock') as 'mock' | 'production';

/**
 * Step 2 of 3: Execute the exchange.
 * - mock mode: deduct coins, grant internal points, mark completed immediately.
 * - production mode: call Toss promotion API (mTLS) and record the request ID.
 *   Actual point grant is confirmed via /api/promotion/result polling.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { exchangeKey } = req.body as { exchangeKey?: string };

    if (!exchangeKey) {
      return res.status(400).json({ message: 'exchangeKey is required' });
    }

    const { data: exchange, error } = await supabase
      .from('point_exchanges')
      .select('*')
      .eq('exchange_key', exchangeKey)
      .eq('user_id', userId)
      .single();

    if (error || !exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (exchange.status !== 'pending') {
      return res.status(409).json({
        message: `Exchange already ${exchange.status}`,
        code: 'NOT_PENDING',
      });
    }

    const tier = findTier(exchange.tier_id);
    if (!tier) {
      return res.status(400).json({ message: 'Invalid tier' });
    }

    if (EXCHANGE_MODE === 'mock') {
      return await executeMock(userId, exchange, res);
    }
    return await executeProduction(userId, exchange, res);
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}

type ExchangeRow = {
  id: string;
  user_id: string;
  coins_spent: number;
  points_granted: number;
  tier_id: string;
  exchange_key: string;
};

async function executeMock(
  userId: string,
  exchange: ExchangeRow,
  res: VercelResponse,
) {
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

  const { error: rpcError } = await supabase.rpc('apply_exchange', {
    p_user_id: userId,
    p_coins: exchange.coins_spent,
    p_points: exchange.points_granted,
  });

  if (rpcError) {
    await supabase
      .from('point_exchanges')
      .update({ status: 'failed', error_message: rpcError.message })
      .eq('id', exchange.id);

    if (rpcError.message.includes('INSUFFICIENT_COINS')) {
      return res.status(400).json({ message: '코인이 부족합니다', code: 'INSUFFICIENT_COINS' });
    }
    throw rpcError;
  }

  await supabase
    .from('point_exchanges')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', exchange.id);

  await supabase
    .from('users')
    .update({ exchanges_today: 1, last_exchange_date: todayStr })
    .eq('id', userId);

  await supabase.from('rewards').insert({
    user_id: userId,
    type: 'exchange',
    coins_amount: -exchange.coins_spent,
    toss_points: exchange.points_granted,
    description: `똥코인 ${exchange.coins_spent}🪙 → ${exchange.points_granted}P 교환 (mock)`,
  });

  return res.status(200).json({
    status: 'completed',
    coinsSpent: exchange.coins_spent,
    pointsGranted: exchange.points_granted,
    mode: 'mock',
  });
}

async function executeProduction(
  _userId: string,
  exchange: ExchangeRow,
  res: VercelResponse,
) {
  // TODO: Implement actual Toss promotion API call with mTLS.
  // Steps:
  //   1. Load mTLS cert/key (Base64 from env → PEM)
  //   2. Call POST {TOSS_API}/promotion/v1/executions using `undici` Agent dispatcher
  //   3. Receive promotionRequestId → save to point_exchanges.promotion_request_id
  //   4. Client polls /api/promotion/result with exchangeKey until completed
  // See /appintoss-promotion-reward skill for full reference implementation.

  if (!process.env.TOSS_PROMOTION_CODE) {
    await supabase
      .from('point_exchanges')
      .update({ status: 'failed', error_message: 'TOSS_PROMOTION_CODE not configured' })
      .eq('id', exchange.id);
    return res.status(500).json({
      message: 'Production promotion not configured. Set TOSS_PROMOTION_CODE env var.',
      code: 'PROMOTION_NOT_CONFIGURED',
    });
  }

  // Placeholder: reserve promotion_request_id for polling
  const promotionRequestId = `prod_pending_${Date.now()}`;

  await supabase
    .from('point_exchanges')
    .update({
      promotion_request_id: promotionRequestId,
      status: 'pending', // stays pending until Toss callback / poll confirms
    })
    .eq('id', exchange.id);

  return res.status(202).json({
    status: 'pending',
    promotionRequestId,
    message: 'Production exchange started. Poll /api/promotion/result for completion.',
    mode: 'production',
  });
}
