<template>
  <svg
    ref="svgEl"
    class="contour-bg"
    viewBox="0 0 1440 900"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <g
      v-for="(line, i) in lines"
      :key="i"
      class="contour-line"
      :style="lineStyle(i)"
    >
      <path
        vector-effect="non-scaling-stroke"
        :d="line.d"
        :stroke="line.stroke"
        fill="none"
      />
    </g>
  </svg>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const W = 1440
const SAMPLES = 150

// 生成一条平滑的波浪线：叠加两个不同尺度的正弦，形成类似等高线的有机曲线
function wavePath(y, amp, wl, phase) {
  let d = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const x = (i / SAMPLES) * W
    const wave =
      Math.sin((x / wl) * Math.PI * 2 + phase) * amp +
      Math.sin((x / (wl * 0.37)) * Math.PI * 2 + phase * 1.7) * amp * 0.35
    const py = y + wave
    if (i === 0) d += `M ${x.toFixed(1)} ${py.toFixed(1)}`
    else d += ` L ${x.toFixed(1)} ${py.toFixed(1)}`
  }
  return d
}

// 等高线配置：垂直位置 / 振幅 / 波长 / 波动速度 / 初始相位 / 线条颜色
const configs = [
  { y: 105, amp: 16, wl: 540, speed: 0.28, phase: 0.0, stroke: '#dcdcdc', opacity: 0.9 },
  { y: 195, amp: 26, wl: 430, speed: 0.23, phase: 1.3, stroke: '#dddddd', opacity: 0.85 },
  { y: 285, amp: 20, wl: 560, speed: 0.32, phase: 2.6, stroke: '#dbdbdb', opacity: 0.75 },
  { y: 375, amp: 32, wl: 380, speed: 0.20, phase: 0.7, stroke: '#d9d9d9', opacity: 0.65 },
  { y: 465, amp: 24, wl: 600, speed: 0.30, phase: 1.9, stroke: '#d8d8d8', opacity: 0.6 },
  { y: 555, amp: 18, wl: 460, speed: 0.26, phase: 3.2, stroke: '#dadada', opacity: 0.7 },
  { y: 645, amp: 30, wl: 420, speed: 0.22, phase: 0.4, stroke: '#d7d7d7', opacity: 0.6 },
  { y: 735, amp: 22, wl: 540, speed: 0.31, phase: 2.2, stroke: '#dcdcdc', opacity: 0.8 },
  { y: 825, amp: 16, wl: 600, speed: 0.27, phase: 1.1, stroke: '#dedede', opacity: 0.9 }
]

// 每条线独立的“呼吸”节奏（时长 / 延迟），错开形成层次
const lines = configs.map((c, i) => ({
  ...c,
  d: wavePath(c.y, c.amp, c.wl, c.phase),
  breatheDur: 7 + (i % 4) * 1.5,
  breatheDelay: i * 0.65
}))

const lineStyle = (i) => {
  const l = lines[i]
  return {
    '--dur': `${l.breatheDur}s`,
    '--delay': `${l.breatheDelay}s`,
    '--o-min': String(Math.max(0, l.opacity - 0.22)),
    '--o-max': String(Math.min(1, l.opacity + 0.08))
  }
}

const svgEl = ref(null)
let pathEls = []
let rafId = 0
let startTime = 0

const tick = (now) => {
  const t = (now - startTime) / 1000
  lines.forEach((l, i) => {
    const el = pathEls[i]
    if (el) el.setAttribute('d', wavePath(l.y, l.amp, l.wl, l.phase + t * l.speed))
  })
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  pathEls = Array.from(svgEl.value.querySelectorAll('path'))
  // 尊重系统“减少动态效果”设置，此时仅显示静态线条
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) {
    startTime = performance.now()
    rafId = requestAnimationFrame(tick)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.contour-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.contour-line {
  animation: contour-breathe var(--dur, 8s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

.contour-line path {
  fill: none;
  stroke-width: 1;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 呼吸感：每条线以自己的节奏淡入淡出 */
@keyframes contour-breathe {
  0%,
  100% {
    opacity: var(--o-min, 0.5);
  }
  50% {
    opacity: var(--o-max, 0.85);
  }
}
</style>
