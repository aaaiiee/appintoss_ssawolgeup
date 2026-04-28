export interface AchievementDef {
  key: string;
  emoji: string;
  name: string;
  description: string;
  reward: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_check_in', emoji: '💩', name: '첫 출석', description: '첫 체크인', reward: 100 },
  { key: 'streak_3', emoji: '🔥', name: '3일 연속', description: '연속 3일 출석', reward: 200 },
  { key: 'streak_7', emoji: '⚡', name: '7일 연속', description: '연속 7일 출석', reward: 500 },
  { key: 'streak_30', emoji: '👑', name: '30일 연속', description: '연속 30일 출석', reward: 2000 },
  { key: 'total_100', emoji: '💯', name: '100회 달성', description: '총 100회 체크인', reward: 2000 },
  { key: 'ad_king', emoji: '🎬', name: '광고왕', description: '광고 50회 시청', reward: 1000 },
  { key: 'social_butterfly', emoji: '📤', name: '인싸', description: '공유 10회', reward: 500 },
  { key: 'millionaire', emoji: '💰', name: '백만장자', description: '누적 수익 100만원', reward: 5000 },
];

export function getAchievementByKey(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
