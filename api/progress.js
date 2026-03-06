import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const KEY = 'madhav_progress';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await redis.get(KEY);
      return res.status(200).json(data ?? null);
    } catch (err) {
      // Redis not configured or unavailable — client falls back to localStorage
      return res.status(503).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      await redis.set(KEY, req.body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(503).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
