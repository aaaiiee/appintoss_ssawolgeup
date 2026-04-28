import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EXCHANGE_TIERS, MAX_EXCHANGES_PER_DAY } from '@/lib/exchangeTiers';
import type { ExchangeTier } from '@/lib/exchangeTiers';

export { EXCHANGE_TIERS, MAX_EXCHANGES_PER_DAY };
export type { ExchangeTier };

interface GetKeyResponse {
  exchangeKey: string;
  tier: { id: string; coins: number; points: number };
  mode: 'mock' | 'production';
  expiresInSeconds: number;
}

interface ExecuteResponse {
  status: 'completed' | 'pending' | 'failed';
  coinsSpent?: number;
  pointsGranted?: number;
  mode: 'mock' | 'production';
  promotionRequestId?: string;
  message?: string;
}

interface ResultResponse {
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'not_found';
  coinsSpent?: number;
  pointsGranted?: number;
  mode?: 'mock' | 'production';
  errorMessage?: string;
  completedAt?: string;
}

export function useExchange() {
  const queryClient = useQueryClient();
  const [isExchanging, setIsExchanging] = useState(false);

  /**
   * 3-step exchange: getKey → execute → (poll result if production).
   * Returns final status.
   */
  const exchangeCoinsToPoints = useCallback(
    async (tierId: string): Promise<ExecuteResponse | null> => {
      setIsExchanging(true);
      try {
        const { exchangeKey, mode } = await api.post<GetKeyResponse>(
          '/api/promotion/getKey',
          { tierId },
        );

        const executeResult = await api.post<ExecuteResponse>(
          '/api/promotion/execute',
          { exchangeKey },
        );

        // Production: poll until done (max 10s)
        if (mode === 'production' && executeResult.status === 'pending') {
          const final = await pollResult(exchangeKey);
          await queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
          return {
            status: final.status === 'completed' ? 'completed' : 'failed',
            coinsSpent: final.coinsSpent,
            pointsGranted: final.pointsGranted,
            mode: 'production',
            message: final.errorMessage,
          };
        }

        await queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        return executeResult;
      } finally {
        setIsExchanging(false);
      }
    },
    [queryClient],
  );

  return { exchangeCoinsToPoints, isExchanging, tiers: EXCHANGE_TIERS };
}

async function pollResult(exchangeKey: string): Promise<ResultResponse> {
  const start = Date.now();
  const timeoutMs = 10000;
  const intervalMs = 1000;

  while (Date.now() - start < timeoutMs) {
    const result = await api.get<ResultResponse>(
      `/api/promotion/result?exchangeKey=${encodeURIComponent(exchangeKey)}`,
    );
    if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
      return result;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { status: 'failed', errorMessage: 'Timeout waiting for exchange' };
}
