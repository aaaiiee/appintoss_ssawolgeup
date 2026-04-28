import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getEnvironment } from '@/lib/sdk';
import { getFullScreenAdGroupId } from '@/lib/adConstants';
import { api } from '@/lib/api';

const REWARDED_AD_GROUP_ID = getFullScreenAdGroupId('rewarded');

interface AdRewardResponse {
  coinsEarned: number;
  adViewsRemaining: number;
}

/**
 * /api/reward/ad 호출 with retry — 광고를 끝까지 봤는데 네트워크 일시 오류로
 * 보상이 누락되는 케이스 방지 (3회 시도, 지수 백오프).
 * 4xx 응답(일일 한도/인증 실패)은 재시도하지 않음.
 */
async function postAdRewardWithRetry(): Promise<AdRewardResponse> {
  const maxAttempts = 3;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await api.post<AdRewardResponse>('/api/reward/ad', {});
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : '';
      // 일일 한도 초과나 인증 실패는 재시도 무의미
      if (msg.includes('오늘 광고') || msg.includes('한도') || msg.includes('Unauthorized') || msg.includes('Invalid')) {
        throw error;
      }
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }
  throw lastError;
}

// SDK event shape (loose, official types vary by SDK minor versions)
type AdEvent =
  | { type: 'loaded' }
  | { type: 'show' }
  | { type: 'dismissed' }
  | { type: 'failedToLoad'; error?: unknown }
  | { type: 'failedToShow'; error?: unknown }
  | { type: 'userEarnedReward'; data?: { unitType?: string; unitAmount?: number } }
  | { type: string; data?: unknown; error?: unknown };

export function useReward() {
  const queryClient = useQueryClient();
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);
  const [isAdShowing, setIsAdShowing] = useState(false);
  const loadCleanupRef = useRef<(() => void) | undefined>(undefined);
  const showCleanupRef = useRef<(() => void) | undefined>(undefined);
  const rewardResolveRef = useRef<((value: AdRewardResponse | null) => void) | null>(null);
  const mountedRef = useRef(true);

  /** 보상 적립 성공 시 사용자 잔액/통계 캐시 무효화 → UI 즉시 갱신 */
  const invalidateUserCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  }, [queryClient]);

  const loadAd = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsAdLoading(true);
    setIsAdReady(false);
    const env = await getEnvironment();

    if (env === 'web') {
      await new Promise((r) => setTimeout(r, 500));
      if (!mountedRef.current) return;
      setIsAdLoading(false);
      setIsAdReady(true);
      return;
    }

    try {
      const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');
      if (loadFullScreenAd.isSupported() !== true) {
        console.warn('[RewardedAd] loadFullScreenAd not supported — Toss app 5.227.0+ required');
        setIsAdLoading(false);
        return;
      }

      loadCleanupRef.current?.();
      const cleanup = loadFullScreenAd({
        options: { adGroupId: REWARDED_AD_GROUP_ID },
        onEvent: (event: AdEvent) => {
          if (event.type === 'loaded') {
            if (!mountedRef.current) return;
            setIsAdLoading(false);
            setIsAdReady(true);
          }
        },
        onError: (error: unknown) => {
          console.error('[RewardedAd] load error:', error);
          if (!mountedRef.current) return;
          setIsAdLoading(false);
          setIsAdReady(false);
        },
      });
      loadCleanupRef.current = cleanup;
    } catch (error) {
      console.error('[RewardedAd] load failed:', error);
      if (!mountedRef.current) return;
      setIsAdLoading(false);
    }
  }, []);

  const showAdAndClaim = useCallback(async (): Promise<{
    coinsEarned: number;
    adViewsRemaining: number;
  } | null> => {
    if (!isAdReady) return null;
    setIsAdShowing(true);
    setIsAdReady(false);
    const env = await getEnvironment();

    // Web mock: immediate reward + reload
    if (env === 'web') {
      await new Promise((r) => setTimeout(r, 800));
      setIsAdShowing(false);
      try {
        const result = await postAdRewardWithRetry();
        invalidateUserCache();
        loadAd();
        return result;
      } catch (error) {
        console.error('[RewardedAd] reward api failed (web mock):', error);
        loadAd();
        return null;
      }
    }

    try {
      const { showFullScreenAd } = await import('@apps-in-toss/web-framework');
      if (showFullScreenAd.isSupported() !== true) {
        console.warn('[RewardedAd] showFullScreenAd not supported');
        setIsAdShowing(false);
        return null;
      }

      return new Promise((resolve) => {
        rewardResolveRef.current = resolve;
        let rewardGranted = false;

        const cleanup = showFullScreenAd({
          options: { adGroupId: REWARDED_AD_GROUP_ID },
          onEvent: async (event: AdEvent) => {
            if (event.type === 'show') {
              // App sound pause hook could go here (future)
              console.log('[RewardedAd] show');
            }
            if (event.type === 'userEarnedReward') {
              rewardGranted = true;
              try {
                const result = await postAdRewardWithRetry();
                invalidateUserCache();
                if (mountedRef.current) {
                  rewardResolveRef.current?.(result);
                  rewardResolveRef.current = null;
                }
              } catch (error) {
                console.error('[RewardedAd] reward api failed (Toss):', error);
                if (mountedRef.current) {
                  rewardResolveRef.current?.(null);
                  rewardResolveRef.current = null;
                }
              }
            }
            if (event.type === 'dismissed' || event.type === 'failedToShow') {
              if (mountedRef.current) {
                setIsAdShowing(false);
                loadAd();
                if (!rewardGranted) {
                  rewardResolveRef.current?.(null);
                  rewardResolveRef.current = null;
                }
              }
            }
          },
          onError: (error: unknown) => {
            console.error('[RewardedAd] show error:', error);
            if (mountedRef.current) {
              setIsAdShowing(false);
              loadAd();
              rewardResolveRef.current?.(null);
              rewardResolveRef.current = null;
            }
          },
        });
        showCleanupRef.current = cleanup;
      });
    } catch (error) {
      console.error('[RewardedAd] show failed:', error);
      setIsAdShowing(false);
      loadAd();
      return null;
    }
  }, [isAdReady, loadAd, invalidateUserCache]);

  const claimShareReward = useCallback(async () => {
    const result = await api.post<{ coinsEarned: number }>('/api/reward/share', {});
    invalidateUserCache();
    return result;
  }, [invalidateUserCache]);

  useEffect(() => {
    mountedRef.current = true;
    loadAd();
    return () => {
      mountedRef.current = false;
      loadCleanupRef.current?.();
      showCleanupRef.current?.();
      rewardResolveRef.current?.(null);
      rewardResolveRef.current = null;
    };
  }, [loadAd]);

  return { isAdLoading, isAdReady, isAdShowing, showAdAndClaim, claimShareReward, loadAd };
}
