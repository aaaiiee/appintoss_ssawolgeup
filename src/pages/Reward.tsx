import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AssetSummary } from '@/components/reward/AssetSummary';
import { MissionBoard } from '@/components/reward/MissionBoard';
import { AchievementGrid } from '@/components/reward/AchievementGrid';
import { CoinShop } from '@/components/reward/CoinShop';
import { ExchangeShop } from '@/components/reward/ExchangeShop';
import { BannerAdWrapper } from '@/components/BannerAdWrapper';
import { useUser } from '@/hooks/useUser';
import { useAchievements } from '@/hooks/useAchievements';
import { getBannerAdGroupId } from '@/lib/adConstants';

type Tab = 'mission' | 'exchange' | 'shop';

const TAB_LABELS: Record<Tab, string> = {
  mission: '미션',
  exchange: '교환',
  shop: '상점',
};

export default function Reward() {
  const [tab, setTab] = useState<Tab>('mission');
  const { user, isLoading } = useUser();
  const { data: achievements } = useAchievements();

  if (isLoading || !user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
          로딩 중...
        </div>
      </PageLayout>
    );
  }

  const achievedKeys = (achievements ?? []).map((a) => a.achievement_key);

  return (
    <PageLayout>
      <div className="p-4 flex flex-col gap-4">
        <AssetSummary
          poopCoins={user.poop_coins}
          tossPoints={user.toss_points_balance ?? 0}
        />

        <div className="flex gap-2">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                tab === t ? 'bg-[#FF6B35] text-white' : 'bg-[#222] text-gray-500'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === 'mission' && (
          <>
            <MissionBoard />
            <AchievementGrid achievedKeys={achievedKeys} />
          </>
        )}
        {tab === 'exchange' && <ExchangeShop />}
        {tab === 'shop' && <CoinShop />}

        <BannerAdWrapper adGroupId={getBannerAdGroupId('feed')} mode="inline" />
      </div>
    </PageLayout>
  );
}
