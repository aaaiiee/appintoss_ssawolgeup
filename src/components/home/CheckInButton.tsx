import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useShopStore, SHOP_ITEMS } from '@/stores/shopStore';
import { toast } from 'sonner';
import { formatWon, formatCoins } from '@/lib/calculations';

export function CheckInButton() {
  const { checkIn, isChecking } = useCheckIn();
  const navigate = useNavigate();
  const activeSkin = useShopStore((s) => s.activeSkin);
  const skinItem = SHOP_ITEMS.find((i) => i.id === activeSkin);
  const skinEmoji = skinItem ? skinItem.emoji : '💩';

  const handleQuickCheckIn = useCallback(async () => {
    try {
      const result = await checkIn({ mode: 'quick' });
      toast.success(
        `${formatWon(result.stats.earnedAmount)} 벌었다! ${formatCoins(result.stats.coinsEarned)} 획득`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '체크인에 실패했습니다'
      );
    }
  }, [checkIn]);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => navigate('/timer')}
        className="w-full rounded-2xl p-5 text-white font-bold text-lg active:scale-95 transition-transform"
        style={{ backgroundColor: '#3182F6' }}
      >
        <div className="text-5xl mb-1 leading-none">{skinEmoji}</div>
        <div>지금 싸러 가기</div>
        <div className="text-xs font-normal opacity-70 mt-1">
          타이머로 정확하게 기록
        </div>
      </button>

      <button
        onClick={handleQuickCheckIn}
        disabled={isChecking}
        className="w-full rounded-xl py-3 text-white font-bold text-sm bg-[#222] active:bg-[#333] disabled:opacity-50 transition-colors"
      >
        {isChecking ? '기록 중...' : '⚡ 원탭 체크인 (5분)'}
      </button>
    </div>
  );
}
