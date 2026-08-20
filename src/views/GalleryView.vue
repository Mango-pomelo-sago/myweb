<template>
  <div class="gallery-view">
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-sub">{{ sub }}</p>
      <div class="divider"></div>
    </div>

    <!-- 瀑布流：CSS Grid 网格 + 按宽高比换算行高占位，支持特宽图横跨两列 -->
    <div class="waterfall" :style="gridStyle" ref="waterfallEl">
      <img
        v-for="(item, index) in items"
        :key="item.url"
        :src="item.url"
        :alt="`${title}作品 ${index + 1}`"
        :style="item.style"
        loading="lazy"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import sizes from '@/assets/images/webp/sizes.json'

const props = defineProps({
  category: {
    type: String,
    required: true
  }
})

// 每个分类对应一个图片文件夹，用 import.meta.glob 自动打包导入（只取图片文件）
const categoryConfigs = {
  design: {
    title: '平面设计',
    sub: '海报、品牌视觉等平面设计作品',
    modules: import.meta.glob('@/assets/images/webp/design/*.webp', { eager: true })
  },
  paint: {
    title: '绘画',
    sub: '手绘与数字绘画作品',
    modules: import.meta.glob('@/assets/images/webp/paint/*.webp', { eager: true })
  },
  photo: {
    title: '摄影',
    sub: '摄影作品集',
    modules: import.meta.glob('@/assets/images/webp/photo/*.webp', { eager: true })
  }
}

const config = computed(() => categoryConfigs[props.category] || categoryConfigs.design)
const title = computed(() => config.value.title)
const sub = computed(() => config.value.sub)

// 需要横跨两列展示的宽幅图（作品名，不含扩展名）
const WIDE_NAMES = ['@杨枝甘露 (2)']

// 网格基础行高（与 CSS 中的 grid-auto-rows 保持一致）
const ROW_UNIT = 8
// 网格间距（与 CSS 中的 gap 保持一致）
const GAP = 20

// 各分类宽高比表：文件名 -> 宽/高（由 scripts/optimize_images.py 生成）
const ratioMap = computed(() => sizes[props.category] || {})

// 瀑布流容器宽度（用 ResizeObserver 跟随内容区宽度变化）
const waterfallEl = ref(null)
const containerWidth = ref(0)

// 列数：沿用原来的响应式断点（基于视口宽度）
const columnCount = computed(() => {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  if (vw <= 600) return 1
  if (vw <= 900) return 2
  if (vw <= 1200) return 3
  return 4
})

// 把图片打包成带跨列/跨行信息的 items
const items = computed(() => {
  const cols = columnCount.value
  const width = containerWidth.value
  if (width <= 0) {
    return Object.entries(config.value.modules).map(([, mod]) => ({ url: mod.default, style: {} }))
  }
  const colW = (width - GAP * (cols - 1)) / cols

  return Object.entries(config.value.modules).map(([key, mod]) => {
    const url = mod.default
    const base = key.split('/').pop().replace(/\.webp$/, '')
    const ratio = ratioMap.value[base] || 1

    // 特宽图横跨两列，其余每列一张
    const colSpan = WIDE_NAMES.includes(base) ? Math.min(2, cols) : 1
    const itemW = colW * colSpan + GAP * (colSpan - 1)
    const itemH = itemW / ratio

    // 跨行数 = 换算成整行（含行距），保证每个格子约等于图片实际宽高比
    const rowSpan = Math.max(1, Math.ceil((itemH + GAP) / (ROW_UNIT + GAP)))

    return {
      url,
      style: { gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }
    }
  })
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columnCount.value}, 1fr)`
}))

// 监听容器宽度，随内容区宽度变化重算跨列/行数
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

/* 瀑布流：CSS Grid 网格，按图片宽高比预占行高，特宽图横跨两列 */
.waterfall {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 8px;
  grid-auto-flow: dense;
  gap: 20px;
}

.waterfall img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  border-radius: 4px;
}

@media (max-width: 480px) {
  .page-title {
    font-size: 32px;
  }
}
</style>
