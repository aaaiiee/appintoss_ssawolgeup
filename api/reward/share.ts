import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';

const SHARE_REWARD_COINS = 100;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    let sharesToday = user.shares_today;
    if (user.shares_reset_date !== todayStr) {
      sharesToday = 0;
    }

    if (sharesToday >= 1) {
      return res.status(429).json({ message: '오늘 공유 보상은 이미 받았어요' });
    }

    await supabase
      .from('users')
      .update({
        poop_coins: user.poop_coins + SHARE_REWARD_COINS,
        shares_today: sharesToday + 1,
        shares_reset_date: todayStr,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    await supabase.from('rewards').insert({
      user_id: userId,
      type: 'share',
      coins_amount: SHARE_REWARD_COINS,
      description: '친구 공유 보상',
    });

    return res.status(200).json({ coinsEarned: SHARE_REWARD_COINS });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
