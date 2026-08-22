import { checkPassword, signSession, getLockRemaining, recordFailure, clearFailures } from './_lib/auth.js'

// POST /api/login — 校验密码，签发 session cookie
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // 获取客户端 IP（Vercel 通过 x-forwarded-for 传递）
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'

  // 检查是否被锁定
  const lockRemaining = getLockRemaining(ip)
  if (lockRemaining > 0) {
    const mins = Math.ceil(lockRemaining / 60000)
    res.status(429).json({ error: `失败次数过多，请 ${mins} 分钟后再试`, lockedUntil: Date.now() + lockRemaining })
    return
  }

  const { password } = req.body || {}
  if (!password) {
    res.status(400).json({ error: '请输入密码' })
    return
  }

  if (checkPassword(password)) {
    clearFailures(ip)
    signSession(res)
    res.status(200).json({ authenticated: true })
  } else {
    recordFailure(ip)
    // 检查是否刚触发锁定
    const remain = getLockRemaining(ip)
    if (remain > 0) {
      const mins = Math.ceil(remain / 60000)
      res.status(429).json({ error: `失败次数过多，请 ${mins} 分钟后再试`, lockedUntil: Date.now() + remain })
    } else {
      res.status(401).json({ error: '密码错误' })
    }
  }
}