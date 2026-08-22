import { verifySession } from './_lib/auth.js'

// GET /api/session — 校验当前 session cookie，返回认证状态
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const authenticated = verifySession(req.headers.cookie)
  res.status(200).json({ authenticated })
}