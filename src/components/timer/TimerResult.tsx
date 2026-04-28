import { formatWon, formatCoins } from '@/lib/calculations';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { BannerAdWrapper } from '@/components/BannerAdWrapper';
import { getBannerAdGroupId } from '@/lib/adConstants';

interface Props {
  open: boolean;
  onClose: () => void;
  earnedAmount: number;
  coinsEarned: number;
  bonusCoins?: number;
  durationSeconds: number;
  streakDays: number;
  multiplier: number;
  onWatchAdAgain?: () => void | Promise<void>;
  canWatchAd?: boolean;
  isWatchingAd?: boolean;
  adViewsRemaining?: number;
}

export function TimerResult({
  open,
  onClose,
  earnedAmount,
  coinsEarned,
  bonusCoins = 0,
  durationSeconds,
  streakDays,
  multiplier,
  onWatchAdAgain,
  canWatchAd = false,
  isWatchingAd = false,
  adViewsRemaining,
}: Props) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const totalCoins = coinsEarned + bonusCoins;
  const showAdButton = !!onWatchAdAgain;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-[#111] border-[#222]">
        <DrawerHeader className="text-center">
          <div className="text-6xl mb-2">💰</div>
          <DrawerTitle className="text-white text-xl">수확 완료!</DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-4 space-y-4">
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">벌어들인 싸월급</p>
            <p className="text-3xl font-bold" style={{ color: '#FF6B35' }}>
              {formatWon(earnedAmount)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-yellow-400 font-bold">{formatCoins(totalCoins)}</p>
              <p className="text-gray-500 text-xs">획득 코인</p>
            </div>
            <div>
              <p className="text-white font-bold">
                {minutes}분 {seconds}초
              </p>
              <p className="text-gray-500 text-xs">소요 시간</p>
            </div>
            <div>
              <p className="text-green-400 font-bold">×{multiplier}</p>
              <p className="text-gray-500 text-xs">{streakDays}일 연속</p>
            </div>
          </div>

          {bonusCoins > 0 && (
            <div className="bg-[#2d2410] border border-yellow-700/50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                <div>
                  <p className="text-yellow-400 text-sm font-bold">광고 시청 보너스</p>
                  <p className="text-gray-400 text-[11px]">기본 {coinsEarned} + 보너스 {bonusCoins}</p>
                </div>
              </div>
              <p className="text-yellow-400 font-bold">+{bonusCoins} 🪙</p>
            </div>
          )}

          {showAdButton && (
            <button
              onClick={onWatchAdAgain}
              disabled={!canWatchAd || isWatchingAd}
              className="w-full py-3 rounded-xl font-bold text-white bg-[#FF6B35] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="text-xl">🎬</span>
              {isWatchingAd
                ? '광고 시청 중...'
                : adViewsRemaining === 0
                  ? '오늘 광고는 모두 시청'
                  : '광고 보고 +50 🪙 받기'}
              {adViewsRemaining !== undefined && adViewsRemaining > 0 && !isWatchingAd && (
                <span className="text-xs opacity-80">(오늘 {adViewsRemaining}회 남음)</span>
              )}
            </button>
          )}

          <BannerAdWrapper adGroupId={getBannerAdGroupId('list')} mode="inline" />
        </div>

        <DrawerFooter>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-white font-bold"
            style={{ backgroundColor: '#3182F6' }}
          >
            홈으로 돌아가기
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
