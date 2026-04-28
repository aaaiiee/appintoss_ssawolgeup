import type { RankEntry } from '@/hooks/useRanking';
import { formatDuration } from '@/lib/calculations';

interface Props {
  rankings: RankEntry[];
  startRank: number;
  currentUserId?: string;
}

export function RankingList({ rankings, startRank, currentUserId }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {rankings.map((entry, i) => {
        const rank = startRank + i;
        const isMe = !!currentUserId && entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className={`flex justify-between items-center px-3 py-2.5 rounded-lg ${
              isMe ? 'bg-[#1a2a3a] border border-[#3182F6]' : 'bg-[#111]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`text-sm w-7 shrink-0 text-center ${
                  isMe ? 'text-[#3182F6] font-bold' : 'text-gray-500'
                }`}
              >
                {rank}
              </span>
              <div className="min-w-0">
                <p className={`text-sm truncate ${isMe ? 'text-white font-bold' : 'text-gray-200'}`}>
                  {isMe && (
                    <span className="text-[10px] bg-[#3182F6] text-white rounded px-1.5 py-0.5 mr-1.5 align-middle font-bold">
                      나
                    </span>
                  )}
                  {entry.nickname}
                </p>
                <p className="text-gray-500 text-[11px]">{entry.checkInCount}회 다녀옴</p>
              </div>
            </div>
            <span className="text-sm font-bold shrink-0" style={{ color: '#FF6B35' }}>
              {formatDuration(entry.totalSeconds)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
