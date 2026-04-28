import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CheckInRequest {
  mode: 'quick' | 'timer';
  durationSeconds?: number;
}

interface CheckInResponse {
  checkIn: {
    id: string;
    duration_seconds: number;
    earned_amount: number;
    coins_earned: number;
    mode: string;
  };
  stats: {
    earnedAmount: number;
    coinsEarned: number;
    streakDays: number;
    multiplier: number;
    totalEarned: number;
    poop_coins: number;
  };
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (req: CheckInRequest) =>
      api.post<CheckInResponse>('/api/check-in', req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['check-ins'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
  });

  return {
    checkIn: mutation.mutateAsync,
    isChecking: mutation.isPending,
    lastResult: mutation.data,
    error: mutation.error,
  };
}
