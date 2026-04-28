import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('total_earned');

  if (error) {
    return res.status(500).json({ message: 'Failed to fetch' });
  }

  const globalTotal = (data ?? []).reduce((sum, u) => sum + (u.total_earned ?? 0), 0);

  res.setHeader('Cache-Control', 'public, s-maxage=300');
  return res.status(200).json({ totalEarned: globalTotal });
}
