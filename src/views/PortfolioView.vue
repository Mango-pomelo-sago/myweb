<template>
  <div class="portfolio-view">
    <!-- 水印衬线大标题（参考 demo 的固定定位） -->
    <h1 class="page-title watermark-title title title--large">
      <span class="title__line">作品集</span>
      <span class="title__line title__offset">PORTFOLIO</span>
    </h1>

    <!-- 横向 gooey slideshow -->
    <GooeySlideshow :slides="slides" @open="handleCardOpen" @progress="onProgress" />

    <!-- 交互提示 -->
    <div class="scroll-hint">
      <LetterPlay text="SCROLL →" accent="var(--nyc-green)" />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { siteData } from '../utils/dataLoader'
import GooeySlideshow from '../components/GooeySlideshow.vue'
import LetterPlay from '../components/LetterPlay.vue'
import xhsCover from '@/assets/images/xiaohongshu/🙀听说复旦人的期末季将近，怎么办？_1_复旦大学_来自小红书网页版.webp'
import xhsHover from '@/assets/images/xiaohongshu/征集｜2025你在复旦收到的好消息！_1_复旦大学_来自小红书网页版.webp'

const router = useRouter()

// 可见项目(过滤掉标记为 hidden 的项目)，从 data.json 读取
const projects = computed(() => (siteData.value && siteData.value.projects ? siteData.value.projects : []).filter((p) => !p.hidden))

// 各分类封面:用懒加载 glob，只加载第一张和第二张作为封面与悬停图
// 避免 eager:true 将所有图片打包进主 bundle（~10MB）
const webpGlobDesign = import.meta.glob('@/assets/images/webp/design/*.webp')
const webpGlobPaint = import.meta.glob('@/assets/images/webp/paint/*.webp')
const webpGlobPhoto = import.meta.glob('@/assets/images/webp/photo/*.webp')

// 封面和悬停图：用 reactive 使 computed 能响应异步加载结果
const covers = reactive({ design: '', paint: '', photo: '', xiaohongshu: xhsCover })
const hoverCovers = reactive({ design: '', paint: '', photo: '', xiaohongshu: xhsHover })

async function loadCovers() {
  const pairs = [
    { key: 'design', glob: webpGlobDesign },
    { key: 'paint', glob: webpGlobPaint },
    { key: 'photo', glob: webpGlobPhoto },
  ]
  for (const { key, glob } of pairs) {
    const entries = Object.entries(glob)
    if (entries[0]) {
      const mod0 = await entries[0][1]()
      covers[key] = mod0.default
    }
    if (entries[1]) {
      const mod1 = await entries[1][1]()
      hoverCovers[key] = mod1.default
    }
  }
}
onMounted(loadCovers)

const EN_TITLES = {
  design: 'Graphic Design',
  xiaohongshu: 'Social Media',
  paint: 'Painting',
  photo: 'Photography',
}

// 每栏对应的数学曲线配置（来自 math-curve-loaders），用于在卡片文字左侧显示动画图标
const CURVE_CONFIGS = {
  xiaohongshu: {
    name: 'Rose Curve',
    roseA: 9.2, roseABoost: 0.6, roseBreathBase: 0.72, roseBreathBoost: 0.28, roseK: 5, roseScale: 3.25,
    rotate: true, particleCount: 78, trailSpan: 0.32, durationMs: 5400, rotationDurationMs: 28000, pulseDurationMs: 4600, strokeWidth: 4.5,
  },
  design: {
    name: 'Rose Two',
    roseA: 9.2, roseABoost: 0.6, roseBreathBase: 0.72, roseBreathBoost: 0.28, roseK: 2, roseScale: 3.25,
    rotate: true, particleCount: 74, trailSpan: 0.3, durationMs: 5200, rotationDurationMs: 28000, pulseDurationMs: 4300, strokeWidth: 4.6,
  },
  paint: {
    name: 'Thinking Five',
    baseRadius: 7, detailAmplitude: 3, petalCount: 5, curveScale: 3.9,
    rotate: true, particleCount: 62, trailSpan: 0.38, durationMs: 4600, rotationDurationMs: 28000, pulseDurationMs: 4200, strokeWidth: 5.5,
  },
  photo: {
    name: 'Rose Four',
    roseA: 9.2, roseABoost: 0.6, roseBreathBase: 0.72, roseBreathBoost: 0.28, roseK: 4, roseScale: 3.25,
    rotate: true, particleCount: 78, trailSpan: 0.32, durationMs: 5400, rotationDurationMs: 28000, pulseDurationMs: 4500, strokeWidth: 4.6,
  },
}

// 构造 slides 数据传给 GooeySlideshow
const slides = computed(() =>
  projects.value.map((p) => ({
    id: p.id,
    title: p.title,
    en: p.enTitle || EN_TITLES[p.detail] || '',
    desc: p.desc,
    base: p.coverImage || covers[p.detail] || '',
    hover: p.coverImage || hoverCovers[p.detail] || covers[p.detail] || '',
    detail: p.detail,
    curveConfig: p.curveConfig || CURVE_CONFIGS[p.detail] || null,
  }))
)

// 点击卡片:有详情页的项目跳转
const handleCardOpen = (slide) => {
  if (slide.detail) router.push(`/portfolio/${slide.detail}`)
}

// 横向滚动进度
const onProgress = () => {}
</script>

<style scoped>
/* 参考 codrops GooeyImageHoverEffects demo-1 的布局 */
.portfolio-view {
  position: relative;
  height: calc(100vh - 100px); /* 顶部导航留出空间 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 水印衬线标题: 参考 demo 的 .page-title 固定定位 */
.watermark-title {
  position: fixed;
  top: 12rem;
  left: 5vw;
  z-index: 1;
  white-space: nowrap;
  font-size: calc(4vw + 5rem);
  line-height: 0.975;
  color: var(--nyc-black);
  opacity: 0.1;
  pointer-events: none;
  user-select: none;
}

.scroll-hint {
  position: fixed;
  bottom: 4%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

@media (max-width: 768px) {
  .watermark-title {
    font-size: calc(2.5vw + 2.5rem);
    top: 8rem;
    left: 6vw;
  }
}
</style>