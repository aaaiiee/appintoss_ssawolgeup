interface Props {
  emoji: string;
  title: string;
  subtitle: string;
  reward: string;
  progress?: { current: number; total: number };
  completed?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

export function MissionCard({
  emoji,
  title,
  subtitle,
  reward,
  progress,
  completed,
  onAction,
  actionLabel,
  disabled,
}: Props) {
  return (
    <div className="bg-[#111] rounded-xl p-3.5 flex justify-between items-center gap-3">
      <span className="text-3xl leading-none shrink-0" aria-hidden>{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold">{title}</p>
        <p className={`text-xs mt-0.5 ${completed ? 'text-green-400' : 'text-gray-500'}`}>
          {subtitle}
        </p>
        {progress && (
          <div className="bg-[#222] rounded-full h-1 w-28 mt-1.5">
            <div
              className="h-1 rounded-full"
              style={{
                width: `${Math.min((progress.current / progress.total) * 100, 100)}%`,
                backgroundColor: completed ? '#4CAF50' : '#FF6B35',
              }}
            />
          </div>
        )}
      </div>
      {onAction && !completed ? (
        <button
          onClick={onAction}
          disabled={disabled}
          className="px-3.5 py-2 rounded-lg text-white text-xs font-bold disabled:opacity-40"
          style={{ backgroundColor: disabled ? '#333' : '#FF6B35' }}
        >
          {actionLabel || reward}
        </button>
      ) : (
        <span className="bg-[#333] text-gray-500 px-3.5 py-2 rounded-lg text-xs font-bold">
          {completed ? '완료 ✓' : reward}
        </span>
      )}
    </div>
  );
}
