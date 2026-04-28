type Environment = 'toss' | 'web';

let cachedEnv: Environment | null = null;

// 백엔드 미배포 환경(VITE_API_URL 없음)에서는 로그인만 mock으로 우회.
// 광고/공유 등 다른 SDK는 토스 WebView에서 그대로 사용한다.
const USE_LOGIN_MOCK = import.meta.env.DEV || !import.meta.env.VITE_API_URL;

export async function getEnvironment(): Promise<Environment> {
  if (cachedEnv) return cachedEnv;

  if (import.meta.env.DEV) {
    cachedEnv = 'web';
    return 'web';
  }

  try {
    const sdk = (await import('@apps-in-toss/web-framework')) as unknown as {
      getOperationalEnvironment: () => 'toss' | 'sandbox';
    };
    const env = sdk.getOperationalEnvironment();
    cachedEnv = env === 'toss' || env === 'sandbox' ? 'toss' : 'web';
  } catch {
    cachedEnv = 'web';
  }
  return cachedEnv;
}

export const TOSS_REFERRER = {
  DEFAULT: 'DEFAULT',
  SANDBOX: 'SANDBOX',
} as const;
export type TossReferrer = (typeof TOSS_REFERRER)[keyof typeof TOSS_REFERRER];

export interface TossLoginResult {
  authorizationCode: string;
  referrer: TossReferrer | string;
}

export const MOCK_AUTHORIZATION_CODE = 'mock-authorization-code';

export async function tossLogin(): Promise<TossLoginResult | null> {
  if (USE_LOGIN_MOCK) {
    return { authorizationCode: MOCK_AUTHORIZATION_CODE, referrer: TOSS_REFERRER.SANDBOX };
  }

  try {
    const { appLogin } = await import('@apps-in-toss/web-framework');
    const result = (await appLogin()) as { authorizationCode?: string; referrer?: string };
    if (!result.authorizationCode) return null;
    return {
      authorizationCode: result.authorizationCode,
      referrer: result.referrer ?? TOSS_REFERRER.DEFAULT,
    };
  } catch {
    return null;
  }
}

export async function tossShare(message: string): Promise<boolean> {
  const env = await getEnvironment();

  if (env === 'web') {
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(message);
      }
    } catch {
      // 사용자가 다이얼로그 닫음 — 시도했으므로 보상은 지급
    }
    return true;
  }

  try {
    const sdk = await import('@apps-in-toss/web-framework');
    const link = await sdk.getTossShareLink('/');
    await sdk.share({ message: `${message}\n${link}` });
    return true;
  } catch (error) {
    console.error('[tossShare] failed:', error);
    return false;
  }
}
