import { useEffect, useRef } from 'react';
import { useTossBanner } from '@/hooks/useTossBanner';

interface BannerAdWrapperProps {
  adGroupId: string;
  /** 'fixed' = 96px height, 'inline' = SDK auto-size */
  mode?: 'fixed' | 'inline';
  theme?: 'auto' | 'light' | 'dark';
  tone?: 'blackAndWhite' | 'grey';
  variant?: 'card' | 'expanded';
  className?: string;
}

export function BannerAdWrapper({
  adGroupId,
  mode = 'fixed',
  theme = 'dark',
  tone = 'blackAndWhite',
  variant = 'expanded',
  className,
}: BannerAdWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    if (!isInitialized || !containerRef.current) return;

    let attached: { destroy: () => void } | null = null;
    let cancelled = false;
    const el = containerRef.current;

    console.log(`[BannerAd:${adGroupId}] attaching...`);

    attachBanner(adGroupId, el, {
      theme,
      tone,
      variant,
      callbacks: {
        onAdRendered: (p) => console.log(`[BannerAd:${adGroupId}] ✅ rendered`, p.slotId),
        onAdViewable: (p) => console.log(`[BannerAd:${adGroupId}] 👁 viewable`, p.slotId),
        onAdImpression: (p) => console.log(`[BannerAd:${adGroupId}] 💰 impression`, p.slotId),
        onAdClicked: (p) => console.log(`[BannerAd:${adGroupId}] 🖱 clicked`, p.slotId),
        onNoFill: (p) => console.warn(`[BannerAd:${adGroupId}] ⚠️ no fill`, p.slotId),
        onAdFailedToRender: (p) =>
          console.error(`[BannerAd:${adGroupId}] ❌ render failed:`, p.error.message),
      },
    }).then((result) => {
      if (cancelled) {
        result?.destroy();
        return;
      }
      attached = result;
    });

    return () => {
      cancelled = true;
      attached?.destroy();
    };
  }, [isInitialized, adGroupId, theme, tone, variant, attachBanner]);

  // DEV(npm run dev) 전용 placeholder — production 빌드(ait/vercel)에선 항상 실 SDK 컨테이너 렌더
  if (import.meta.env.DEV) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: mode === 'fixed' ? 96 : 80,
          backgroundColor: '#1A1A1A',
          border: '1px dashed #333',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: 11,
          letterSpacing: 0.5,
        }}
      >
        📢 Banner Ad ({adGroupId.slice(-8)}) — DEV
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: mode === 'fixed' ? '96px' : undefined,
        minHeight: mode === 'inline' ? 50 : undefined,
      }}
    />
  );
}
