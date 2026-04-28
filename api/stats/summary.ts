import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { month } = req.query as { month?: string };

    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const startDate = `${targetMonth}-01`;
    const endDate = `${targetMonth}-31T23:59:59`;

    const { data: checkIns, error } = await supabase
      .from('check_ins')
      .select('earned_amount, duration_seconds, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const totalEarned = (checkIns ?? []).reduce((sum, ci) => sum + ci.earned_amount, 0);
    const totalSeconds = (checkIns ?? []).reduce((sum, ci) => sum + ci.duration_seconds, 0);
    const uniqueDays = new Set(
      (checkIns ?? []).map((ci) => ci.created_at.slice(0, 10))
    ).size;

    const dailyMap: Record<string, { earned: number; count: number }> = {};
    for (const ci of checkIns ?? []) {
      const day = ci.created_at.slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { earned: 0, count: 0 };
      dailyMap[day].earned += ci.earned_amount;
      dailyMap[day].count += 1;
    }

    return res.status(200).json({
      month: targetMonth,
      totalEarned,
      totalDays: uniqueDays,
      totalSeconds,
      daily: dailyMap,
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
