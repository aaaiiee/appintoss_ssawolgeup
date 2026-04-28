import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface StatsSummary {
  month: string;
  totalEarned: number;
  totalDays: number;
  totalSeconds: number;
  daily: Record<string, { earned: number; count: number }>;
}

export function useStats(month?: string) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const targetMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['stats', 'summary', targetMonth],
    queryFn: () => api.get<StatsSummary>(`/api/stats/summary?month=${targetMonth}`),
    enabled: isLoggedIn,
  });
}
