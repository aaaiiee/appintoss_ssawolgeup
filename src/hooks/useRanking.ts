import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export interface RankEntry {
  userId: string;
  nickname: string;
  totalEarned: number; // 부가 정보용 (시급 차이로 인한 불공정성 때문에 정렬엔 사용 X)
  checkInCount: number;
  totalSeconds: number; // ← 메인 정렬 기준: 누적 머문 시간
}

interface RankingResponse {
  rankings: RankEntry[];
  myRank: number | null;
  myEntry: RankEntry | null;
}

export function useRanking(period: 'week' | 'month' | 'all' = 'week') {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: ['ranking', period],
    queryFn: () => api.get<RankingResponse>(`/api/ranking?period=${period}`),
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });
}
