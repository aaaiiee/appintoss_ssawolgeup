import { Agent } from 'undici';
import crypto from 'crypto';

const TOSS_API_BASE_URL = process.env.TOSS_API_BASE_URL ?? 'https://apps-in-toss-api.toss.im';
const TOSS_API_KEY = process.env.TOSS_API_KEY;
const TOSS_DECRYPT_KEY = process.env.TOSS_DECRYPT_KEY;
const TOSS_DECRYPT_AAD = process.env.TOSS_DECRYPT_AAD;

let cachedAgent: Agent | null = null;

function getAgent(): Agent {
  if (cachedAgent) return cachedAgent;

  const certBase64 = process.env.TOSS_MTLS_CERT_BASE64;
  const keyBase64 = process.env.TOSS_MTLS_KEY_BASE64;

  if (!certBase64 || !keyBase64) {
    throw new Error('TOSS_MTLS_CERT_BASE64 / TOSS_MTLS_KEY_BASE64 not configured');
  }

  cachedAgent = new Agent({
    connect: {
      cert: Buffer.from(certBase64, 'base64').toString('utf-8'),
      key: Buffer.from(keyBase64, 'base64').toString('utf-8'),
      rejectUnauthorized: true,
    },
    keepAliveTimeout: 30_000,
    connections: 10,
  });
  return cachedAgent;
}

async function tossFetch(path: string, init: RequestInit & { body?: string } = {}): Promise<Response> {
  if (!TOSS_API_KEY) {
    throw new Error('TOSS_API_KEY not configured');
  }
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  // 토스 콘솔 가이드 확인 후 둘 중 하나로 좁힐 것 (현재 양쪽 부착으로 호환성 확보)
  headers.set('X-API-Key', TOSS_API_KEY);
  headers.set('Authorization', `Bearer ${TOSS_API_KEY}`);

  return fetch(`${TOSS_API_BASE_URL}${path}`, {
    ...init,
    headers,
    // @ts-expect-error Node.js native fetch accepts undici Dispatcher
    dispatcher: getAgent(),
  });
}

export interface TossTokens {
  accessToken: string;
  refreshToken: string;
  scope: string;
  tokenType: string;
  expiresIn: number;
}

export async function exchangeAuthorizationCode(
  authorizationCode: string,
  referrer: string,
): Promise<TossTokens> {
  const res = await tossFetch('/api-partner/v1/apps-in-toss/user/oauth2/generate-token', {
    method: 'POST',
    body: JSON.stringify({ authorizationCode, referrer }),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.resultType !== 'SUCCESS') {
    const reason = (json.error as { reason?: string } | undefined)?.reason ?? json.error ?? 'unknown';
    throw new Error(`Toss token exchange failed: ${reason}`);
  }
  return json.success as TossTokens;
}

const SENSITIVE_KEYS = ['name', 'phone', 'birthday', 'ci', 'gender', 'nationality', 'email'] as const;
type SensitiveKey = (typeof SENSITIVE_KEYS)[number];

export interface TossLoginMe {
  userKey: number;
  scope: string;
  agreedTerms?: string[];
  name?: string;
  phone?: string;
  birthday?: string;
  ci?: string;
  gender?: string;
  nationality?: string;
  email?: string;
}

export interface FetchLoginMeOptions {
  decryptSensitive?: boolean;
}

export async function fetchLoginMe(
  accessToken: string,
  options: FetchLoginMeOptions = {},
): Promise<TossLoginMe> {
  const res = await fetch(`${TOSS_API_BASE_URL}/api-partner/v1/apps-in-toss/user/oauth2/login-me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
    // @ts-expect-error undici dispatcher
    dispatcher: getAgent(),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`Toss login-me failed: ${JSON.stringify(json)}`);
  }
  const success = (json.success ?? json) as TossLoginMe;
  return options.decryptSensitive === false ? success : decryptSensitiveFields(success);
}

/** AES-256-GCM. 토스 암호화 필드 형식: base64(IV(12) + ciphertext + AuthTag(16)). */
export function decryptUserField(encryptedBase64: string): string {
  if (!TOSS_DECRYPT_KEY || !TOSS_DECRYPT_AAD) {
    throw new Error('TOSS_DECRYPT_KEY / TOSS_DECRYPT_AAD not configured');
  }
  const data = Buffer.from(encryptedBase64, 'base64');
  const iv = data.subarray(0, 12);
  const tag = data.subarray(data.length - 16);
  const ciphertext = data.subarray(12, data.length - 16);

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(TOSS_DECRYPT_KEY, 'base64'),
    iv,
  );
  decipher.setAAD(Buffer.from(TOSS_DECRYPT_AAD, 'utf-8'));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf-8');
}

function decryptSensitiveFields(me: TossLoginMe): TossLoginMe {
  const result = { ...me };
  for (const key of SENSITIVE_KEYS) {
    decryptIfPresent(result, key);
  }
  return result;
}

function decryptIfPresent(target: TossLoginMe, key: SensitiveKey): void {
  const value = target[key];
  if (typeof value !== 'string' || value.length === 0) return;
  try {
    target[key] = decryptUserField(value);
  } catch (error) {
    console.error(`[toss-mtls] decrypt failed for ${key}:`, error);
    target[key] = undefined;
  }
}
