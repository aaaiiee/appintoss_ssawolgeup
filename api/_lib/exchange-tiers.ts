// Server-side re-export of the canonical exchange tier definitions.
// Single source of truth lives at src/lib/exchangeTiers.ts.

export {
  EXCHANGE_TIERS,
  MAX_EXCHANGES_PER_DAY,
  MIN_COINS_TO_EXCHANGE,
  findTier,
} from '../../src/lib/exchangeTiers';
export type { ExchangeTier } from '../../src/lib/exchangeTiers';
