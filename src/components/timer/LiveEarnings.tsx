import { formatWon, getPerSecondRate } from '@/lib/calculations';

interface Props {
  elapsedSeconds: number;
  hourlyWage: number;
}

export function LiveEarnings({ elapsedSeconds, hourlyWage }: Props) {
  const perSecond = getPerSecondRate(hourlyWage);
  const currentEarnings = Math.floor(perSecond * elapsedSeconds);

  return (
    <div className="bg-gradient-to-br from-[#1a2a1a] to-[#1a3a2a] rounded-2xl p-6 text-center">
      <p className="text-gray-400 text-sm mb-1">지금까지 번 돈</p>
      <p className="text-4xl font-bold" style={{ color: '#FF6B35' }}>
        {formatWon(currentEarnings)}
      </p>
      <p className="text-gray-500 text-xs mt-2">
        시급 {hourlyWage.toLocaleString()}원 기준 · 초당 {perSecond.toFixed(1)}원
      </p>
    </div>
  );
}
