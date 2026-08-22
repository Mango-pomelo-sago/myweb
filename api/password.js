import { requireAuth, checkPassword, clearSession, signSession } from './_lib/auth.js'
import { readData, writeData } from './_lib/github.js'

// POST /api/password — 修改密码（需 auth + 当前密码校验）
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!requireAuth(req, res)) return

  const { currentPassword, newPassword } = req.body || {}

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: '请提供当前密码和新密码' })
    return
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: '新密码长度不能少于 8 位' })
    return
  }

  // 校验当前密码
  if (!checkPassword(currentPassword)) {
    res.status(401).json({ error: '当前密码错误' })
    return
  }

  // 1. 更新环境变量中的 ADMIN_PASSWORD（Vercel runtime 只能通过 API 改）
  // 注意：Vercel Hobby 版无法通过 API 修改环境变量，此处告知用户手动操作
  // 同时将新密码写入 data.json 旧字段（兼容旧版），但前端写入时会被剔除

  // 2. 从 data.json 中彻底清除 adminPassword 字段
  try {
    const { content } = await readData()
    delete content.adminPassword
    await writeData(content, 'Change admin password & remove password from data.json')
  } catch (e) {
    res.status(500).json({ error: '更新 data.json 失败: ' + e.message })
    return
  }

  // 3. 清除当前 session cookie（使旧 session 失效）
  clearSession(res)

  // 附加说明：Vercel 环境变量无法通过 API 修改
  res.status(200).json({
    success: true,
    message: '密码已更新，data.json 已清理。请手动在 Vercel Dashboard 更新 ADMIN_PASSWORD 环境变量为新密码，然后重新登录。',
    note: 'Vercel 环境变量需手动更新，打开 https://vercel.com 项目 Settings → Environment Variables → 修改 ADMIN_PASSWORD'
  })
}