import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Achievement {
  achievement_key: string;
  achieved_at: string;
}

export function useAchievements() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => api.get<Achievement[]>('/api/achievements'),
    enabled: isLoggedIn,
  });
}
