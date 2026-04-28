import type { RankEntry } from '@/hooks/useRanking';
import { formatDuration } from '@/lib/calculations';

interface Props {
  top3: RankEntry[];
  currentUserId?: string;
}

const MEDALS = ['👑', '🥈', '🥉'];

export function TopThreePodium({ top3, currentUserId }: Props) {
  if (top3.length === 0) return null;

  return (
    <div className="flex justify-center items-end gap-3 mb-5">
      {[1, 0, 2].map((idx) => {
        const entry = top3[idx];
        if (!entry) return null;
        const isFirst = idx === 0;
        const isMe = !!currentUserId && entry.userId === currentUserId;
        return (
          <div key={idx} className="text-center">
            <div className={isFirst ? 'text-3xl' : 'text-2xl'}>{MEDALS[idx]}</div>
            <div
              className={`rounded-xl p-3 min-w-[88px] relative ${
                isMe
                  ? 'bg-[#1a2a3a] border-2 border-[#3182F6]'
                  : isFirst
                    ? 'bg-gradient-to-b from-[#2d2d1a] to-[#111] border border-yellow-600'
                    : 'bg-[#1a1a2e]'
              }`}
            >
              {isMe && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-[#3182F6] text-white rounded px-1.5 py-0.5 font-bold">
                  나
                </span>
              )}
              <p
                className={`text-sm font-bold truncate ${
                  isMe ? 'text-white' : isFirst ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                {entry.nickname}
              </p>
              <p className="font-bold text-sm" style={{ color: '#FF6B35' }}>
                {formatDuration(entry.totalSeconds)}
              </p>
              <p className="text-gray-500 text-xs">{entry.checkInCount}회</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
