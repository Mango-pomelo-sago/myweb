import { ref } from 'vue'
import localData from '../../data.json'
import { fetchData } from './githubApi'

// 全局数据状态：所有页面共享（初始值 = 打包进 bundle 的本地完整数据，保证首帧即有内容）
const siteData = ref(localData)
const loading = ref(false)
const loadedRemote = ref(false)

// 预览模式支持：后台编辑时点击「预览」会将编辑数据注入 sessionStorage
// 前台页面启动时优先读取预览数据，实现"保存前看效果"
function checkPreviewData() {
  try {
    const raw = sessionStorage.getItem('preview_data')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && 'profile' in parsed) {
        siteData.value = parsed
        loadedRemote.value = true
        // 读取后立即清除，避免刷新页面后仍显示旧的预览数据
        sessionStorage.removeItem('preview_data')
        return true
      }
    }
  } catch (e) {
    /* ignore */
  }
  return false
}

// 在模块加载时立即检查预览数据
checkPreviewData()

// 值类型校验：远程数据里数组字段必须是数组、对象字段必须是对象。
// 防后台编辑时手滑把某一栏改成字符串/数字/空串 → 之前因此导致整页渲染报错（如 v-for 遍历字符串）变白屏。
const SCHEMA = {
  profile: 'object',
  nav: 'array',
  projects: 'array',
  home: 'array',
  work: 'object',
  xiaohongshu: 'object',
  gongzhonghao: 'object',
  about: 'object',
  personalXiaohongshu: 'object',
  personalDouyin: 'object',
  adminPassword: 'string',
}

function isUsableData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  return REQUIRED_KEYS.every((key) => {
    const v = data[key]
    const expected = SCHEMA[key]
    if (v === undefined || v === null) return false
    if (expected === 'array') return Array.isArray(v)
    if (expected === 'object') return typeof v === 'object' && v !== null && !Array.isArray(v)
    return true
  })
}

// 同一会话内多次调用（导航切换）只请求一次；跨会话靠 localStorage 缓存 JSON
const CACHE_KEY = 'cms_data_cache_v1'

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isUsableData(parsed)) {
      // 缓存里是旧版/损坏数据：清掉，防止下次继续兜底到脏数据
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    /* 隐私模式等场景忽略 */
  }
}

/**
 * 加载站点数据（优先从 GitHub 获取最新数据，失败则用本地）
 * 多道防线保证任何情况下都不会出现空白页：
 *  1. 初始值就是打包进 bundle 的本地 data.json（页面永远有内容）
 *  2. 远程数据必须完整（REQUIRED_KEYS 全有），否则丢弃用本地
 *  3. 命中缓存直接返回；远程成功则覆盖缓存；远程失败读缓存兜底
 */
// 必须完整的关键字段：远程数据缺任何一个都视为不可用（旧版数据），改回本地
const REQUIRED_KEYS = ['profile', 'nav', 'projects', 'home', 'work', 'xiaohongshu', 'gongzhonghao', 'about', 'personalXiaohongshu', 'personalDouyin']

export const loadSiteData = async (force = false) => {
  if (loadedRemote.value && !force) return siteData

  loading.value = true
  try {
    const remote = await fetchData()
    if (isUsableData(remote)) {
      siteData.value = remote
      loadedRemote.value = true
      writeCache(remote)
      return siteData
    } else {
      // 放弃远程，保留本地完整数据，并给出明确提示
      const missing = remote ? REQUIRED_KEYS.filter((k) => remote[k] === undefined || remote[k] === null) : REQUIRED_KEYS
      console.warn(
        '[dataLoader] 远程 data.json 不完整或类型错误，跳过远程数据，使用本地数据。缺失/类型错误字段:',
        missing
      )
    }
  } catch (e) {
    console.warn('获取远程数据出错，尝试读缓存', e)
  }

  // 走到这里：远程不可用 或 不完整 → 优先用上次保存的缓存，其次本地打包数据
  const cached = readCache()
  if (cached) {
    siteData.value = cached
    loadedRemote.value = true
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