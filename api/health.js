// GET /api/health — 部署自检，无需鉴权
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
}