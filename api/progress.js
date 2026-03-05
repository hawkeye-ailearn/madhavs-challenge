import { kv } from '@vercel/kv';

const KEY = 'madhav_progress';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await kv.get(KEY);
      return res.status(200).json(data ?? null);
    } catch (err) {
      // KV not configured or unavailable — client will fall back to localStorage
      return res.status(503).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      await kv.set(KEY, req.body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(503).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
