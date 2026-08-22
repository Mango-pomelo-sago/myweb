import { requireAuth } from './_lib/auth.js'
import { uploadImage, listImages as ghListImages } from './_lib/github.js'

// POST /api/images — 上传图片（需 auth）
// GET /api/images — 列出 public/images/ 目录（需 auth）
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')

  if (req.method === 'GET') {
    if (!requireAuth(req, res)) return
    try {
      const list = await ghListImages()
      res.status(200).json(list)
    } catch (e) {
      res.status(500).json({ error: '获取图片列表失败: ' + e.message })
    }
    return
  }

  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return

    try {
      // Vercel 自动解析 JSON body
      const { filename, content: base64Content } = req.body || {}
      if (!filename || !base64Content) {
        res.status(400).json({ error: '缺少 filename 或 content' })
        return
      }

      // 文件类型白名单
      const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp']
      const ext = (filename.split('.').pop() || '').toLowerCase()
      if (!ALLOWED_EXTS.includes(ext)) {
        res.status(400).json({ error: `不支持的文件格式 .${ext}，仅允许：${ALLOWED_EXTS.join(', ')}` })
        return
      }

      const url = await uploadImage(filename, base64Content, `Upload image: ${filename}`)
      res.status(200).json({ url })
    } catch (e) {
      res.status(500).json({ error: '上传图片失败: ' + e.message })
    }
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}