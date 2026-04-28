import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { extractUser, handleError } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { period = 'week' } = req.query as { period?: 'week' | 'month' | 'all' };

    let fromDate: string | null = null;
    const now = new Date();

    if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      fromDate = weekAgo.toISOString();
    } else if (period === 'month') {
      fromDate = `${now.toISOString().slice(0, 7)}-01`;
    }

    let query = supabase
      .from('check_ins')
      .select('user_id, earned_amount, duration_seconds, users!inner(nickname)');

    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }

    const { data: checkIns, error } = await query;
    if (error) throw error;

    const userMap = new Map<
      string,
      { nickname: string; total: number; count: number; seconds: number }
    >();
    for (const ci of checkIns ?? []) {
      const uid = ci.user_id;
      const existing = userMap.get(uid);
      const nickname = (ci as any).users?.nickname ?? '익명';
      if (existing) {
        existing.total += ci.earned_amount;
        existing.count += 1;
        existing.seconds += ci.duration_seconds ?? 0;
      } else {
        userMap.set(uid, {
          nickname,
          total: ci.earned_amount,
          count: 1,
          seconds: ci.duration_seconds ?? 0,
        });
      }
    }

    // 정렬 기준: 누적 머문 시간(초). 시급에 무관하게 모든 유저에게 공정한 지표.
    const rankings = Array.from(userMap.entries())
      .map(([uid, data]) => ({
        userId: uid,
        nickname: data.nickname,
        totalEarned: data.total,
        checkInCount: data.count,
        totalSeconds: data.seconds,
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds);

    const myRankIndex = rankings.findIndex((r) => r.userId === userId);

    return res.status(200).json({
      rankings: rankings.slice(0, 50),
      myRank: myRankIndex >= 0 ? myRankIndex + 1 : null,
      myEntry: myRankIndex >= 0 ? rankings[myRankIndex] : null,
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
