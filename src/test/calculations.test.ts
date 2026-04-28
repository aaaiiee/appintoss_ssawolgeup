import { describe, it, expect } from 'vitest';
import {
  calculateEarnedAmount,
  calculateCoinsEarned,
  getStreakMultiplier,
} from '@/lib/calculations';

describe('calculateEarnedAmount', () => {
  it('calculates earned amount from hourly wage and seconds', () => {
    expect(calculateEarnedAmount(25000, 300)).toBe(2083);
  });

  it('returns 0 for 0 seconds', () => {
    expect(calculateEarnedAmount(25000, 0)).toBe(0);
  });

  it('uses minimum wage when wage is 0', () => {
    expect(calculateEarnedAmount(0, 300)).toBe(821);
  });
});

describe('getStreakMultiplier', () => {
  it('returns 1.0 for 1-2 days', () => {
    expect(getStreakMultiplier(1)).toBe(1.0);
    expect(getStreakMultiplier(2)).toBe(1.0);
  });

  it('returns 1.5 for 3-6 days', () => {
    expect(getStreakMultiplier(3)).toBe(1.5);
    expect(getStreakMultiplier(6)).toBe(1.5);
  });

  it('returns 2.0 for 7-29 days', () => {
    expect(getStreakMultiplier(7)).toBe(2.0);
    expect(getStreakMultiplier(29)).toBe(2.0);
  });

  it('returns 3.0 for 30+ days', () => {
    expect(getStreakMultiplier(30)).toBe(3.0);
    expect(getStreakMultiplier(100)).toBe(3.0);
  });
});

describe('calculateCoinsEarned', () => {
  it('returns 10 for quick mode', () => {
    expect(calculateCoinsEarned('quick', 300, 1)).toBe(10);
  });

  it('applies streak multiplier for quick mode', () => {
    expect(calculateCoinsEarned('quick', 300, 5)).toBe(15);
  });

  it('calculates timer coins with duration bonus', () => {
    expect(calculateCoinsEarned('timer', 480, 1)).toBe(26);
  });

  it('applies streak multiplier for timer mode', () => {
    expect(calculateCoinsEarned('timer', 480, 7)).toBe(52);
  });
});
