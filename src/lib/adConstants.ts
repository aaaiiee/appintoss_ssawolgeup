// AppsInToss Ad Group IDs — production only.
// 토스 출시 검수에서 테스트 ID 잔존 시 반려되므로, 빌드 결과물에 PROD ID만 포함되도록 함.
//
// 콘솔에서 발급: https://developers-apps-in-toss.toss.im → 워크스페이스 → 미니앱 → 광고
// 형식: ait.v2.live.XXXXXXXXXXXX

// ── Banner (TossAds v2) ─────────────────────────────────────────────
// text  = 텍스트형 배너  → Home / Settings / TimerResult 등
// image = 네이티브 이미지 → Stats / Ranking / Reward 등
export const BANNER_AD_TEXT = (import.meta.env.VITE_BANNER_AD_TEXT_ID ?? '') as string;
export const BANNER_AD_IMAGE = (import.meta.env.VITE_BANNER_AD_IMAGE_ID ?? '') as string;

// ── Fullscreen (InApp Ad 2.0 ver2) ─────────────────────────────────
export const REWARDED_AD = (import.meta.env.VITE_REWARDED_AD_GROUP_ID ?? '') as string;
export const INTERSTITIAL_AD = (import.meta.env.VITE_INTERSTITIAL_AD_GROUP_ID ?? '') as string;

/**
 * 'list' / 'feed' 변종은 기존 호출처 호환을 위해 유지하되,
 * 내부적으로 PROD 환경변수만 매핑한다.
 */
export function getBannerAdGroupId(variant: 'list' | 'feed' = 'list'): string {
  return variant === 'feed' ? BANNER_AD_IMAGE : BANNER_AD_TEXT;
}

export function getFullScreenAdGroupId(kind: 'rewarded' | 'interstitial' = 'rewarded'): string {
  return kind === 'interstitial' ? INTERSTITIAL_AD : REWARDED_AD;
}
