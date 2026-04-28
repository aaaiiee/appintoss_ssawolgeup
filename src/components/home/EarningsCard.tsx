import { formatWon } from '@/lib/calculations';
import type { User } from '@/hooks/useUser';
import { useShopStore, SHOP_ITEMS } from '@/stores/shopStore';

interface Props {
  user: User;
  todayEarned: number;
  todayCount: number;
}

export function EarningsCard({ user, todayEarned, todayCount }: Props) {
  const activeTitle = useShopStore((s) => s.activeTitle);
  const titleItem = activeTitle ? SHOP_ITEMS.find((i) => i.id === activeTitle) : null;

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">
          {'🔥'.repeat(Math.min(user.streak_days, 5))}
        </span>
        <span className="text-gray-400 text-sm">
          {user.streak_days}일 연속 출석
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-1">
        {user.nickname}{titleItem ? ` ${titleItem.emoji}${titleItem.name}` : ''}님, 오늘도 벌어볼까요?
      </p>
      <p className="text-3xl font-bold" style={{ color: '#FF6B35' }}>
        {formatWon(todayEarned)}
      </p>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span>{todayCount}/3회</span>
        <span>{Math.floor(user.quick_duration_seconds / 60)}분/회</span>
        <span>시급 {user.hourly_wage.toLocaleString()}원</span>
      </div>
    </div>
  );
}
