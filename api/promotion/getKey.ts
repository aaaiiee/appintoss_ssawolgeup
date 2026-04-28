import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';
import { findTier, MAX_EXCHANGES_PER_DAY } from '../_lib/exchange-tiers';

const EXCHANGE_MODE = (process.env.EXCHANGE_MODE ?? 'mock') as 'mock' | 'production';

/**
 * Step 1 of 3: Reserve an exchange — validate coins, check daily limit,
 * create a pending `point_exchanges` row, and return an exchangeKey.
 * The client then calls /api/promotion/execute with this key.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { tierId } = req.body as { tierId?: string };

    const tier = tierId ? findTier(tierId) : undefined;
    if (!tier) {
      return res.status(400).json({ message: 'Invalid tierId' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('poop_coins, exchanges_today, last_exchange_date')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const exchangesToday =
      user.last_exchange_date === todayStr ? user.exchanges_today : 0;

    if (exchangesToday >= MAX_EXCHANGES_PER_DAY) {
      return res.status(429).json({
        message: `하루 최대 ${MAX_EXCHANGES_PER_DAY}회까지 교환 가능합니다`,
        code: 'DAILY_LIMIT',
      });
    }

    if (user.poop_coins < tier.coins) {
      return res.status(400).json({
        message: `코인이 부족합니다 (보유 ${user.poop_coins}, 필요 ${tier.coins})`,
        code: 'INSUFFICIENT_COINS',
      });
    }

    const exchangeKey = `exch_${randomUUID()}`;

    const { error: insertError } = await supabase.from('point_exchanges').insert({
      user_id: userId,
      coins_spent: tier.coins,
      points_granted: tier.points,
      tier_id: tier.id,
      exchange_key: exchangeKey,
      status: 'pending',
      mode: EXCHANGE_MODE,
    });

    if (insertError) {
      throw new Error(`Failed to reserve exchange: ${insertError.message}`);
    }

    return res.status(200).json({
      exchangeKey,
      tier,
      mode: EXCHANGE_MODE,
      expiresInSeconds: 300,
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
