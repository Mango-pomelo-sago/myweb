// 作品集图片共享清单：GalleryView 与 AdminDashboard 共用同一份 import.meta.glob，
// 避免两处各自写 glob 导致文件清单漂移。
// 注意：import.meta.glob 是静态分析调用，必须写在模块顶层，不能用变量拼接路径。

export const CATEGORY_GLOBS = {
  design: import.meta.glob('@/assets/images/webp/design/*.webp'),
  paint: import.meta.glob('@/assets/images/webp/paint/*.webp'),
  photo: import.meta.glob('@/assets/images/webp/photo/*.webp'),
}

export const CATEGORY_NAMES = {
  design: '平面设计',
  paint: '绘画',
  photo: '摄影',
}

// glob key → 不含扩展名的文件名（与 sizes.json 的 key 一致）
export const extractFilename = (key) => key.split('/').pop().replace(/\.webp$/, '')

// 统一路径模板：builtin 条目按此拼出 loadedModules 的 key，避免路径硬编码漂移
export const imgPath = (category, filename) => `/src/assets/images/webp/${category}/${filename}.webp`