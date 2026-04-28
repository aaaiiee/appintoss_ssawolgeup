export const MINIMUM_WAGE = 9860; // 2026 최저시급 (원)
export const MAX_DAILY_CHECK_INS = 3;
export const MAX_DAILY_AD_VIEWS = 3;
export const MAX_DAILY_SHARES = 1;
export const TIMER_MAX_SECONDS = 30 * 60; // 30분 자동 종료

export const QUICK_CHECK_IN_BASE_COINS = 10;
export const TIMER_BASE_COINS = 10;
export const TIMER_PER_MINUTE_COINS = 2;

export const AD_REWARD_COINS = 50;
export const SHARE_REWARD_COINS = 100;

export const STREAK_MULTIPLIERS = [
  { minDays: 30, multiplier: 3.0 },
  { minDays: 7, multiplier: 2.0 },
  { minDays: 3, multiplier: 1.5 },
  { minDays: 1, multiplier: 1.0 },
] as const;

export const BRAND = {
  name: '싸월급',
  primaryColor: '#FF6B35',
  tossBlue: '#3182F6',
  slogan: '회사 화장실에서 월급을 번다',
} as const;

export const TAB_ITEMS = [
  { path: '/home', label: '홈', emoji: '🏠' },
  { path: '/stats', label: '통계', emoji: '📊' },
  { path: '/ranking', label: '랭킹', emoji: '🏆' },
  { path: '/reward', label: '리워드', emoji: '🎁' },
] as const;
