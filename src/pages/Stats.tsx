import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { MonthlySummary } from '@/components/stats/MonthlySummary';
import { AttendanceCalendar } from '@/components/stats/AttendanceCalendar';
import { WeeklyChart } from '@/components/stats/WeeklyChart';
import { BannerAdWrapper } from '@/components/BannerAdWrapper';
import { useStats } from '@/hooks/useStats';
import { getBannerAdGroupId } from '@/lib/adConstants';

export default function Stats() {
  const [month, setMonth] = useState(new Date());
  const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const { data, isLoading } = useStats(monthStr);

  if (isLoading || !data) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
          로딩 중...
        </div>
      </PageLayout>
    );
  }

  const attendanceDays = Object.keys(data.daily);

  return (
    <PageLayout>
      <div className="p-4 flex flex-col gap-4">
        <MonthlySummary
          totalEarned={data.totalEarned}
          totalDays={data.totalDays}
          totalSeconds={data.totalSeconds}
        />
        <AttendanceCalendar
          attendanceDays={attendanceDays}
          month={month}
          onMonthChange={setMonth}
          daily={data.daily}
        />
        <BannerAdWrapper adGroupId={getBannerAdGroupId('feed')} mode="inline" />
        <WeeklyChart daily={data.daily} />
      </div>
    </PageLayout>
  );
}
