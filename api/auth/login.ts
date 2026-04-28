import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { signJwt, handleError } from '../_lib/auth';
import { exchangeAuthorizationCode, fetchLoginMe } from '../_lib/toss-mtls';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

interface LoginBody {
  authorizationCode?: string;
  referrer?: string;
  accessToken?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { authorizationCode, referrer, accessToken } = req.body as LoginBody;

    if (!IS_PRODUCTION && accessToken === 'mock-toss-access-token') {
      return await issueAppJwt(res, 'mock-toss-user-001', '김직장인');
    }

    if (!authorizationCode || !referrer) {
      return res.status(400).json({
        message: 'authorizationCode and referrer are required',
        code: 'MISSING_PARAMS',
      });
    }

    const tossTokens = await exchangeAuthorizationCode(authorizationCode, referrer);
    const me = await fetchLoginMe(tossTokens.accessToken, { decryptSensitive: false });

    return await issueAppJwt(res, String(me.userKey), '익명직장인');
  } catch (error) {
    console.error('[auth/login] error:', error);
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}

async function issueAppJwt(res: VercelResponse, tossUserId: string, nickname: string) {
  const { data: user, error } = await supabase
    .from('users')
    .upsert(
      { toss_user_id: tossUserId, nickname, updated_at: new Date().toISOString() },
      { onConflict: 'toss_user_id' },
    )
    .select('id, toss_user_id')
    .single();

  if (error || !user) {
    throw new Error(`Failed to upsert user: ${error?.message ?? 'unknown'}`);
  }

  const jwt = signJwt({ userId: user.id, tossUserId: user.toss_user_id });
  return res.status(200).json({ jwt });
}
