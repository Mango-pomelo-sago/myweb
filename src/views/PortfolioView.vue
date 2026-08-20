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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import data from '../../data.json'
import GooeySlideshow from '../components/GooeySlideshow.vue'
import LetterPlay from '../components/LetterPlay.vue'
import xhsCover from '@/assets/images/xiaohongshu/🙀听说复旦人的期末季将近，怎么办？_1_复旦大学_来自小红书网页版.jpg'
import xhsHover from '@/assets/images/xiaohongshu/征集｜2025你在复旦收到的好消息！_1_复旦大学_来自小红书网页版.jpg'

const router = useRouter()

// 可见项目(过滤掉标记为 hidden 的项目)
const projects = computed(() => data.projects.filter((p) => !p.hidden))

// 各分类封面:glob 到本分类全部大图(design/paint/photo),
// 封面(第一张)与悬停切换图(第二张)都取分类内实际图片;
// xiaohongshu 无 webp 目录,用显式导入的小红书截图
// 注意:* 不跨目录,不会命中 thumb/ 子目录
const webpGlobDesign = import.meta.glob('@/assets/images/webp/design/*.webp', { eager: true })
const webpGlobPaint = import.meta.glob('@/assets/images/webp/paint/*.webp', { eager: true })
const webpGlobPhoto = import.meta.glob('@/assets/images/webp/photo/*.webp', { eager: true })
const pick = (glob, i) => Object.values(glob)[i]?.default || ''

// 封面:base 用各分类第一张,封面:base 相同则 hover 取第二张,否则 base<->hover 成组(封面互切)
const covers = {
  design: pick(webpGlobDesign, 0),
  paint: pick(webpGlobPaint, 0),
  photo: pick(webpGlobPhoto, 0),
  xiaohongshu: xhsCover,
}
const hoverCovers = {
  design: pick(webpGlobDesign, 1),
  paint: pick(webpGlobPaint, 1),
  photo: pick(webpGlobPhoto, 1),
  xiaohongshu: xhsHover,
}

const EN_TITLES = {
  design: 'Graphic Design',
  xiaohongshu: 'Social Media',
  paint: 'Painting',
  photo: 'Photography',
}

// 构造 slides 数据传给 GooeySlideshow
const slides = computed(() =>
  projects.value.map((p) => ({
    id: p.id,
    title: p.title,
    en: EN_TITLES[p.detail] || '',
    desc: p.desc,
    base: covers[p.detail] || '',
    hover: hoverCovers[p.detail] || covers[p.detail] || '',
    detail: p.detail,
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