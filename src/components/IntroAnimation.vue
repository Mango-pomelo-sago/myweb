<template>
  <div class="intro-animation" :class="{ 'animation-complete': isComplete }">
    <!-- SVG 地铁线路层 -->
    <svg class="subway-map" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
      <!-- 线路 1: 红色 (横向贯穿 - 保持横平竖直) -->
      <path class="line-red path-animate" d="M -1000,300 H 500 C 600,300 600,400 700,500 H 1100 C 1200,500 1300,400 1500,300 H 3000" />
      <circle class="station station-animate" cx="500" cy="300" />
      <circle class="station station-animate" cx="700" cy="500" />
      <circle class="station station-animate" cx="1100" cy="500" />
      <circle class="station station-animate" cx="1500" cy="300" />

      <!-- 线路 2: 绿色 (纵向贯穿 - 保持横平竖直) -->
      <path class="line-green path-animate" style="animation-delay: 0.1s" d="M 300,-1000 V 200 C 300,300 400,300 500,400 V 800 C 500,900 400,1000 300,1000 V 2000" />
      <circle class="station station-animate" cx="300" cy="200" />
      <circle class="station station-animate" cx="500" cy="400" />
      <circle class="station station-animate" cx="500" cy="800" />

      <!-- 线路 3: 蓝色 (斜向交叉 - 保持横平竖直) -->
      <path class="line-blue path-animate" style="animation-delay: 0.2s" d="M -1000,800 H 200 C 200,700 300,600 600,600 H 1000 C 1100,600 1200,700 1400,600 H 3000" />
      <circle class="station station-animate" cx="200" cy="600" />
      <circle class="station station-animate" cx="600" cy="600" />
      <circle class="station station-animate" cx="1000" cy="800" />

      <!-- 线路 4: 黄色 (横向顶部贯穿 - 保持横平竖直) -->
      <path class="line-yellow path-animate" style="animation-delay: 0.3s" d="M -1000,150 H 400 H 800 H 1200 H 3000" />
      <circle class="station station-animate" cx="400" cy="150" />
      <circle class="station station-animate" cx="800" cy="150" />

      <!-- 线路 5: 橙色 (纵向右侧贯穿 - 保持横平竖直) -->
      <path class="line-orange path-animate" style="animation-delay: 0.4s" d="M 1400,-1000 V 300 V 700 V 2000" />
      <circle class="station station-animate" cx="1400" cy="300" />
      <circle class="station station-animate" cx="1400" cy="700" />

      <!-- 线路 6: 紫色 (连接线 - 保持横平竖直并延伸至屏幕外) -->
      <path class="line-purple path-animate" style="animation-delay: 0.5s" d="M 800,500 V 800 H 3000" />
      <circle class="station station-animate" cx="800" cy="800" />
    </svg>

    <!-- 文字内容层 -->
    <div class="content-layer">
      <h1 class="main-title slide-in" style="animation-delay: 2.2s">{{ profile.name }}</h1>
      <p class="sub-title slide-in" style="animation-delay: 2.3s">{{ profile.slogan }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import data from '../../data.json'

const profile = ref(data.profile)
const isComplete = ref(false)

onMounted(() => {
  // 2.5s 后标记动画完成，允许交互
  setTimeout(() => {
    isComplete.value = true
  }, 2500)
})
</script>

<style scoped>
.intro-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--nyc-white);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* 默认禁止交互 */
}

/* 动画完成后隐藏遮罩层 */
.intro-animation.animation-complete {
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none; /* 动画完成后依然不阻挡交互 */
}

.subway-map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 线路颜色定义 */
.line-red { stroke: #FF6B6B; stroke-width: 8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.line-green { stroke: #4ECDC4; stroke-width: 8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.line-blue { stroke: #5D9CEC; stroke-width: 8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.line-yellow { stroke: #FFD100; stroke-width: 8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.line-orange { stroke: #FFA94D; stroke-width: 8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.line-purple { stroke: #AC92EC; stroke-width: 8; fill: none; stroke-linecap: round; stroke-linejoin: round; }

.station { fill: #F0F0F0; stroke: #CCCCCC; stroke-width: 2; r: 6; opacity: 0; }

/* 线路生长动画 */
.path-animate {
  stroke-dasharray: 4000;
  stroke-dashoffset: 4000;
  animation: drawLine 2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

/* 站点显现动画 */
.station-animate {
  animation: showStation 0.3s ease-out forwards;
  animation-delay: 2s;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

@keyframes showStation {
  to { opacity: 1; }
}

.content-layer {
  position: relative;
  z-index: 2;
  text-align: left;
  margin-left: 10%;
}

.main-title {
  font-size: 80px;
  font-weight: 700;
  color: var(--nyc-black);
  margin-bottom: 20px;
  transform: translateX(-100px);
  opacity: 0;
}

.sub-title {
  font-size: 32px;
  font-weight: 500;
  color: var(--nyc-black);
  transform: translateX(-100px);
  opacity: 0;
}

/* 文字滑入动画 */
.slide-in {
  animation: slideInText 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes slideInText {
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
