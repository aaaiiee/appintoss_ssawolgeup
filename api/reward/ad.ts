import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';

const MAX_DAILY_ADS = 3;
const AD_REWARD_COINS = 50;

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
    let adViewsToday = user.ad_views_today;
    if (user.ad_views_reset_date !== todayStr) {
      adViewsToday = 0;
    }

    if (adViewsToday >= MAX_DAILY_ADS) {
      return res.status(429).json({ message: '오늘 광고 보상을 모두 받았어요', code: 'DAILY_LIMIT' });
    }

    // 1) 코인 잔액은 race-safe RPC로 원자적 증가 (read-modify-write 손실 방지)
    const { error: incErr } = await supabase.rpc('increment_coins', {
      user_id_input: userId,
      amount: AD_REWARD_COINS,
    });
    if (incErr) {
      console.error('[reward/ad] increment_coins failed:', incErr);
      throw incErr;
    }

    // 2) 일일 카운터는 별도 업데이트 (단일 유저 동시성 매우 낮음)
    const { error: updErr } = await supabase
      .from('users')
      .update({
        ad_views_today: adViewsToday + 1,
        ad_views_reset_date: todayStr,
      })
      .eq('id', userId);
    if (updErr) {
      console.error('[reward/ad] ad_views update failed:', updErr);
      // 코인은 이미 적립됨 — 카운터 실패해도 보상 누락 안 됨
    }

    // 3) 이력 기록 (실패해도 보상 자체는 지급 완료)
    const { error: rewErr } = await supabase.from('rewards').insert({
      user_id: userId,
      type: 'ad',
      coins_amount: AD_REWARD_COINS,
      description: `광고 시청 보상 (${adViewsToday + 1}/${MAX_DAILY_ADS})`,
    });
    if (rewErr) {
      console.error('[reward/ad] rewards insert failed:', rewErr);
    }

    return res.status(200).json({
      coinsEarned: AD_REWARD_COINS,
      adViewsToday: adViewsToday + 1,
      adViewsRemaining: MAX_DAILY_ADS - adViewsToday - 1,
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
