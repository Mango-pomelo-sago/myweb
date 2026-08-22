import axios from 'axios'

// GitHub 配置（仅用于拼接公开 raw URL；token 在服务端，客户端绝无凭据）
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'Mango-pomelo-sago'
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'myweb'
const GITHUB_BRANCH = 'main'
const DATA_FILE_PATH = 'data.json'

// 获取数据（从 GitHub raw 读取，公开只读）
// 注意：raw CDN 会对 main 别名缓存旧内容（仓库更新后可能几小时仍是旧数据，导致"时好时坏"），
// 因此 URL 始终带上版本参数绕过缓存：
//  - 有 localStorage 版本号（后台保存后清除）→ 用该版本
//  - 有 VITE_DATA_VERSION 环境变量 → 用该版本
//  - 都没有 → 用 Date.now() 作一次性缓存破坏
export const fetchData = async () => {
  const version = localStorage.getItem('data_version') || import.meta.env.VITE_DATA_VERSION || Date.now()
  const versionParam = `?v=${version}`
  try {
    const response = await axios.get(
      `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_FILE_PATH}${versionParam}`
    )
    return response.data
  } catch (error) {
    console.error('获取数据失败:', error)
    // 返回 null，由 dataLoader 的兜底链（缓存 → 本地打包数据）处理
    return null
  }
}

// 保存数据到 GitHub（走 /api 代理，token 在服务端）
export const saveData = async (newData) => {
  const { default: api } = await import('./api')
  await api.put('/data', newData)
  // 数据已更新（且给版本参数换新值），清除旧版本号避免拿到 CDN 旧缓存
  localStorage.removeItem('data_version')
  return true
}

// 上传图片到 GitHub（走 /api 代理，token 在服务端）
export const uploadImage = async (file, filename) => {
  // 文件类型白名单：只允许图片格式，拒绝 SVG（含脚本风险）
  const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp']
  const ext = (filename.split('.').pop() || '').toLowerCase()
  if (!ALLOWED_EXTS.includes(ext)) {
    throw new Error(`不支持的文件格式 .${ext}，仅允许：${ALLOWED_EXTS.join(', ')}`)
  }

  // 文件大小限制：5MB
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    throw new Error(`文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），最大允许 5MB`)
  }

  // 将文件转为 base64 后 POST 给服务端（服务端随机命名，防路径遍历/特殊字符注入）
  const base64Content = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = String(reader.result).split(',')[1]
      resolve(b64)
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })

  const { default: api } = await import('./api')
  const { data } = await api.post('/images', { filename, content: base64Content })
  return data.url
}

// 列出 public/images/ 目录下的所有图片（走 /api 代理）
export const listImages = async () => {
  const { default: api } = await import('./api')
  const { data } = await api.get('/images')
  return data
}

export { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH }