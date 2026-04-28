import { MissionCard } from './MissionCard';
import { useUser } from '@/hooks/useUser';
import { useReward } from '@/hooks/useReward';
import { tossShare } from '@/lib/sdk';
import { formatWon } from '@/lib/calculations';
import { toast } from 'sonner';

export function MissionBoard() {
  const { user, refetch } = useUser();
  const { isAdReady, isAdLoading, isAdShowing, showAdAndClaim, claimShareReward } = useReward();

  if (!user) return null;

  const handleAdWatch = async () => {
    const result = await showAdAndClaim();
    if (result) {
      toast.success(`+${result.coinsEarned} 🪙 획득!`);
      refetch();
    }
  };

  const handleShare = async () => {
    const shared = await tossShare(
      `나 오늘 회사에서 ${formatWon(user.total_earned)} 벌었다 💩💰 — 싸월급`
    );
    if (shared) {
      try {
        const result = await claimShareReward();
        toast.success(`+${result.coinsEarned} 🪙 공유 보상!`);
        refetch();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '보상 지급 실패');
      }
    }
  };

  const adViewsToday = user.ad_views_today ?? 0;
  const checkedInToday = user.last_check_in_date ===
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-white text-base font-bold">
        <span className="text-xl mr-1">📋</span>오늘의 미션
      </p>

      <MissionCard
        emoji="🎬"
        title="광고 보고 코인 받기"
        subtitle={`오늘 ${adViewsToday}/3회 시청`}
        reward="+50🪙"
        progress={{ current: adViewsToday, total: 3 }}
        completed={adViewsToday >= 3}
        onAction={handleAdWatch}
        disabled={isAdLoading || isAdShowing || !isAdReady}
        actionLabel={isAdShowing ? '시청 중...' : '+50🪙'}
      />

      <MissionCard
        emoji="✅"
        title="오늘 출석 체크"
        subtitle={checkedInToday ? '완료!' : '아직 미출석'}
        reward="+10🪙"
        completed={checkedInToday}
      />

      <MissionCard
        emoji="🔥"
        title="7일 연속 출석 달성"
        subtitle={`현재 ${user.streak_days}일 / 7일`}
        reward="+200🪙"
        progress={{ current: Math.min(user.streak_days, 7), total: 7 }}
        completed={user.streak_days >= 7}
      />

      <MissionCard
        emoji="📤"
        title="친구에게 공유하기"
        subtitle="토스 공유 링크로 초대"
        reward="+100🪙"
        completed={(user.shares_today ?? 0) >= 1}
        onAction={handleShare}
        actionLabel="+100🪙"
      />
    </div>
  );
}
