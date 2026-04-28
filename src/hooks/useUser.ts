import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export interface User {
  id: string;
  toss_user_id: string;
  nickname: string;
  hourly_wage: number;
  quick_duration_seconds: number;
  poop_coins: number;
  toss_points_balance: number;
  exchanges_today?: number;
  last_exchange_date?: string | null;
  streak_days: number;
  last_check_in_date: string | null;
  total_earned: number;
  total_check_ins: number;
  ad_views_today: number;
  shares_today: number;
  created_at: string;
}

export function useUser() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => api.get<User>('/api/user/me'),
    enabled: isLoggedIn,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Pick<User, 'nickname' | 'hourly_wage' | 'quick_duration_seconds'>>) =>
      api.patch<User>('/api/user/me', updates),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['user', 'me'], data);
      // Nickname change → ranking displays nickname, invalidate so it refetches immediately
      if (variables.nickname !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['ranking'] });
      }
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
