import axios from 'axios'

// GitHub 配置 - 从环境变量读取，支持运行时通过 localStorage 覆盖
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'Mango-pomelo-sago'
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'myweb'
const GITHUB_BRANCH = 'main'
const DATA_FILE_PATH = 'data.json'

const getToken = () => {
  // 仅从 localStorage 读取用户输入的 Token。
  // 注意：绝不读取环境变量（VITE_* 会在构建期被内联进公开 bundle，等于泄露凭据）。
  return localStorage.getItem('github_token') || ''
}

// 获取数据（从 GitHub raw 读取）
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
      `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_FILE_PATH}${versionParam}`,
      { headers: { 'Cache-Control': 'no-cache' } }
    )
    return response.data
  } catch (error) {
    console.error('获取数据失败:', error)
    // 返回 null，由 dataLoader 的兜底链（缓存 → 本地打包数据）处理
    return null
  }
}

// 保存数据到 GitHub
export const saveData = async (newData) => {
  const token = getToken()
  if (!token) throw new Error('未登录，请先配置 GitHub Token')

  try {
    // 1. 获取文件的最新 SHA
    const shaResponse = await axios.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`,
      { headers: { 'Authorization': `token ${token}` } }
    )
    const sha = shaResponse.data.sha

    // 2. 更新文件内容
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2))))
    await axios.put(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`,
      {
        message: 'Update data.json via admin panel',
        content: content,
        sha: sha,
        branch: GITHUB_BRANCH
      },
      { headers: { 'Authorization': `token ${token}` } }
    )
    // 数据已更新（且给版本参数换新值），清除旧版本号避免拿到 CDN 旧缓存
    localStorage.removeItem('data_version')
    return true
  } catch (error) {
    console.error('保存数据失败:', error)
    throw error
  }
}

// 上传图片到 GitHub
export const uploadImage = async (file, filename) => {
  const token = getToken()
  if (!token) throw new Error('未登录，请先配置 GitHub Token')

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

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64Content = reader.result.split(',')[1]
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        // 用随机文件名取代原始文件名，防止路径遍历和特殊字符注入
        const filePath = `public/images/${timestamp}_${randomStr}.${ext}`

        await axios.put(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
          {
            message: `Upload image: ${filename}`,
            content: base64Content,
            branch: GITHUB_BRANCH
          },
          { headers: { 'Authorization': `token ${token}` } }
        )

        // 返回图片的访问 URL
        const imageUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`
        resolve(imageUrl)
      } catch (error) {
        reject(error)
      }
    }
    reader.readAsDataURL(file)
  })
}

// 列出 public/images/ 目录下的所有图片
export const listImages = async () => {
  const token = getToken()
  if (!token) throw new Error('未登录，请先配置 GitHub Token')

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/images`,
      { headers: { 'Authorization': `token ${token}` } }
    )
    // 只返回图片文件（按修改时间降序排列）
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp']
    const images = response.data
      .filter(f => f.type === 'file' && imageExts.some(ext => f.name.toLowerCase().endsWith(ext)))
      .map(f => ({
        name: f.name,
        url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${f.path}`,
        downloadUrl: f.download_url,
        size: f.size,
        updatedAt: new Date(f.updated_at)
      }))
      // 按名称降序（最新上传的在前）
      .sort((a, b) => b.name.localeCompare(a.name))
    return images
  } catch (error) {
    // 如果目录不存在（首次使用），返回空数组
    if (error.response && error.response.status === 404) {
      return []
    }
    console.error('获取图片列表失败:', error)
    throw error
  }
}

export { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH }

// 验证 GitHub Token 是否有效
export const validateToken = async () => {
  const token = getToken()
  if (!token) return false
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: { 'Authorization': `token ${token}` }
    })
    return response.status === 200
  } catch (error) {
    return false
  }
}