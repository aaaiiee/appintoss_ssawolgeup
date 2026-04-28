import { formatWon } from '@/lib/calculations';

interface Props {
  totalEarned: number;
  totalDays: number;
  totalSeconds: number;
}

export function MonthlySummary({ totalEarned, totalDays, totalSeconds }: Props) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="font-bold" style={{ color: '#FF6B35' }}>
          {formatWon(totalEarned)}
        </p>
        <p className="text-gray-500 text-xs">총 수익</p>
      </div>
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="text-green-400 font-bold">{totalDays}일</p>
        <p className="text-gray-500 text-xs">출석일</p>
      </div>
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="text-blue-400 font-bold">
          {hours}h {minutes}m
        </p>
        <p className="text-gray-500 text-xs">총 시간</p>
      </div>
    </div>
  );
}
