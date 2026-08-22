import crypto from 'node:crypto'

const SESSION_DURATION = 86400 // 24 小时（秒）
const LOCK_MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 5 * 60 * 1000 // 5 分钟

// 进程内登录失败计数（Vercel Hobby 限制：实例回收时重置）
const failMap = new Map()

function getSecret() {
  return process.env.SESSION_SECRET
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD
}

/**
 * 签发 session cookie
 * @param {object} res - Vercel response 对象
 */
export function signSession(res) {
  const body = JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_DURATION })
  const sig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url')
  const cookie = `admin_session=${Buffer.from(body).toString('base64url')}.${sig}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION}; Path=/`
  res.setHeader('Set-Cookie', cookie)
}

/**
 * 校验 session cookie，返回 true/false
 */
export function verifySession(cookieHeader) {
  if (!cookieHeader) return false
  const match = cookieHeader.match(/admin_session=([^.]+)\.([^;]+)/)
  if (!match) return false
  const [, bodyB64, sig] = match
  const expectedSig = crypto.createHmac('sha256', getSecret()).update(Buffer.from(bodyB64, 'base64url')).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false
  try {
    const { exp } = JSON.parse(Buffer.from(bodyB64, 'base64url').toString())
    if (Date.now() / 1000 > exp) return false
  } catch { return false }
  return true
}

/**
 * 清除 session cookie
 */
export function clearSession(res) {
  res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/')
}

/**
 * 路由中间件：requireAuth — 校验失败返回 401
 */
export function requireAuth(req, res) {
  if (!verifySession(req.headers.cookie)) {
    res.status(401).json({ error: '未登录或 session 已过期' })
    return false
  }
  return true
}

/**
 * 登录限流检查：返回剩余锁定毫秒数（0 = 未锁定）
 */
export function getLockRemaining(ip) {
  const entry = failMap.get(ip)
  if (!entry) return 0
  const elapsed = Date.now() - entry.lockedAt
  if (elapsed >= LOCK_DURATION_MS) {
    failMap.delete(ip)
    return 0
  }
  return LOCK_DURATION_MS - elapsed
}

/**
 * 记录一次登录失败；达到阈值则锁定
 */
export function recordFailure(ip) {
  const entry = failMap.get(ip) || { count: 0, lockedAt: 0 }
  if (entry.lockedAt && Date.now() - entry.lockedAt < LOCK_DURATION_MS) return // 已锁定
  if (entry.lockedAt) { failMap.delete(ip); return }
  entry.count++
  if (entry.count >= LOCK_MAX_ATTEMPTS) {
    entry.lockedAt = Date.now()
    entry.count = 0
  }
  failMap.set(ip, entry)
}

/**
 * 登录成功后清除失败计数
 */
export function clearFailures(ip) {
  failMap.delete(ip)
}

/**
 * 密码比较（timingSafeEqual 防时序攻击）
 */
export function checkPassword(input) {
  const actual = getAdminPassword()
  if (!actual) return false
  const inputBuf = Buffer.from(input)
  const actualBuf = Buffer.from(actual)
  if (inputBuf.length !== actualBuf.length) return false
  return crypto.timingSafeEqual(inputBuf, actualBuf)
}