import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { extractUser, handleError } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { from, to } = req.query as { from?: string; to?: string };

    let query = supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query.limit(100);

    if (error) throw error;
    return res.status(200).json(data ?? []);
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
