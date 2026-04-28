import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { extractUser, handleError } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);

    const { data, error } = await supabase
      .from('achievements')
      .select('achievement_key, achieved_at')
      .eq('user_id', userId);

    if (error) throw error;
    return res.status(200).json(data ?? []);
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
