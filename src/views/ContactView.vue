<template>
  <div class="contact-view">
    <div class="title-area">
      <h1 class="page-title">联系我</h1>
      <span class="subtitle">
        <LetterPlay text="CONTACT" accent="var(--nyc-green)" />
      </span>
    </div>
    <div class="divider"></div>
    
    <div class="contact-layout">
      <!-- 左侧：联系信息 -->
      <div class="contact-info">
        <div class="contact-item">
          <span class="label">邮箱</span>
          <a :href="'mailto:' + data.profile.contact.email" class="value">
            {{ data.profile.contact.email }}
          </a>
        </div>

        <div class="contact-item">
          <span class="label">GitHub</span>
          <a :href="data.profile.contact.github" target="_blank" class="value">
            {{ data.profile.contact.githubName }}
          </a>
        </div>

        <div class="contact-item">
          <span class="label">抖音</span>
          <a :href="data.profile.contact.douyin" target="_blank" class="value">
            {{ data.profile.contact.douyinName }}
          </a>
        </div>

        <div class="contact-item">
          <span class="label">小红书</span>
          <a :href="data.profile.contact.xiaohongshu" target="_blank" class="value">
            {{ data.profile.contact.xiaohongshuName }}
          </a>
        </div>
      </div>

      <!-- 右侧：装饰图片 -->
      <div class="contact-image">
        <div id="fixed-bg">
          <canvas ref="canvasRef" id="c"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { siteData, loadSiteData } from '../utils/dataLoader'
import landscapeImg from '@/assets/images/landscape.png'
import LetterPlay from '../components/LetterPlay.vue'

const data = siteData

const canvasRef = ref(null)

// 严格按照原始代码的变量和逻辑
let canvas, ctx
const cw = 2000 // 原始代码中的 canvas 尺寸
const ch = cw
let boxes = []

// 鼠标对象（原始代码中的 m）
const mouse = {
  x: cw / 2,
  y: ch / 2,
  s: 1.5,
  x2: cw / 2,
  y2: ch / 2
}

const props = {
  img: landscapeImg,
  boxSize: 60, // 增大网格尺寸，减少粒子数量（从40改为60）
  fade: false, // 原始代码中的 fade: false
  dots: true, // 原始代码中的 dots: true
  dotColor: '#FFFFFF' // 白色粒子
}

let imgObj = null
let animationFrameId = null
let imagePixelData = null // 存储图片像素数据

// 模拟 GSAP 的 quickTo（使用 gsap.utils.clamp 的逻辑）
function gsapUtilsClamp(min, max, value) {
  return Math.min(max, Math.max(min, value))
}

// 创建平滑动画（模拟 gsap.quickTo）
function createQuickTo(obj, prop, duration = 1, ease = 'power2') {
  let current = obj[prop]
  let target = current
  const easeFactor = ease === 'expo' ? 0.9 : 0.7
  
  return {
    set: (value) => { target = value },
    update: () => {
      const diff = target - current
      current += diff * easeFactor
      obj[prop] = current
    }
  }
}

let xTo, yTo, sTo

// 提取图片的像素数据（用于检测哪些位置有内容）
function extractImagePixelData(img) {
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  tempCanvas.width = cw
  tempCanvas.height = ch
  
  // 计算缩放比例，让图片适应 canvas（与 update 中保持一致）
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
  const imgWidth = img.naturalWidth * scale
  const imgHeight = img.naturalHeight * scale
  const imgX = (cw - imgWidth) / 2
  const imgY = (ch - imgHeight) / 2
  
  // 将图片按原始比例绘制到临时 canvas（居中，不拉伸）
  tempCtx.drawImage(img, imgX, imgY, imgWidth, imgHeight)
  
  // 获取像素数据
  return tempCtx.getImageData(0, 0, cw, ch)
}

// 检测某个位置是否有内容（alpha > 10）
function hasContentAt(x, y) {
  if (!imagePixelData) return true
  
  const idx = (Math.floor(y) * cw + Math.floor(x)) * 4
  const alpha = imagePixelData.data[idx + 3]
  
  return alpha > 10
}

// 原始代码中的 initImg 函数
function initImg() {
  boxes = []
  
  // 提取图片像素数据
  imagePixelData = extractImagePixelData(imgObj)
  
  // 计算图片实际显示的区域
  const scale = Math.min(cw / imgObj.naturalWidth, ch / imgObj.naturalHeight)
  const imgWidth = imgObj.naturalWidth * scale
  const imgHeight = imgObj.naturalHeight * scale
  const imgX = (cw - imgWidth) / 2
  const imgY = (ch - imgHeight) / 2
  
  console.log(`图片实际显示区域: X=${imgX.toFixed(0)}, Y=${imgY.toFixed(0)}, W=${imgWidth.toFixed(0)}, H=${imgHeight.toFixed(0)}`)
  
  // 只在图片实际显示区域内创建网格（采样优化：每隔一个点检测一次）
  const step = 1 // 可以改为2来进一步减少粒子数量
  for (let x = imgX; x < imgX + imgWidth; x += props.boxSize * step) {
    for (let y = imgY; y < imgY + imgHeight; y += props.boxSize * step) {
      // 检测这个位置是否有图片内容
      if (hasContentAt(x, y)) {
        boxes.push({ x, y, d: 0, s: 0 })
      }
    }
  }
  
  console.log(`粒子数量: ${boxes.length}（已优化）`)
  
  // 初始化 quickTo
  xTo = createQuickTo(mouse, 'x2', 1, 'expo')
  yTo = createQuickTo(mouse, 'y2', 1, 'expo')
  sTo = createQuickTo(mouse, 's', 2, 'power2')
}

// 原始代码中的 update 函数
function update() {
  const d = Math.hypot((mouse.x - mouse.x2), (mouse.y - mouse.y2))
  sTo.set(d / cw * 2)
  
  // 更新平滑动画
  xTo.update()
  yTo.update()
  sTo.update()
  
  ctx.clearRect(0, 0, cw, ch)
  
  // 绘制图片（按原始比例居中显示）
  if (imgObj) {
    ctx.globalAlpha = 1
    
    // 计算缩放比例，让图片适应 canvas
    const scale = Math.min(cw / imgObj.naturalWidth, ch / imgObj.naturalHeight)
    const imgWidth = imgObj.naturalWidth * scale
    const imgHeight = imgObj.naturalHeight * scale
    const imgX = (cw - imgWidth) / 2
    const imgY = (ch - imgHeight) / 2
    
    ctx.drawImage(imgObj, imgX, imgY, imgWidth, imgHeight)
  }
  
  boxes.forEach(drawImg)
  
  if (props.fade) ctx.globalAlpha = 1
  if (props.dots) boxes.forEach(drawDots)
  
  animationFrameId = requestAnimationFrame(update)
}

// 原始代码中的 drawImg 函数（性能优化：跳过不可见的方块）
function drawImg(c) {
  c.d = Math.hypot((c.x - mouse.x), (c.y - mouse.y))
  c.s = 1 - gsapUtilsClamp(0, 1, c.d / cw / mouse.s)
  
  if (c.s < 0.001) return // 完全不可见，跳过绘制
  
  let boxScaled = props.boxSize * c.s
  
  if (props.fade) ctx.globalAlpha = c.s
  
  // 注意：这里 drawImage 的参数顺序是 (image, sx, sy, sw, sh, dx, dy, dw, dh)
  // 从原图中裁剪一个小区域 (c.x + offset, c.y + offset, 缩小的尺寸) 绘制到目标位置 (c.x, c.y, boxSize, boxSize)
  // 原始代码中图片被拉伸到 cw x ch，所以这里也需要对应缩放
  ctx.drawImage(
    imgObj,
    c.x + boxScaled / 2,
    c.y + boxScaled / 2,
    props.boxSize - boxScaled,
    props.boxSize - boxScaled,
    c.x,
    c.y,
    props.boxSize,
    props.boxSize
  )
}

// 原始代码中的 drawDots 函数（修改为根据距离动态调整大小）
function drawDots(c) {
  // 计算该点到鼠标的距离
  const dist = Math.hypot(c.x - mouse.x2, c.y - mouse.y2)
  
  // 定义影响范围（像素）
  const maxDist = 300 // 最大影响距离
  
  if (dist > maxDist) return // 超出范围不绘制（性能优化：提前退出）
  
  // 距离越近，粒子越大、越密集（通过增大半径模拟）
  const normalizedDist = 1 - (dist / maxDist) // 0-1，越近越接近1
  const baseRadius = props.boxSize * 0.08 // 基础半径
  const dynamicRadius = baseRadius * (0.3 + normalizedDist * 1.5) // 范围从 0.3x 到 1.8x
  
  // 设置透明度：越近越不透明
  ctx.globalAlpha = 0.3 + normalizedDist * 0.7 // 0.3 到 1.0
  
  ctx.beginPath()
  ctx.arc(c.x, c.y, dynamicRadius, 0, Math.PI * 2)
  ctx.fill()
  
  // 恢复全局透明度
  ctx.globalAlpha = 1
}

// 原始代码中的 pointermove 事件处理
function handlePointerMove(e) {
  const cRect = canvas.getBoundingClientRect()
  const sx = cw / cRect.width
  const sy = ch / cRect.height
  
  mouse.x2 = (e.clientX - cRect.left) * sx
  mouse.y2 = (e.clientY - cRect.top) * sy
  
  xTo.set(mouse.x2)
  yTo.set(mouse.y2)
}

// resize 事件处理
function handleResize() {
  const cRect = canvas.getBoundingClientRect()
  // 更新缩放比例（如果需要动态调整）
}

onMounted(() => {
  loadSiteData()
  canvas = canvasRef.value
  if (!canvas) return
  
  ctx = canvas.getContext('2d')
  
  // 设置 canvas 尺寸（原始代码中是正方形）
  canvas.width = cw
  canvas.height = ch
  
  // 设置粒子颜色
  ctx.fillStyle = props.dotColor
  
  // 加载图片
  imgObj = new Image()
  imgObj.crossOrigin = 'Anonymous'
  imgObj.src = props.img
  
  imgObj.onload = () => {
    // 提取像素数据并初始化
    initImg()
    
    // 添加 GSAP ticker 类似的动画循环
    update()
  }
  
  // 添加事件监听
  canvas.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (canvas) {
    canvas.removeEventListener('pointermove', handlePointerMove)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.contact-view {
  max-width: 1200px;
  margin-left: 80px; /* 与导航栏"首页"菜单项左对齐 */
}

/* 标题区：与 CLAUDE.md 垂直居中方案一致 */
.title-area {
  flex-shrink: 0;
  margin-top: auto;
  margin-bottom: 20px;
}

.subtitle {
  display: block;
  margin-top: 4px;
  margin-bottom: 12px;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--nyc-black);
  margin-bottom: 0;
}

.contact-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
}

.divider {
  width: 80px;
  height: 5px;
  background-color: var(--nyc-yellow);
  margin-bottom: 50px;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.contact-item {
  display: flex;
  align-items: baseline;
  gap: 20px;
}

.label {
  font-size: 16px;
  font-weight: 700;
  color: var(--nyc-green);
  min-width: 100px;
}

.value {
  font-size: 18px;
  font-weight: 600;
  color: var(--nyc-black);
  position: relative;
  display: inline-block;
  transition: color 0.2s ease;
  /* 参考 Codrops LineHoverStyles 效果 08 (link--kale) */
}

/* 粗条：悬停时从底部向上展开、划过后缩回 */
.value::before {
  content: '';
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  height: 10px;
  background: currentColor;
  opacity: 0;
  pointer-events: none;
}

.value:hover::before {
  opacity: 1;
  animation: lineUp 0.3s ease forwards;
}

@keyframes lineUp {
  0% {
    transform-origin: 50% 100%;
    transform: scale3d(1, 0.045, 1);
  }

  50% {
    transform-origin: 50% 100%;
    transform: scale3d(1, 1, 1);
  }

  51% {
    transform-origin: 50% 0%;
    transform: scale3d(1, 1, 1);
  }

  100% {
    transform-origin: 50% 0%;
    transform: scale3d(1, 0.045, 1);
  }
}

/* 细线：悬停后延迟 0.3s 淡入 */
.value::after {
  content: '';
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  height: 1px;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.3s;
}

.value:hover::after {
  opacity: 1;
  transition-delay: 0.3s;
}

.value:hover {
  color: var(--nyc-yellow);
}

.contact-image {
  flex-shrink: 0;
  width: 600px; /* 放大图片 */
  height: 600px; /* 放大图片 */
  position: relative;
  overflow: visible;
}

#fixed-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

#fixed-bg canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

@media (max-width: 768px) {
  .contact-view {
    margin-left: 0;           /* 复位桌面端缩进 */
  }

  .contact-layout {
    flex-direction: column;
    gap: 30px;
  }

  .contact-image {
    width: 100%;
    height: 400px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 32px;
  }

  .contact-image {
    height: 300px;
  }
}

.action-area {
  margin-top: 40px;
}

.cta-button {
  display: inline-block;
  padding: 16px 40px;
  background-color: var(--nyc-black);
  color: var(--nyc-white);
  font-size: 18px;
  font-weight: 700;
  border: 3px solid var(--nyc-black);
  transition: all 0.2s ease;
}

.cta-button:hover {
  background-color: var(--nyc-white);
  color: var(--nyc-black);
  box-shadow: 6px 6px 0px var(--nyc-yellow);
}
</style>
