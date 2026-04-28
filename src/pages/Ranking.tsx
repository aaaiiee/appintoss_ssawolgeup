import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TopThreePodium } from '@/components/ranking/TopThreePodium';
import { MyRankCard } from '@/components/ranking/MyRankCard';
import { RankingList } from '@/components/ranking/RankingList';
import { BannerAdWrapper } from '@/components/BannerAdWrapper';
import { useRanking } from '@/hooks/useRanking';
import { useUser } from '@/hooks/useUser';
import { getBannerAdGroupId } from '@/lib/adConstants';

type Period = 'week' | 'month' | 'all';
const PERIOD_LABELS: Record<Period, string> = {
  week: '이번 주',
  month: '이번 달',
  all: '전체',
};

export default function Ranking() {
  const [period, setPeriod] = useState<Period>('week');
  const { data, isLoading } = useRanking(period);
  const { user } = useUser();
  const currentUserId = user?.id;

  return (
    <PageLayout>
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-white font-bold text-xl">
            <span className="text-2xl mr-1">🚽</span>변기점령 랭킹
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            누적 점령 시간으로 순위를 매겨요. 시급은 무관합니다.
          </p>
        </div>
        <div className="flex gap-2 mb-4">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                p === period ? 'bg-[#3182F6] text-white' : 'bg-[#222] text-gray-500'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        {isLoading || !data ? (
          <div className="text-center text-gray-500 py-20">로딩 중...</div>
        ) : (
          <>
            <TopThreePodium top3={data.rankings.slice(0, 3)} currentUserId={currentUserId} />
            {/* 내 순위가 11위 이하일 때만 MyRankCard 표시 (Top10에 들어가면 podium 또는 리스트에서 "나" 표시됨) */}
            {data.myRank && data.myEntry && data.myRank > 10 && (
              <div className="mb-3">
                <MyRankCard rank={data.myRank} entry={data.myEntry} />
              </div>
            )}
            <div className="mb-3">
              <BannerAdWrapper
                adGroupId={getBannerAdGroupId('feed')}
                mode="inline"
              />
            </div>
            <p className="text-gray-400 text-sm font-bold mb-2 px-1">
              <span className="text-base mr-1">📊</span>4위 ~ 10위
            </p>
            <RankingList
              rankings={data.rankings.slice(3, 10)}
              startRank={4}
              currentUserId={currentUserId}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
}
