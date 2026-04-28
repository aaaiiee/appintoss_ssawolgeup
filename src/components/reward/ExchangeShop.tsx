import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import { useExchange, type ExchangeTier, MAX_EXCHANGES_PER_DAY } from '@/hooks/useExchange';
import { ExchangeModal } from './ExchangeModal';

export function ExchangeShop() {
  const { user } = useUser();
  const { exchangeCoinsToPoints, isExchanging, tiers } = useExchange();
  const [selectedTier, setSelectedTier] = useState<ExchangeTier | null>(null);

  if (!user) return null;

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
  const exchangesToday =
    user.last_exchange_date === todayStr ? user.exchanges_today ?? 0 : 0;
  const limitReached = exchangesToday >= MAX_EXCHANGES_PER_DAY;

  const handleSelect = (tier: ExchangeTier) => {
    if (limitReached) {
      toast.error('오늘 교환 한도를 모두 사용했어요');
      return;
    }
    if (user.poop_coins < tier.coins) {
      toast.error(`코인이 부족해요 (보유 ${user.poop_coins}🪙, 필요 ${tier.coins}🪙)`);
      return;
    }
    setSelectedTier(tier);
  };

  const handleConfirm = async () => {
    if (!selectedTier) return;
    try {
      const result = await exchangeCoinsToPoints(selectedTier.id);
      if (result?.status === 'completed') {
        toast.success(`🎉 ${result.pointsGranted}P 교환 완료!`);
      } else if (result?.status === 'pending') {
        toast.info('교환이 진행 중입니다. 잠시 후 반영돼요.');
      } else {
        toast.error(result?.message ?? '교환에 실패했어요');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '교환에 실패했어요');
    } finally {
      setSelectedTier(null);
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-base font-bold">
            <span className="text-xl mr-1">💱</span>포인트 교환
          </p>
          <p className="text-xs text-gray-500">
            오늘 {exchangesToday}/{MAX_EXCHANGES_PER_DAY}회
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {tiers.map((tier) => {
            const affordable = user.poop_coins >= tier.coins;
            const disabled = limitReached || !affordable || isExchanging;
            return (
              <button
                key={tier.id}
                onClick={() => handleSelect(tier)}
                disabled={disabled}
                className={`bg-[#111] rounded-xl p-4 flex justify-between items-center text-left transition-opacity ${
                  disabled ? 'opacity-50' : 'active:opacity-80'
                }`}
              >
                <div>
                  <p className="text-white text-sm font-bold">{tier.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {affordable ? '교환 가능' : `${tier.coins - user.poop_coins}🪙 부족`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#3182F6] font-bold">+{tier.points}P</span>
                  <span className="text-gray-500 text-xs">›</span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-600 mt-3 leading-relaxed">
          · 교환 비율: 100🪙 = 10P
          <br />· 하루 최대 {MAX_EXCHANGES_PER_DAY}회 교환 가능
          <br />· 교환된 포인트는 토스 앱에서 사용할 수 있어요
        </p>
      </div>

      <ExchangeModal
        open={selectedTier !== null}
        tier={selectedTier}
        isLoading={isExchanging}
        onConfirm={handleConfirm}
        onCancel={() => setSelectedTier(null)}
      />
    </>
  );
}
