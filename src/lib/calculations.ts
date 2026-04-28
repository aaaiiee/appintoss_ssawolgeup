import {
  MINIMUM_WAGE,
  STREAK_MULTIPLIERS,
  QUICK_CHECK_IN_BASE_COINS,
  TIMER_BASE_COINS,
  TIMER_PER_MINUTE_COINS,
} from './constants';

export function calculateEarnedAmount(
  hourlyWage: number,
  durationSeconds: number
): number {
  const wage = hourlyWage > 0 ? hourlyWage : MINIMUM_WAGE;
  return Math.floor((wage / 3600) * durationSeconds);
}

export function getStreakMultiplier(streakDays: number): number {
  for (const { minDays, multiplier } of STREAK_MULTIPLIERS) {
    if (streakDays >= minDays) return multiplier;
  }
  return 1.0;
}

export function calculateCoinsEarned(
  mode: 'quick' | 'timer',
  durationSeconds: number,
  streakDays: number
): number {
  const multiplier = getStreakMultiplier(streakDays);

  if (mode === 'quick') {
    return Math.floor(QUICK_CHECK_IN_BASE_COINS * multiplier);
  }

  const minutes = Math.floor(durationSeconds / 60);
  const baseCoins = TIMER_BASE_COINS + minutes * TIMER_PER_MINUTE_COINS;
  return Math.floor(baseCoins * multiplier);
}

export function getPerSecondRate(hourlyWage: number): number {
  const wage = hourlyWage > 0 ? hourlyWage : MINIMUM_WAGE;
  return wage / 3600;
}

export function formatWon(amount: number): string {
  return `₩ ${amount.toLocaleString('ko-KR')}`;
}

export function formatCoins(coins: number): string {
  return `${coins.toLocaleString('ko-KR')} 🪙`;
}

/**
 * 초를 사람이 읽기 좋은 시간 문자열로 변환.
 *   3625 → "1시간 0분"
 *    432 → "7분"
 *      0 → "0분"
 */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}시간 ${mins}분`;
}
