// 똥코인 → 토스포인트 교환 비율: 100🪙 = 10P (1/10)
// Single source of truth — imported by both client (src/) and server (api/).

export interface ExchangeTier {
  id: string;
  coins: number;
  points: number;
  label: string;
}

export const EXCHANGE_TIERS: readonly ExchangeTier[] = [
  { id: 'tier_1k', coins: 1000, points: 100, label: '1,000🪙 → 100P' },
  { id: 'tier_3k', coins: 3000, points: 300, label: '3,000🪙 → 300P' },
  { id: 'tier_5k', coins: 5000, points: 500, label: '5,000🪙 → 500P' },
  { id: 'tier_10k', coins: 10000, points: 1000, label: '10,000🪙 → 1,000P' },
] as const;

export const MAX_EXCHANGES_PER_DAY = 1;
export const MIN_COINS_TO_EXCHANGE = 1000;

export function findTier(tierId: string): ExchangeTier | undefined {
  return EXCHANGE_TIERS.find((t) => t.id === tierId);
}
