import { requireAuth } from './_lib/auth.js'
import { readData, writeData } from './_lib/github.js'

// GET /api/data — 公开数据（剔除 adminPassword）
// PUT /api/data — 需 auth，写回 GitHub
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')

  if (req.method === 'GET') {
    try {
      const { content } = await readData()
      // 剔除 adminPassword 字段，不让其出现在客户端
      delete content.adminPassword
      res.status(200).json(content)
    } catch (e) {
      res.status(500).json({ error: '读取数据失败: ' + e.message })
    }
    return
  }

  if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return

    const newData = req.body
    if (!newData || typeof newData !== 'object') {
      res.status(400).json({ error: '无效的数据格式' })
      return
    }

    // 服务端 SCHEMA 校验
    const REQUIRED_KEYS = ['profile', 'nav', 'projects', 'home', 'work', 'xiaohongshu', 'gongzhonghao', 'about', 'personalXiaohongshu', 'personalDouyin']
    for (const key of REQUIRED_KEYS) {
      if (!(key in newData)) {
        res.status(400).json({ error: `缺少必填字段: ${key}` })
        return
      }
    }

    // 确保 adminPassword 绝不会被写回
    delete newData.adminPassword

    try {
      await writeData(newData, 'Update data.json via admin panel')
      res.status(200).json({ success: true })
    } catch (e) {
      res.status(500).json({ error: '保存数据失败: ' + e.message })
    }
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}