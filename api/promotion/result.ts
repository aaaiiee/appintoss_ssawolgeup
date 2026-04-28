import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';

/**
 * Step 3 of 3: Poll exchange status.
 * - mock mode: already completed by execute.ts, returns final state.
 * - production mode: reads current Toss promotion status.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const exchangeKey = (req.query.exchangeKey as string) || '';

    if (!exchangeKey) {
      return res.status(400).json({ message: 'exchangeKey query param required' });
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

    return res.status(200).json({
      status: exchange.status,
      coinsSpent: exchange.coins_spent,
      pointsGranted: exchange.points_granted,
      mode: exchange.mode,
      errorMessage: exchange.error_message,
      completedAt: exchange.completed_at,
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
