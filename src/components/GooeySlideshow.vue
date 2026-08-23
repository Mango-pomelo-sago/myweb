<template>
  <div class="gooey-slideshow" ref="rootEl" :class="{ 'gooey': gooey, 'no-gooey': !gooey }">
    <canvas ref="canvasEl" class="gooey-canvas"></canvas>

    <p v-if="isCoarse" class="desktop-hint">鼠标悬停动效请在桌面端体验</p>

    <!-- 横向滚动区:原生 overflow-x:auto,滚轮转横向 -->
    <div class="scrollarea" ref="scrollEl">
      <ul class="slideshow-list">
        <li v-for="(slide, i) in slides" :key="slide.id" class="slideshow-list__el">
          <a
            href="#"
            class="tile js-tile"
            @click.prevent="onOpen(slide)"
            @mouseenter="onEnter(i)"
            @mouseleave="onLeave(i)"
          >
            <figure class="tile__fig">
              <img class="tile__img" :src="slide.base" :data-hover="slide.hover" :alt="slide.title" />
            </figure>
            <div class="tile__content">
              <div class="tile__head">
                <MathCurveIcon
                  v-if="slide.curveConfig"
                  :config="slide.curveConfig"
                  :size="192"
                  color="#00935F"
                  class="tile__icon"
                />
                <h2 class="tile__title title title--medium">{{ slide.title }}<span class="title__offset">{{ slide.en }}</span></h2>
              </div>
              <div class="tile__cta"><span class="btn-inline">See more</span></div>
            </div>
          </a>
        </li>
      </ul>
    </div>

    <!-- 底部滚动进度条 -->
    <div class="slideshow__progress-ctn"><span class="slideshow__progress" ref="progressEl"></span></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import gsap from 'gsap'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from '../utils/gooeyShaders.js'
import MathCurveIcon from './MathCurveIcon.vue'

const props = defineProps({
  slides: { type: Array, default: () => [] },
})
const emit = defineEmits(['open', 'progress'])

const rootEl = ref(null)
const canvasEl = ref(null)
const scrollEl = ref(null)
const progressEl = ref(null)

const isCoarse = ref(false)
const gooey = ref(false) // WebGL 是否启用(降级时为 false,img 静态展示)

const CAM_PERSPECTIVE = 800

let renderer = null
let scene = null
let camera = null
let loader = null
let tiles = []
let mouseRaw = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
let mouseSmooth = { x: mouseRaw.x, y: mouseRaw.y }
let time = 0
let disposed = false
let pending = 0 // 待加载纹理数
let ready = false // 所有纹理就绪后淡入 canvas
let firstFrameDrawn = false // 首帧绘制成功标记
let readyTimer = null // 纹理就绪兜底:超时强制静态降级,保证卡片一定可见

const fovFromHeight = (h) => (180 * (2 * Math.atan(h / 2 / CAM_PERSPECTIVE))) / Math.PI

// ---------------- 事件:open / hover ----------------
const onOpen = (slide) => emit('open', slide)

const onEnter = (i) => {
  const t = tiles[i]
  if (t) gsap.to(t.uniforms.u_progressHover, { value: 1, duration: 1, ease: 'expo.out', overwrite: 'auto' })
}
const onLeave = (i) => {
  const t = tiles[i]
  if (t) gsap.to(t.uniforms.u_progressHover, { value: 0, duration: 1, ease: 'expo.out', overwrite: 'auto' })
}

// ---------------- 横向滚动 ----------------
const onWheel = (e) => {
  if (e.ctrlKey) return // 保留 Ctrl+滚轮缩放
  e.preventDefault()
  const el = scrollEl.value
  if (el) el.scrollLeft += e.deltaY + e.deltaX
}

const updateProgress = () => {
  const el = scrollEl.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  const p = max > 0 ? el.scrollLeft / max : 0
  if (progressEl.value) progressEl.value.style.transform = `scaleX(${p})`
  emit('progress', p)
}

// ---------------- Three.js 场景 ----------------
function getBounds(img) {
  const r = img.getBoundingClientRect()
  return {
    sizes: { w: r.width, h: r.height },
    offset: { x: r.left - window.innerWidth / 2 + r.width / 2, y: -r.top + window.innerHeight / 2 - r.height / 2 },
  }
}

function createTile(img, index) {
  const slide = props.slides[index]
  if (!slide) return null

  const uniforms = {
    u_map: { value: null },
    u_hovermap: { value: null },
    u_alpha: { value: 1 },
    u_time: { value: 0 },
    u_progressHover: { value: 0 },
    u_progressClick: { value: 0 },
    u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_ratio: { value: new THREE.Vector2(1, 1) },
    u_hoverratio: { value: new THREE.Vector2(1, 1) },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    defines: { PR: window.devicePixelRatio.toFixed(1) },
  })
  const geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const tile = { mesh, material, geometry, uniforms, img, baseTex: null, hoverTex: null }

  const ratioFor = (tex, key) => {
    const b = getBounds(img)
    const r = (b.sizes.w / b.sizes.h) / (tex.image.width / tex.image.height)
    uniforms[key].value.set(r, 1)
  }

  const onTexture = (tex, key) => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    uniforms[key].value = tex
    if (key === 'u_map') tile.baseTex = tex
    else tile.hoverTex = tex
    ratioFor(tex, key === 'u_map' ? 'u_ratio' : 'u_hoverratio')
    settle()
  }

  // 纹理加载/失败都收敛 pending,确保 canvas 一定能淡入
  const settle = () => {
    pending--
    if (!ready && pending <= 0 && canvasEl.value && gooey.value) {
      ready = true
      canvasEl.value.style.opacity = '1'
    }
  }
  if (slide.base) {
    pending++
    loader.load(slide.base, (t) => onTexture(t, 'u_map'), undefined, settle)
  }
  if (slide.hover) {
    pending++
    loader.load(slide.hover, (t) => onTexture(t, 'u_hovermap'), undefined, settle)
  }
  return tile
}

function move(tile) {
  const { sizes, offset } = getBounds(tile.img)
  const k = 0.1
  tile.mesh.position.x += (offset.x - tile.mesh.position.x) * k
  tile.mesh.position.y += (offset.y - tile.mesh.position.y) * k
  tile.mesh.scale.x += (sizes.w - tile.mesh.scale.x) * k
  tile.mesh.scale.y += (sizes.h - tile.mesh.scale.y) * k
}

function animate() {
  if (disposed || !renderer) return

  // 仅在 hover 时推进时间(性能优化,参考 demo)
  let anyHover = false
  for (const t of tiles) {
    if (t.uniforms.u_progressHover.value > 0.01) {
      anyHover = true
      break
    }
  }
  if (anyHover) time += 0.016

  mouseSmooth.x += (mouseRaw.x - mouseSmooth.x) * 0.12
  mouseSmooth.y += (mouseRaw.y - mouseSmooth.y) * 0.12

  for (const t of tiles) {
    t.uniforms.u_time.value = time
    t.uniforms.u_mouse.value.set(mouseSmooth.x, mouseSmooth.y)
    move(t)
  }
  renderer.render(scene, camera)
}

// ---------------- 全局事件 ----------------
const onMouseMove = (e) => {
  mouseRaw.x = e.clientX
  mouseRaw.y = e.clientY
}

const onResize = () => {
  if (!camera || !renderer) return
  camera.fov = fovFromHeight(window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  for (const t of tiles) t.uniforms.u_res.value.set(window.innerWidth, window.innerHeight)
}

const onVisibility = () => {
  if (!renderer) return
  if (document.hidden) renderer.setAnimationLoop(null)
  else if (!disposed) renderer.setAnimationLoop(animate)
}

// 强制降级到静态图:gooey.value 置 false 后模板切 .no-gooey,img 恢复可见
function gooeyToStatic() {
  gooey.value = false
  clearTimeout(readyTimer)
  if (canvasEl.value) canvasEl.value.style.opacity = '0'
  removeGlobalListeners()
  disposeScene()
}

function removeGlobalListeners() {
  window.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('visibilitychange', onVisibility)
}

function initGooey() {
  try {
    const canvas = canvasEl.value
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x000000, 0)

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(fovFromHeight(window.innerHeight), window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.z = CAM_PERSPECTIVE

    loader = new THREE.TextureLoader()
    const imgs = scrollEl.value ? scrollEl.value.querySelectorAll('.tile__img') : []
    tiles = Array.from(imgs)
      .map((img, i) => createTile(img, i))
      .filter(Boolean)

    if (tiles.length === 0 || pending === 0) {
      // 无卡片或无需纹理:直接显示
      ready = true
      canvas.style.opacity = '1'
    }

    // 首帧先渲染一帧,确认 WebGL 可用后才淡入 canvas(避免黑屏/空白画布盖住页面)
    renderer.render(scene, camera)
    firstFrameDrawn = true
  } catch (err) {
    console.warn('[GooeySlideshow] WebGL init/render failed, fallback to static images', err)
    gooeyToStatic()
    return
  }

  window.addEventListener('mousemove', onMouseMove)
  document.addEventListener('visibilitychange', onVisibility)
  renderer.setAnimationLoop(animate)

  // 兜底:3s 内纹理仍未就绪(加载挂起/失败)则强制静态降级,保证卡片一定可见
  clearTimeout(readyTimer)
  readyTimer = setTimeout(() => {
    if (!ready) gooeyToStatic()
  }, 3000)
}

function disposeScene() {
  for (const t of tiles) {
    gsap.killTweensOf(t.uniforms.u_progressHover)
    t.geometry.dispose()
    t.material.dispose()
    t.baseTex?.dispose()
    t.hoverTex?.dispose()
  }
  tiles = []
  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
}

onMounted(async () => {
  await nextTick()

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isCoarse.value = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
  if (!reduceMotion && !isCoarse.value) {
    gooey.value = true
    initGooey()
  }

  const el = scrollEl.value
  el.addEventListener('wheel', onWheel, { passive: false })
  el.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', onResize)
  updateProgress()
})

onBeforeUnmount(() => {
  disposed = true
  renderer?.setAnimationLoop(null)

  const el = scrollEl.value
  if (el) {
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('scroll', updateProgress)
  }
  window.removeEventListener('resize', onResize)
  removeGlobalListeners()

  disposeScene()
})
</script>

<style scoped>
.gooey-slideshow {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 全屏 WebGL 画布:z-index 50 位于 content-area(z1)之上但低于 TopNav(z100),pointer-events:none 不拦截交互 */
.gooey-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s;
}

/* 横向滚动容器:隐藏滚动条,原生支持触控板横滑 */
.scrollarea {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollarea::-webkit-scrollbar {
  display: none;
}

.slideshow-list {
  display: flex;
  align-items: center;
  height: 100%;
  list-style: none;
  padding-left: 0;
  padding-top: 10vh;
}

.slideshow-list__el {
  flex: 0 0 auto;
  width: 100%;
  min-width: 25rem;
  max-width: 40vmin;
  max-height: 100%;
  margin-left: 15vw;
  display: flex;
  align-items: center;
}
.slideshow-list__el:last-child {
  margin-right: 8vw;
}
/* 奇偶错位(参考 demo 的交替 translateY),偏移量根据实际可用高度缩放到 8vh */
@media (min-width: 900px) {
  .slideshow-list__el:nth-child(odd) {
    transform: translateY(8vh);
  }
  .slideshow-list__el:nth-child(even) {
    transform: translateY(-8vh);
  }
}

.tile {
  position: relative;
  display: block;
  max-height: 100%;
}

/* 约 11:15 竖图比例,受父容器 max-height 约束 */
.tile__fig {
  position: relative;
  width: 100%;
  max-height: 100%;
  overflow: hidden;
  aspect-ratio: 11/15;
}
.tile__fig::before {
  content: '';
  display: block;
  padding-top: 136.36%;
}

/* 始终显示 img 作为基础层，WebGL canvas 叠加在上面（z-index 50, pointer-events:none）
   这样即使 WebGL 初始化慢/失败，卡片封面也始终可见。
   WebGL 就绪后 canvas 淡入覆盖 img，hover 效果通过 canvas 呈现。 */
.tile__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 1;
}
/* WebGL 就绪后隐藏 img，让 canvas 完全接管画面 */
.gooey .tile__img {
  opacity: 0;
}

.tile__content {
  position: absolute;
  left: 0;
  bottom: 1.5rem;
  width: 100%;
  z-index: 1;
  font-size: 1.4rem;
}
/* 文字行：图标在左，标题在右，垂直居中对齐 */
.tile__head {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 2%;
}
/* 数学曲线图标：透明底，直接叠在卡片图片上 */
.tile__icon {
  position: relative;
  flex-shrink: 0;
  width: 192px;
  height: 192px;
}
/* 标题溢出卡片左缘: 参考 demo 的 tile__title margin-left: -10% */
.tile__title {
  margin-left: -10%;
  color: var(--nyc-black);
  white-space: nowrap;
}
.tile__title .title__offset {
  color: var(--nyc-green);
}
.tile__cta {
  display: block;
  margin-top: 2rem;
  margin-left: 6.4%;
  line-height: 1.5;
}
.btn-inline {
  display: inline-block;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--nyc-black);
  border-bottom: 2px solid var(--nyc-yellow);
  padding-bottom: 2px;
}

.desktop-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  padding: 14px 22px;
  background: var(--nyc-yellow);
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 6px 6px 0 var(--nyc-black);
  white-space: nowrap;
}

.slideshow__progress-ctn {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 5%;
  width: 13rem;
  height: 0.4rem;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 0.4rem;
  z-index: 2;
}
.slideshow__progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 0.4rem;
  transform-origin: 0 0;
  transform: scaleX(0);
  background: var(--nyc-black);
}

@media (max-width: 768px) {
  .slideshow-list__el {
    min-width: 18rem;
    margin-left: 10vw;
  }
}

@media (max-width: 480px) {
  .slideshow-list__el {
    min-width: 14rem;
  }
}
</style>
