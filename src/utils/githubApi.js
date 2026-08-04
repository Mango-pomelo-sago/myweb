import axios from 'axios'

// GitHub 配置 - 使用时需要替换为你的实际信息
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'YOUR_GITHUB_USERNAME'
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'nyc-subway-portfolio'
const GITHUB_BRANCH = 'main'
const DATA_FILE_PATH = 'data.json'

const getToken = () => localStorage.getItem('github_token')

// 获取数据
export const fetchData = async () => {
  try {
    const response = await axios.get(
      `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_FILE_PATH}`,
      { headers: { 'Cache-Control': 'no-cache' } }
    )
    return response.data
  } catch (error) {
    console.error('获取数据失败:', error)
    // 如果 GitHub 读取失败，返回本地默认数据
    return import('../../data.json').then(module => module.default)
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
    const content = btoa(JSON.stringify(newData, null, 2))
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

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64Content = reader.result.split(',')[1]
        const timestamp = Date.now()
        const filePath = `public/images/${timestamp}_${filename}`

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
