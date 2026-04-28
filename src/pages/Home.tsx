import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { EarningsCard } from '@/components/home/EarningsCard';
import { CheckInButton } from '@/components/home/CheckInButton';
import { QuickStats } from '@/components/home/QuickStats';
import { BannerAdWrapper } from '@/components/BannerAdWrapper';
import { getBannerAdGroupId } from '@/lib/adConstants';
import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

export default function Home() {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn, navigate]);

  const todayStr = useMemo(
    () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }),
    [],
  );
  const { data: todayCheckIns } = useQuery({
    queryKey: ['check-ins', 'today'],
    queryFn: () =>
      api.get<Array<{ earned_amount: number }>>(`/api/check-ins?from=${todayStr}&to=${todayStr}T23:59:59`),
    enabled: isLoggedIn,
  });

  const monthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const { data: monthlyStats } = useQuery({
    queryKey: ['stats', 'summary', monthStr],
    queryFn: () =>
      api.get<{ totalEarned: number }>(`/api/stats/summary?month=${monthStr}`),
    enabled: isLoggedIn,
  });

  if (isLoading || !user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </PageLayout>
    );
  }

  const todayEarned = (todayCheckIns ?? []).reduce((sum, ci) => sum + ci.earned_amount, 0);
  const todayCount = (todayCheckIns ?? []).length;

  return (
    <PageLayout>
      <div className="p-4 flex flex-col gap-4">
        <EarningsCard user={user} todayEarned={todayEarned} todayCount={todayCount} />
        <CheckInButton />
        <BannerAdWrapper adGroupId={getBannerAdGroupId('feed')} mode="inline" />
        <QuickStats user={user} monthlyTotal={monthlyStats?.totalEarned ?? 0} />
      </div>
    </PageLayout>
  );
}
