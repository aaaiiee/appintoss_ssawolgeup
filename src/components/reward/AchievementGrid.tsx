import { ACHIEVEMENTS } from '@/lib/achievements';

interface Props {
  achievedKeys: string[];
}

export function AchievementGrid({ achievedKeys }: Props) {
  const achievedSet = new Set(achievedKeys);

  return (
    <div>
      <p className="text-white text-base font-bold mb-2">
        <span className="text-xl mr-1">🏅</span>업적
      </p>
      <div className="flex gap-2 flex-wrap">
        {ACHIEVEMENTS.map((a) => {
          const achieved = achievedSet.has(a.key);
          return (
            <div
              key={a.key}
              className={`rounded-xl p-2.5 text-center w-20 ${
                achieved ? 'bg-[#2d2d1a]' : 'bg-[#1a1a1a]'
              }`}
            >
              <div className={`text-3xl ${achieved ? '' : 'grayscale opacity-40'}`}>
                {a.emoji}
              </div>
              <p className={`text-[10px] font-bold mt-1 ${achieved ? 'text-yellow-400' : 'text-gray-600'}`}>
                {a.name}
              </p>
              <p className={`text-[9px] ${achieved ? 'text-green-400' : 'text-gray-600'}`}>
                {achieved ? '달성!' : a.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
