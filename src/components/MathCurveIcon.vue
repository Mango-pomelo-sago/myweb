<template>
  <div class="math-curve-icon" :style="{ width: size + 'px', height: size + 'px' }">
    <canvas
      ref="canvasEl"
      :width="canvasW"
      :height="canvasH"
      class="math-curve-icon__canvas"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  config: { type: Object, required: true },
  size: { type: Number, default: 36 },
  color: { type: String, default: '#00935F' },
})

const canvasEl = ref(null)
const dpr = ref(typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1)
const canvasW = computed(() => props.size * dpr.value)
const canvasH = computed(() => props.size * dpr.value)

let animId = null
let t0 = 0

// ---- math-curve-loaders 核心数学函数 ----
function normalizeProgress(p) {
  return ((p % 1) + 1) % 1
}

function getDetailScale(time, config) {
  const pulseProgress = ((time % config.pulseDurationMs) / config.pulseDurationMs)
  const pulseAngle = pulseProgress * Math.PI * 2
  return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48
}

function getRotation(time, config) {
  if (!config.rotate) return 0
  return -((time % config.rotationDurationMs) / config.rotationDurationMs) * 360
}

function calcPoint(progress, detailScale, config) {
  const t = progress * Math.PI * 2
  if (config.baseRadius !== undefined) {
    // Thinking 曲线
    const petals = Math.round(config.petalCount)
    const x = config.baseRadius * Math.cos(t) - config.detailAmplitude * detailScale * Math.cos(petals * t)
    const y = config.baseRadius * Math.sin(t) - config.detailAmplitude * detailScale * Math.sin(petals * t)
    return { x: 50 + x * config.curveScale, y: 50 + y * config.curveScale }
  }
  // Rose 曲线
  const a = config.roseA + detailScale * config.roseABoost
  const k = Math.round(config.roseK)
  const r = a * (config.roseBreathBase + detailScale * config.roseBreathBoost) * Math.cos(k * t)
  return { x: 50 + Math.cos(t) * r * config.roseScale, y: 50 + Math.sin(t) * r * config.roseScale }
}

function buildPathPoints(detailScale, config, steps) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    pts.push(calcPoint(i / steps, detailScale, config))
  }
  return pts
}

// ---- 绘制 ----
function draw(ctx, time, config, w, h, dp) {
  ctx.clearRect(0, 0, w, h)
  ctx.save()
  ctx.scale(dp, dp)

  const logical = w / dp
  const detailScale = getDetailScale(time, config)
  const rotation = getRotation(time, config)
  const vScale = logical / 100

  // 旋转
  ctx.translate(logical / 2, logical / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-logical / 2, -logical / 2)

  // ---- 绘制路径（半透明轮廓） ----
  const steps = 120
  const pts = buildPathPoints(detailScale, config, steps)

  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const px = pts[i].x * vScale
    const py = pts[i].y * vScale
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.strokeStyle = props.color
  ctx.lineWidth = Math.max(1, config.strokeWidth * vScale * 0.65)
  ctx.globalAlpha = 0.18
  ctx.stroke()

  // ---- 绘制粒子（拖尾） ----
  // 用连续线段替代离散圆点:外发光层(加宽半透明) + 内芯层,拖尾从尾到头平滑增亮,
  // 观感是一条流动的光带而非一粒粒的粒子
  const trailSegments = 56
  const progress = (time % config.durationMs) / config.durationMs
  const span = Math.min(config.trailSpan, 0.5)
  const segWidth = Math.max(1, config.strokeWidth * vScale * 0.65)

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let i = 0; i < trailSegments; i++) {
    const k = i / (trailSegments - 1)
    const fade = Math.pow(1 - k, 0.8)
    if (fade <= 0.008) continue
    const tA = normalizeProgress(progress - k * span)
    const tB = normalizeProgress(progress - (k + 1 / (trailSegments - 1)) * span)
    const p0 = calcPoint(tA, detailScale, config)
    const p1 = calcPoint(tB, detailScale, config)

    ctx.beginPath()
    ctx.moveTo(p0.x * vScale, p0.y * vScale)
    ctx.lineTo(p1.x * vScale, p1.y * vScale)
    ctx.strokeStyle = props.color
    ctx.globalAlpha = 1
    ctx.lineWidth = segWidth
    ctx.stroke()
  }

  // 头部亮点:唯一的实心圆点,强调运动方向
  const head = calcPoint(progress, detailScale, config)
  ctx.beginPath()
  ctx.arc(head.x * vScale, head.y * vScale, segWidth * 0.9, 0, Math.PI * 2)
  ctx.fillStyle = props.color
  ctx.globalAlpha = 1
  ctx.fill()

  ctx.restore()
}

// ---- 动画循环 ----
function tick(time) {
  if (!canvasEl.value) return
  if (!t0) t0 = time
  const elapsed = time - t0
  const ctx = canvasEl.value.getContext('2d')
  draw(ctx, elapsed, props.config, canvasEl.value.width, canvasEl.value.height, dpr.value)
  animId = requestAnimationFrame(tick)
}

onMounted(() => {
  animId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.math-curve-icon {
  flex-shrink: 0;
  line-height: 0;
}
.math-curve-icon__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>