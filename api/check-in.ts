import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { extractUser, handleError } from './_lib/auth';

const MAX_DAILY_CHECK_INS = 3;
const MINIMUM_WAGE = 9860;
const TIMER_MAX_SECONDS = 30 * 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { mode, durationSeconds } = req.body as {
      mode: 'quick' | 'timer';
      durationSeconds?: number;
    };

    if (!mode || !['quick', 'timer'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode' });
    }

    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userErr || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const todayKST = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
    );
    const todayStr = todayKST.toISOString().slice(0, 10);
    const tomorrow = new Date(todayKST);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const { count: todayCount } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${todayStr}T00:00:00+09:00`)
      .lt('created_at', `${tomorrowStr}T00:00:00+09:00`);

    if ((todayCount ?? 0) >= MAX_DAILY_CHECK_INS) {
      return res.status(429).json({ message: '오늘 체크인은 여기까지! 내일 또 만나요 💩' });
    }

    let duration: number;
    if (mode === 'quick') {
      duration = user.quick_duration_seconds;
    } else {
      duration = Math.min(Math.max(durationSeconds ?? 0, 1), TIMER_MAX_SECONDS);
    }

    const wage = user.hourly_wage > 0 ? user.hourly_wage : MINIMUM_WAGE;
    const earnedAmount = Math.floor((wage / 3600) * duration);

    const streakDays = calculateNewStreak(user.last_check_in_date, user.streak_days, todayStr);
    const multiplier = getStreakMultiplier(streakDays);
    let baseCoins: number;
    if (mode === 'quick') {
      baseCoins = 10;
    } else {
      const minutes = Math.floor(duration / 60);
      baseCoins = 10 + minutes * 2;
    }
    const coinsEarned = Math.floor(baseCoins * multiplier);

    const { data: checkIn, error: ciErr } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
        duration_seconds: duration,
        earned_amount: earnedAmount,
        coins_earned: coinsEarned,
        mode,
      })
      .select()
      .single();

    if (ciErr) {
      throw ciErr;
    }

    await supabase
      .from('users')
      .update({
        poop_coins: user.poop_coins + coinsEarned,
        streak_days: streakDays,
        last_check_in_date: todayStr,
        total_earned: user.total_earned + earnedAmount,
        total_check_ins: user.total_check_ins + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    checkAchievements(userId, {
      totalCheckIns: user.total_check_ins + 1,
      streakDays,
      totalEarned: user.total_earned + earnedAmount,
    }).catch(console.error);

    return res.status(201).json({
      checkIn,
      stats: {
        earnedAmount,
        coinsEarned,
        streakDays,
        multiplier,
        totalEarned: user.total_earned + earnedAmount,
        poop_coins: user.poop_coins + coinsEarned,
      },
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}

function calculateNewStreak(
  lastDate: string | null,
  currentStreak: number,
  todayStr: string
): number {
  if (!lastDate) return 1;
  if (lastDate === todayStr) return currentStreak;

  const [ly, lm, ld] = lastDate.split('-').map(Number);
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const lastDays = new Date(ly, lm - 1, ld).getTime() / 86400000;
  const todayDays = new Date(ty, tm - 1, td).getTime() / 86400000;
  const diffDays = todayDays - lastDays;

  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 3.0;
  if (streakDays >= 7) return 2.0;
  if (streakDays >= 3) return 1.5;
  return 1.0;
}

async function checkAchievements(
  userId: string,
  stats: { totalCheckIns: number; streakDays: number; totalEarned: number }
) {
  const checks: Array<{ key: string; condition: boolean; reward: number }> = [
    { key: 'first_check_in', condition: stats.totalCheckIns >= 1, reward: 100 },
    { key: 'streak_3', condition: stats.streakDays >= 3, reward: 200 },
    { key: 'streak_7', condition: stats.streakDays >= 7, reward: 500 },
    { key: 'streak_30', condition: stats.streakDays >= 30, reward: 2000 },
    { key: 'total_100', condition: stats.totalCheckIns >= 100, reward: 2000 },
    { key: 'millionaire', condition: stats.totalEarned >= 1000000, reward: 5000 },
  ];

  for (const { key, condition, reward } of checks) {
    if (!condition) continue;

    const { error } = await supabase
      .from('achievements')
      .insert({ user_id: userId, achievement_key: key });

    if (!error) {
      await supabase.rpc('increment_coins', {
        user_id_input: userId,
        amount: reward,
      });

      await supabase.from('rewards').insert({
        user_id: userId,
        type: 'achievement',
        coins_amount: reward,
        description: `업적 달성: ${key}`,
      });
    }
  }
}
