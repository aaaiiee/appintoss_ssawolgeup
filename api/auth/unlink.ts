import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { supabase } from '../_lib/supabase';

const VALID_REFERRERS = ['UNLINK', 'WITHDRAWAL_TERMS', 'WITHDRAWAL_TOSS'] as const;
type UnlinkReferrer = (typeof VALID_REFERRERS)[number];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!verifyBasicAuth(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userKey = pickParam(req, 'userKey');
  if (!userKey) {
    return res.status(400).json({ message: 'userKey required' });
  }

  const referrer = normalizeReferrer(pickParam(req, 'referrer'));

  try {
    if (referrer === 'WITHDRAWAL_TOSS') {
      // CASCADE: check_ins / rewards / achievements / point_exchanges 함께 삭제
      await supabase.from('users').delete().eq('toss_user_id', userKey);
    } else {
      // 이용약관 제21조 2항: 분쟁 대응을 위한 식별값은 분리 보관 가능 — 닉네임만 익명화
      await supabase
        .from('users')
        .update({ nickname: '탈퇴한사용자', updated_at: new Date().toISOString() })
        .eq('toss_user_id', userKey);
    }

    console.log(`[unlink] userKey=${userKey} referrer=${referrer} processed`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[unlink] error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function verifyBasicAuth(req: VercelRequest): boolean {
  const expected = process.env.TOSS_UNLINK_CALLBACK_AUTH;
  if (!expected) {
    console.error('[unlink] TOSS_UNLINK_CALLBACK_AUTH not configured');
    return false;
  }
  const authHeader = req.headers.authorization ?? '';
  if (!authHeader.startsWith('Basic ')) return false;

  const provided = authHeader.slice(6);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function pickParam(req: VercelRequest, name: string): string | undefined {
  return (req.query[name] as string | undefined) ?? (req.body?.[name] as string | undefined);
}

function normalizeReferrer(value: string | undefined): UnlinkReferrer {
  return VALID_REFERRERS.includes(value as UnlinkReferrer)
    ? (value as UnlinkReferrer)
    : 'UNLINK';
}
