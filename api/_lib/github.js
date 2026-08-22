/**
 * GitHub API 代理（token 从服务端环境变量读取，绝不下发客户端）
 */
const GITHUB_OWNER = 'Mango-pomelo-sago'
const GITHUB_REPO = 'myweb'
const GITHUB_BRANCH = 'main'
const DATA_FILE_PATH = 'data.json'

function getToken() {
  return process.env.GITHUB_TOKEN
}

/**
 * 获取 data.json 的当前 SHA（用于更新时传参）
 */
async function getFileSha(path) {
  const token = getToken()
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'yzgl-work-serverless' } }
  )
  if (!res.ok) {
    if (res.status === 404) return null
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub SHA fetch failed: ${res.status} ${err.message || ''}`)
  }
  const data = await res.json()
  return data.sha
}

/**
 * 读取 data.json 完整内容
 */
export async function readData() {
  const token = getToken()
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`,
    { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'yzgl-work-serverless' } }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub read failed: ${res.status} ${err.message || ''}`)
  }
  const data = await res.json()
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))
  return { content, sha: data.sha }
}

/**
 * 写入 data.json 到 GitHub
 */
export async function writeData(newData, message) {
  const token = getToken()
  const sha = await getFileSha(DATA_FILE_PATH)
  const body = {
    message: message || 'Update data.json via admin panel',
    content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
    branch: GITHUB_BRANCH
  }
  if (sha) body.sha = sha
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'yzgl-work-serverless', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub write failed: ${res.status} ${err.message || ''}`)
  }
  return true
}

/**
 * 上传图片到 public/images/
 */
export async function uploadImage(filename, base64Content, commitMessage) {
  const token = getToken()
  const filePath = `public/images/${filename}`
  const existingSha = await getFileSha(filePath)
  const body = {
    message: commitMessage || `Upload image: ${filename}`,
    content: base64Content,
    branch: GITHUB_BRANCH
  }
  if (existingSha) body.sha = existingSha
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'yzgl-work-serverless', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub image upload failed: ${res.status} ${err.message || ''}`)
  }
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`
}

/**
 * 列出 public/images/ 目录下的所有图片文件
 */
export async function listImages() {
  const token = getToken()
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/images`,
    { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'yzgl-work-serverless' } }
  )
  if (res.status === 404) return []
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub list images failed: ${res.status} ${err.message || ''}`)
  }
  const items = await res.json()
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp']
  return items
    .filter(f => f.type === 'file' && imageExts.some(ext => f.name.toLowerCase().endsWith(ext)))
    .map(f => ({
      name: f.name,
      url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${f.path}`,
      downloadUrl: f.download_url,
      size: f.size,
      updatedAt: new Date(f.updated_at)
    }))
    .sort((a, b) => b.name.localeCompare(a.name))
}