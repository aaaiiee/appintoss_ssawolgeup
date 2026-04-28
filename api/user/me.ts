import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = extractUser(req);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      const allowedFields = ['nickname', 'hourly_wage', 'quick_duration_seconds'];
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (updates.hourly_wage !== undefined) {
        const wage = Number(updates.hourly_wage);
        if (wage < 0 || wage > 1000000) {
          return res.status(400).json({ message: 'Invalid hourly_wage' });
        }
      }

      if (updates.quick_duration_seconds !== undefined) {
        const secs = Number(updates.quick_duration_seconds);
        if (secs < 60 || secs > 900) {
          return res.status(400).json({ message: 'Duration must be 1-15 minutes' });
        }
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        return res.status(500).json({ message: 'Update failed' });
      }
      return res.status(200).json(data);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
