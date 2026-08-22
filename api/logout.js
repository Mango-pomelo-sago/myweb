import { clearSession } from './_lib/auth.js'

// POST /api/logout — 清除 session cookie
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  clearSession(res)
  res.status(200).json({ authenticated: false })
}