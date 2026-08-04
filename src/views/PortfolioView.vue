<template>
  <div class="portfolio-view" ref="viewRef">
    <h1 class="page-title">作品集</h1>
    <div class="divider"></div>
    
    <!-- 3D 倾斜轮播容器 -->
    <div class="carousel-wrapper">
      <div class="carousel-container">
        <div class="carousel-track" :style="trackStyle">
          <div
            v-for="(project, index) in projects"
            :key="project.id"
            class="carousel-card"
            :class="{ 'active': activeIndex === index }"
            :style="getCardStyle(index)"
            @click="handleCardClick(project, index)"
          >
            <div class="card-media" v-if="coverFor(project)">
              <img :src="coverFor(project)" :alt="project.title" />
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ project.title }}</h3>
              <p class="card-desc">{{ project.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <button @click="toPrev" class="control-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        <!-- 圆点指示器 -->
        <div class="dots">
          <div
            v-for="(_, index) in projects"
            :key="index"
            class="dot"
            :class="{ 'active': activeIndex === index }"
            @click="toSlide(index)"
          ></div>
        </div>
        
        <button @click="toNext" class="control-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
      <p class="wheel-hint">滚动鼠标滚轮可切换项目</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import data from '../../data.json'
import xhsCover from '@/assets/images/xiaohongshu/🙀听说复旦人的期末季将近，怎么办？_1_复旦大学_来自小红书网页版.jpg'

const router = useRouter()

// 轮播容器（用于绑定滚轮事件）
const viewRef = ref(null)
const lastWheel = ref(0)

// 可见项目（过滤掉标记为 hidden 的项目）
const projects = computed(() => data.projects.filter((p) => !p.hidden))

// 各分类图片（用于卡片封面，取优化后文件夹中第一张）
const covers = {
  design: Object.values(import.meta.glob('@/assets/images/webp/design/*.webp', { eager: true }))[0]?.default || '',
  paint: Object.values(import.meta.glob('@/assets/images/webp/paint/*.webp', { eager: true }))[0]?.default || '',
  photo: Object.values(import.meta.glob('@/assets/images/webp/photo/*.webp', { eager: true }))[0]?.default || '',
  xiaohongshu: xhsCover
}

// 取项目详情页对应的封面图（没有详情页的项目不显示封面）
const coverFor = (project) => (project.detail ? covers[project.detail] : '')

const activeIndex = ref(Math.floor(projects.value.length / 2)) // 默认选中中间

// 计算轨道偏移样式
const trackStyle = computed(() => ({
  transform: `translateX(calc(-${activeIndex.value * 100 / projects.value.length}% + 50% - 150px))`
}))

// 计算每个卡片的样式
const getCardStyle = (index) => {
  const diff = index - activeIndex.value
  const rotateY = diff * 60 // 每个卡片相差 60 度
  const scale = index === activeIndex.value ? 1 : 0.85
  const opacity = index === activeIndex.value ? 1 : 0.5
  const blur = index === activeIndex.value ? 'blur(0)' : 'blur(2px)'
  
  return {
    transform: `rotateY(${rotateY}deg) scale(${scale})`,
    opacity,
    filter: blur,
    zIndex: projects.value.length - Math.abs(diff)
  }
}

// 切换到上一张（循环：第一张再上一张回到最后一张）
const toPrev = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--
  } else {
    activeIndex.value = projects.value.length - 1
  }
}

// 切换到下一张（循环：最后一张再下一张回到第一张）
const toNext = () => {
  if (activeIndex.value < projects.value.length - 1) {
    activeIndex.value++
  } else {
    activeIndex.value = 0
  }
}

// 直接跳转到指定索引
const toSlide = (index) => {
  activeIndex.value = index
}

// 点击卡片：有详情页的项目跳转，否则仅轮播居中
const handleCardClick = (project, index) => {
  if (project.detail) {
    router.push(`/portfolio/${project.detail}`)
  } else {
    toSlide(index)
  }
}

// 鼠标滚轮切换轮播项目（700ms 节流，防止连续滚动过快）
const handleWheel = (e) => {
  e.preventDefault()
  const now = Date.now()
  if (now - lastWheel.value < 700) return
  lastWheel.value = now
  if (e.deltaY > 0) {
    toNext()
  } else {
    toPrev()
  }
}

onMounted(() => {
  if (viewRef.value) {
    viewRef.value.addEventListener('wheel', handleWheel, { passive: false })
  }
})

onUnmounted(() => {
  if (viewRef.value) {
    viewRef.value.removeEventListener('wheel', handleWheel)
  }
})
</script>

<style scoped>
.portfolio-view {
  max-width: 1200px;
  overflow: hidden;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--nyc-black);
  margin-bottom: 20px;
}

.divider {
  width: 80px;
  height: 5px;
  background-color: var(--nyc-green);
  margin-bottom: 50px;
}

/* 轮播容器 */
.carousel-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  perspective: 1000px;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  gap: 0;
  transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transform-style: preserve-3d;
}

.carousel-card {
  flex-shrink: 0;
  width: 300px;
  height: 400px;
  border: 3px solid var(--nyc-black);
  background-color: var(--nyc-white);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backface-visibility: hidden;
  transform-origin: center center;
}

/* 卡片封面图 */
.card-media {
  width: 100%;
  height: 230px;
  flex-shrink: 0;
  background-color: #f0f0f0;
  overflow: hidden;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.carousel-card:hover .card-media img {
  transform: scale(1.05);
}

.carousel-card.active {
  border-color: var(--nyc-yellow);
  box-shadow: 8px 8px 0px var(--nyc-green);
}

.carousel-card:hover:not(.active) {
  border-color: var(--nyc-green);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 24px;
  text-align: center;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--nyc-black);
  margin-bottom: 15px;
}

.card-desc {
  font-size: 14px;
  font-weight: 600;
  color: var(--nyc-black);
  opacity: 0.8;
  line-height: 1.6;
}

/* 控制按钮区域 */
.controls {
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 24px;
  background-color: rgba(236, 236, 236, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--nyc-black);
  transition: all 0.2s ease;
  border-radius: 50%;
}

.control-btn:hover:not(:disabled) {
  background-color: var(--nyc-yellow);
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--nyc-black);
  opacity: 0.3;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  width: 28px;
  opacity: 1;
  background-color: var(--nyc-black);
}

.dot:hover:not(.active) {
  opacity: 0.6;
}

.wheel-hint {
  margin-top: 16px;
  font-size: 12px;
  font-weight: 700;
  color: #999;
  letter-spacing: 1px;
}
</style>
