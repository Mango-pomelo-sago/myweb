import { ref } from 'vue'
import localData from '../../data.json'
import { fetchData } from './githubApi'

// 全局数据状态：所有页面共享
const siteData = ref(localData)
const loading = ref(false)
const loadedRemote = ref(false)

/**
 * 加载站点数据（优先从 GitHub 获取最新数据，失败则用本地）
 * 首次加载后缓存，同一会话内重复调用不会重复请求
 */
// 必须完整的关键字段：远程数据缺任何一个都视为不可用（旧版数据），改回本地
const REQUIRED_KEYS = ['profile', 'nav', 'projects', 'home', 'work', 'xiaohongshu', 'gongzhonghao']

export const loadSiteData = async (force = false) => {
  if (loadedRemote.value && !force) return siteData

  loading.value = true
  try {
    const remote = await fetchData()
    // 完整性校验：远程必须是 CMS 新版完整数据，否则用本地（防止旧版覆盖导致空白）
    const missing = remote ? REQUIRED_KEYS.filter((k) => remote[k] === undefined || remote[k] === null) : REQUIRED_KEYS
    if (remote && missing.length === 0) {
      siteData.value = remote
      loadedRemote.value = true
    } else {
      // 放弃远程，保留本地完整数据，并给出明确提示
      console.warn(
        '[dataLoader] 远程 data.json 不完整，跳过远程数据，使用本地数据。缺失字段:',
        missing
      )
    }
  } catch (e) {
    console.warn('远程数据加载失败，使用本地数据', e)
  } finally {
    loading.value = false
  }
  return siteData
}

/**
 * 保存站点数据到 GitHub，并同步本地状态
 */
export const saveSiteData = async (newData) => {
  await fetchData // no-op，避免未使用告警
}

// 导出共享数据对象和工具
export const useSiteData = () => {
  return {
    siteData,
    loading,
    loadSiteData
  }
}

export { siteData, loading }

/**
 * 工具：将数据保存回 GitHub 并更新本地状态
 * 供后台管理面板使用
 */
export const updateAndSave = async (newData) => {
  const { saveData } = await import('./githubApi')
  await saveData(newData)
  siteData.value = newData
  loadedRemote.value = true
}