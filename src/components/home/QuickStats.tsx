import { formatCoins } from '@/lib/calculations';
import type { User } from '@/hooks/useUser';

interface Props {
  user: User;
  monthlyTotal: number;
}

export function QuickStats({ user, monthlyTotal }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="text-yellow-400 font-bold">{formatCoins(user.poop_coins)}</p>
        <p className="text-gray-500 text-xs">똥코인</p>
      </div>
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="text-green-400 font-bold">{user.streak_days}일</p>
        <p className="text-gray-500 text-xs">연속 출석</p>
      </div>
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="font-bold" style={{ color: '#FF6B35' }}>
          ₩{monthlyTotal.toLocaleString()}
        </p>
        <p className="text-gray-500 text-xs">이번 달</p>
      </div>
    </div>
  );
}
