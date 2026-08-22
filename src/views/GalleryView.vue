<template>
  <div class="gallery-view">
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-sub">{{ sub }}</p>
      <div class="divider"></div>
    </div>

    <!-- 空态 -->
    <div v-if="items.length === 0 && !loadingImages" class="empty-state">
      <p>暂无作品</p>
    </div>

    <!-- 瀑布流 -->
    <div v-else class="waterfall" :style="gridStyle" ref="waterfallEl">
      <div
        v-for="item in items"
        :key="item.key"
        class="gallery-item"
        :style="item.style"
      >
        <img
          :src="item.url"
          :alt="item.caption || `${title}作品`"
          loading="lazy"
        />
        <div v-if="item.caption" class="gallery-caption">{{ item.caption }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { siteData } from '@/utils/dataLoader'
import { CATEGORY_GLOBS, imgPath, extractFilename } from '@/utils/galleryGlob'
import sizes from '@/assets/images/webp/sizes.json'

const props = defineProps({
  category: {
    type: String,
    required: true
  }
})

const categoryConfigs = {
  design: { title: '平面设计', sub: '海报、品牌视觉等平面设计作品' },
  paint: { title: '绘画', sub: '手绘与数字绘画作品' },
  photo: { title: '摄影', sub: '摄影作品集' }
}

const config = computed(() => categoryConfigs[props.category] || categoryConfigs.design)
const title = computed(() => config.value.title)
const sub = computed(() => config.value.sub)

// 从共享模块取全部三个分类的 glob 对象（import.meta.glob 是模块顶层静态分析，安全）
// 为何要全量加载：builtin 条目的 category 可被后台自由调整（不移动文件），
// 前台必须能跨分类找到模块，而不能只按路由分类加载
const modules = computed(() => CATEGORY_GLOBS)

// 异步加载图片
const loadedModules = ref({})
const loadingImages = ref(true)

async function loadImages() {
  loadingImages.value = true
  // 加载全部三个分类的模块（builtin 条目可跨分类引用）
  const results = await Promise.all(
    Object.entries(CATEGORY_GLOBS).flatMap(([cat, glob]) =>
      Object.entries(glob).map(async ([path, loader]) => {
        const mod = await loader()
        return [path, mod]
      })
    )
  )
  loadedModules.value = Object.fromEntries(results)
  loadingImages.value = false
}

onMounted(loadImages)

// 网格基础行高（与 CSS 中的 grid-auto-rows 保持一致）
const ROW_UNIT = 8
// 网格间距（与 CSS 中的 gap 保持一致）
const GAP = 20

// 各分类宽高比表（整份 sizes：builtin 条目按自身分类取值）
const ratioMap = computed(() => sizes)

// 瀑布流容器宽度
const waterfallEl = ref(null)
const containerWidth = ref(0)

const columnCount = computed(() => {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  if (vw <= 600) return 1
  if (vw <= 900) return 2
  if (vw <= 1200) return 3
  return 4
})

// 按 galleryImages.items 顺序合并渲染本地+远程图片
const items = computed(() => {
  const cols = columnCount.value
  const width = containerWidth.value
  const mods = loadedModules.value
  const cat = props.category

  // 优雅降级：无 galleryImages 或 items 为空 → 按 glob 原始顺序渲染全部本地图
  const gi = siteData.value && siteData.value.galleryImages
  const itemsList = gi && Array.isArray(gi.items) && gi.items.length > 0 ? gi.items : null

  if (!itemsList) {
    // 降级：只渲染当前路由分类的本地图（mods 是全部分类，需按路由分类取）
    const catMods = Object.entries(mods[cat] || {}).map(([key, mod]) => {
      const base = extractFilename(key)
      const ratio = (ratioMap.value[cat] || {})[base] || 1
      return { key: `builtin:${base}`, url: mod.default, ratio, wide: false, caption: '' }
    })
    if (width <= 0) return catMods.map(it => ({ ...it, style: {} }))
    const colW = (width - GAP * (cols - 1)) / cols
    return catMods.map(it => {
      const itemW = colW
      const itemH = itemW / it.ratio
      const rowSpan = Math.max(1, Math.ceil((itemH + GAP) / (ROW_UNIT + GAP)))
      return { ...it, style: { gridColumn: 'span 1', gridRow: `span ${rowSpan}` } }
    })
  }

  // 按 galleryImages 顺序合并
  const result = []
  for (const entry of itemsList) {
    if (entry.hidden) continue
    if (entry.category !== cat) continue

    let url = ''
    let ratio = 1
    let key = ''

    if (entry.type === 'builtin') {
      const ecat = entry.category || cat        // 条目自身分类（后台可自由调整，不移动文件）
      const path = imgPath(ecat, entry.filename)
      const mod = mods[path]                     // mods = 三分类合并后的 loadedModules
      if (!mod) continue                         // 跳过找不到模块的 builtin 条目（文件已删除）
      url = mod.default
      ratio = (ratioMap.value[ecat] || {})[entry.filename] || 1
      key = `builtin:${ecat}:${entry.filename}`  // 分类不同则 key 不同，v-for 唯一
    } else if (entry.type === 'remote') {
      url = entry.url
      ratio = entry.ratio || 1
      key = `remote:${entry.url}`
    } else {
      continue
    }

    if (width <= 0) {
      result.push({ key, url, ratio, wide: entry.wide, caption: entry.caption || '', style: {} })
      continue
    }

    const colW = (width - GAP * (cols - 1)) / cols
    const colSpan = entry.wide ? Math.min(2, cols) : 1
    const itemW = colW * colSpan + GAP * (colSpan - 1)
    const itemH = itemW / ratio
    const rowSpan = Math.max(1, Math.ceil((itemH + GAP) / (ROW_UNIT + GAP)))

    result.push({
      key,
      url,
      ratio,
      wide: entry.wide,
      caption: entry.caption || '',
      style: { gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }
    })
  }

  return result
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columnCount.value}, 1fr)`
}))

// 监听容器宽度
let ro = null
onMounted(() => {
  if (waterfallEl.value) {
    containerWidth.value = waterfallEl.value.clientWidth
    ro = new ResizeObserver(() => {
      if (waterfallEl.value) containerWidth.value = waterfallEl.value.clientWidth
    })
    ro.observe(waterfallEl.value)
  }
})
onUnmounted(() => {
  if (ro) ro.disconnect()
})
</script>

<style scoped>
.gallery-view {
  max-width: 1200px;
}

.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--nyc-black);
  margin: 10px 0 4px;
}

.page-sub {
  font-size: 14px;
  font-weight: 600;
  color: #999;
  margin-bottom: 20px;
}

.divider {
  width: 80px;
  height: 5px;
  background-color: var(--nyc-yellow);
}

/* 瀑布流：CSS Grid 网格，按图片宽高比预占行高 */
.waterfall {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 8px;
  grid-auto-flow: dense;
  gap: 20px;
  overflow: hidden;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 12px 10px;
  background: linear-gradient(transparent, rgba(0,0,0,0.55));
  color: #fff;
  font-size: 13px;
  line-height: 1.4;
  pointer-events: none;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #999;
  font-size: 16px;
}

@media (max-width: 480px) {
  .page-title {
    font-size: 32px;
  }
}
</style>