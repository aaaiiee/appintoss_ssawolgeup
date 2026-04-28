import { useCallback, useEffect, useRef, useState } from 'react';
import { getEnvironment } from '@/lib/sdk';

// Module-level singleton — SDK initializes once per app session
let initializationPromise: Promise<boolean> | null = null;
let isSdkInitialized = false;

type AttachOptions = {
  theme?: 'auto' | 'light' | 'dark';
  tone?: 'blackAndWhite' | 'grey';
  variant?: 'card' | 'expanded';
  callbacks?: {
    onAdRendered?: (p: { slotId: string }) => void;
    onAdViewable?: (p: { slotId: string }) => void;
    onAdImpression?: (p: { slotId: string }) => void;
    onAdClicked?: (p: { slotId: string }) => void;
    onNoFill?: (p: { slotId: string }) => void;
    onAdFailedToRender?: (p: { slotId: string; error: { message: string } }) => void;
  };
};

type AttachedBanner = { destroy: () => void };

async function initializeTossAds(): Promise<boolean> {
  if (isSdkInitialized) return true;
  if (initializationPromise) return initializationPromise;

  const env = await getEnvironment();
  if (env === 'web') return false;

  initializationPromise = (async () => {
    try {
      const { TossAds } = await import('@apps-in-toss/web-framework');
      if (TossAds.initialize.isSupported() !== true) {
        console.warn('[TossAds] initialize not supported');
        return false;
      }

      return await new Promise<boolean>((resolve) => {
        TossAds.initialize({
          callbacks: {
            onInitialized: () => {
              console.log('[TossAds] SDK initialized');
              isSdkInitialized = true;
              resolve(true);
            },
            onInitializationFailed: (error: unknown) => {
              console.error('[TossAds] SDK init failed:', error);
              resolve(false);
            },
          },
        });
      });
    } catch (error) {
      console.error('[TossAds] dynamic import failed:', error);
      return false;
    }
  })();

  return initializationPromise;
}

export function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(isSdkInitialized);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    initializeTossAds().then((ok) => {
      if (mountedRef.current && ok) setIsInitialized(true);
    });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const attachBanner = useCallback(
    async (
      adGroupId: string,
      element: HTMLElement,
      options?: AttachOptions,
    ): Promise<AttachedBanner | null> => {
      if (!isInitialized) return null;
      try {
        const { TossAds } = await import('@apps-in-toss/web-framework');
        if (TossAds.attachBanner?.isSupported?.() !== true) {
          console.warn('[TossAds] attachBanner not supported');
          return null;
        }
        // @ts-expect-error SDK attachBanner type is loose at this site
        return TossAds.attachBanner(adGroupId, element, options);
      } catch (error) {
        console.error('[TossAds] attachBanner failed:', error);
        return null;
      }
    },
    [isInitialized],
  );

  return { isInitialized, attachBanner };
}

/** Call on route unmount or app teardown if needed. */
export async function destroyAllBanners(): Promise<void> {
  if (!isSdkInitialized) return;
  try {
    const { TossAds } = await import('@apps-in-toss/web-framework');
    if (TossAds.destroyAll?.isSupported?.() === true) {
      TossAds.destroyAll();
    }
  } catch {
    // noop
  }
}
