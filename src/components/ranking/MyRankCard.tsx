import type { RankEntry } from '@/hooks/useRanking';
import { formatDuration } from '@/lib/calculations';

interface Props {
  rank: number;
  entry: RankEntry;
}

export function MyRankCard({ rank, entry }: Props) {
  return (
    <div className="bg-[#1a2a3a] border border-[#3182F6] rounded-xl p-3 flex justify-between items-center">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[#3182F6] font-bold text-lg shrink-0">#{rank}</span>
        <div className="min-w-0">
          <p className="text-white text-sm font-bold truncate">나 ({entry.nickname})</p>
          <p className="text-gray-500 text-xs">{entry.checkInCount}회 다녀옴</p>
        </div>
      </div>
      <span className="font-bold text-base shrink-0" style={{ color: '#FF6B35' }}>
        {formatDuration(entry.totalSeconds)}
      </span>
    </div>
  );
}
