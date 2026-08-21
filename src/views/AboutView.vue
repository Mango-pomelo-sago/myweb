<template>
  <div class="about-view">
    <!-- Three.js canvas容器 -->
    <div ref="canvasContainer" class="canvas-container"></div>
    
    <!-- 滚动 spacer，提供滚动范围 -->
    <div class="scroll-spacer" aria-hidden="true"></div>
    
    <!-- 隐藏的HTML内容，用于生成纹理（放在屏幕外） -->
    <div class="page-host" id="page-host" aria-hidden="true">
      <div class="page" id="page">
        <section
          v-for="(slide, i) in aboutSlides"
          :key="i"
          class="slide"
          :class="'slide-' + (i + 1)"
        >
          <h1>{{ slide.title }}</h1>
          <p class="small-text">{{ slide.text }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import Lenis from 'lenis'
import { siteData, loadSiteData } from '../utils/dataLoader'

const canvasContainer = ref(null)

// 关于我内容（默认值，加载到 data.json 数据后由 renderAboutSlides 覆盖）
const about = ref({
  content: '你好，我是杨枝甘鹿。',
  skills: ''
})
const aboutSlides = ref([
  { title: 'ABOUT ME', text: '' },
  { title: 'MANGO', text: '' },
  { title: 'POMELO', text: '' },
  { title: 'SAGO', text: '' },
])

// 常量定义（完全照搬原项目）
const CAMERA_FOV = 45
const REST_POSITION = new THREE.Vector3(0, 0, 15)
const LOOK_TARGET = new THREE.Vector3(0, -1, -4)

let scene, camera, renderer, lenis
let projectorCamera
let meshes = []
let projector = null
let htmlToCanvas = null

// Smoothstep 函数（完全照搬原项目）
function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

// 关键帧值（完全照搬原项目）
function keyframeValue(progress) {
  const KEYFRAMES = [
    { x: 0, y: 0, z: 0, roll: 0 },
    { x: 20, y: -2, z: -10, roll: 0.22 },
    { x: -15, y: 10, z: -5, roll: -0.22 },
    { x: 0, y: 0, z: 0, roll: 0 },
  ]

  const segments = KEYFRAMES.length - 1
  const scaled = progress * segments
  const idx = Math.min(Math.floor(scaled), segments - 1)
  const t = smoothstep(scaled - idx)
  const a = KEYFRAMES[idx]
  const b = KEYFRAMES[idx + 1]
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
    roll: a.roll + (b.roll - a.roll) * t,
  }
}

// 创建投影器（完全照搬原项目的 ProjectedMaterial.js）
function createProjector({ camera, texture }) {
  const uniforms = {
    projectedTexture: { value: texture },
    projectorViewMatrix: { value: new THREE.Matrix4() },
    projectorProjectionMatrix: { value: new THREE.Matrix4() },
    projectorPosition: { value: new THREE.Vector3() },
    uLitness: { value: 0 },
  }

  function applyTo(mesh) {
    const material = mesh.material
    if (!material) return

    material.onBeforeCompile = (shader) => {
      shader.uniforms.projectedTexture = uniforms.projectedTexture
      shader.uniforms.projectorViewMatrix = uniforms.projectorViewMatrix
      shader.uniforms.projectorProjectionMatrix = uniforms.projectorProjectionMatrix
      shader.uniforms.projectorPosition = uniforms.projectorPosition
      shader.uniforms.uLitness = uniforms.uLitness

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform mat4 projectorViewMatrix;
          uniform mat4 projectorProjectionMatrix;
          uniform vec3 projectorPosition;
          varying vec4 vProjectedCoord;
          varying vec3 vProjectorDir;
          varying vec3 vProjectorNormal;
          `
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vec4 _projWorld = modelMatrix * vec4(transformed, 1.0);
          vProjectedCoord = projectorProjectionMatrix * projectorViewMatrix * _projWorld;
          vProjectorDir = normalize(projectorPosition - _projWorld.xyz);
          vProjectorNormal = normalize(mat3(modelMatrix) * normal);
          `
        )

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform sampler2D projectedTexture;
          uniform float uLitness;
          varying vec4 vProjectedCoord;
          varying vec3 vProjectorDir;
          varying vec3 vProjectorNormal;
          `
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          vec3 _projNDC = vProjectedCoord.xyz / vProjectedCoord.w;
          vec2 _projUV = _projNDC.xy * 0.5 + 0.5;
          float _inFrustum = step(0.0, _projUV.x) * step(_projUV.x, 1.0)
                             * step(0.0, _projUV.y) * step(_projUV.y, 1.0)
                             * step(-1.0, _projNDC.z) * step(_projNDC.z, 1.0);
          float _facing = step(0.0, dot(vProjectorNormal, vProjectorDir));
          vec4 _projColor = texture2D(projectedTexture, _projUV);
          float _mask = _inFrustum * _facing * _projColor.a;
          diffuseColor.rgb = mix(diffuseColor.rgb, _projColor.rgb, _mask);
          vec3 _flatDiffuse = diffuseColor.rgb;
          `
        )
        .replace(
          '#include <opaque_fragment>',
          `#include <opaque_fragment>
          gl_FragColor.rgb = mix(_flatDiffuse, gl_FragColor.rgb, uLitness);
          `
        )
    }

    material.needsUpdate = true
  }

  function update() {
    camera.updateMatrixWorld()
    uniforms.projectorViewMatrix.value.copy(camera.matrixWorldInverse)
    uniforms.projectorProjectionMatrix.value.copy(camera.projectionMatrix)
    uniforms.projectorPosition.value.setFromMatrixPosition(camera.matrixWorld)
  }

  return { applyTo, update, uniforms, camera }
}

// HTML转Canvas（完全照搬原项目的 HtmlToCanvas.js）
class HtmlToCanvasClass {
  constructor(element, { width, height, pixelRatio = 2 } = {}) {
    this.element = element
    this.pixelRatio = pixelRatio
    this.extraCss = ''

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.minFilter = THREE.LinearFilter
    this.texture.magFilter = THREE.LinearFilter
    this.texture.generateMipmaps = false

    this._rendering = false
    this._pending = false
    this._current = null
    this.resize(width ?? window.innerWidth, height ?? window.innerHeight)
  }

  resize(width, height) {
    this.width = width
    this.height = height
  }

  async update() {
    if (this._rendering) {
      this._pending = true
      return this._current
    }

    this._rendering = true
    this._current = (async () => {
      try {
        do {
          this._pending = false
          const nextW = Math.floor(this.width * this.pixelRatio)
          const nextH = Math.floor(this.height * this.pixelRatio)
          if (nextW !== this.canvas.width || nextH !== this.canvas.height) {
            this.canvas.width = nextW
            this.canvas.height = nextH
            this.texture.dispose()
          }

          const url = this.#buildSvgDataUrl()
          const img = new Image()
          img.src = url
          await img.decode()

          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
          this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)

          this.texture.needsUpdate = true
        } while (this._pending)
      } finally {
        this._rendering = false
        this._current = null
      }
    })()

    return this._current
  }

  #buildSvgDataUrl() {
    const serialized = new XMLSerializer().serializeToString(this.element)
    const styleBlock = this.extraCss
      ? `<style xmlns="http://www.w3.org/1999/xhtml">/*<![CDATA[*/${this.extraCss}/*]]>*/</style>`
      : ''

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">
        <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${this.width}px;height:${this.height}px;">
        ${styleBlock}
        ${serialized}
        </div>
        </foreignObject>
        </svg>`
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  }

  dispose() {
    this.texture.dispose()
  }
}

// 初始化场景
const initScene = () => {
  const container = canvasContainer.value
  if (!container) {
    console.error('canvasContainer 未找到')
    return
  }
  
  console.log('初始化3D场景...')
  
  // 创建场景（白色背景）
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  
  // 创建相机
  const aspect = window.innerWidth / window.innerHeight
  camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 1, 100)
  camera.position.copy(REST_POSITION)
  camera.lookAt(LOOK_TARGET)
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)
  
  console.log('渲染器已创建')
  
  // 添加灯光（完全照搬原项目）
  const ambient = new THREE.AmbientLight(0xffffff, 1.0)
  scene.add(ambient)

  const key = new THREE.DirectionalLight(0xffffff, 2.6)
  key.position.set(5, 8, 6)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 50
  key.shadow.camera.left = -15
  key.shadow.camera.right = 15
  key.shadow.camera.top = 15
  key.shadow.camera.bottom = -15
  key.shadow.bias = -0.0001
  key.shadow.normalBias = 0.02
  scene.add(key)
  
  console.log('场景初始化完成')
}

// 加载3D模型并设置投影
const loadModel = async () => {
  const loader = new GLTFLoader()
  
  // 配置 DRACOLoader
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
  loader.setDRACOLoader(dracoLoader)
  
  try {
    console.log('开始加载模型...')
    const gltf = await loader.loadAsync('/model.glb')
    console.log('模型加载成功')
    const model = gltf.scene
    
    const standardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
    })
    
    model.traverse((child) => {
      if (!child.isMesh) return

      // 所有mesh都使用standardMaterial以支持投影
      child.material = standardMaterial
      child.castShadow = true
      child.receiveShadow = true

      meshes.push(child)
    })
    
    scene.add(model)
    console.log('模型已添加到场景，mesh数量:', meshes.length)
    
    // 设置投影
    setupProjection()
  } catch (error) {
    console.error('模型加载失败:', error)
  }
}

// 设置投影（完全照搬原项目）
const setupProjection = () => {
  const projectorCam = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    camera.near,
    camera.far
  )
  projectorCam.position.copy(REST_POSITION)
  projectorCam.lookAt(LOOK_TARGET)
  projectorCam.updateMatrixWorld()
  
  const pageElement = document.getElementById('page')
  htmlToCanvas = new HtmlToCanvasClass(pageElement, {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  })

  projector = createProjector({
    camera: projectorCam,
    texture: htmlToCanvas.texture,
  })

  for (const mesh of meshes) {
    projector.applyTo(mesh)
  }
  projector.update()

  // 等待字体加载完成后进行首次栅格化
  rasterizePage()
}

// 栅格化页面
const rasterizePage = async () => {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready
  }
  
  if (!htmlToCanvas.extraCss) {
    // 收集文档CSS（简化版）
    htmlToCanvas.extraCss = collectDocumentCss()
  }
  await htmlToCanvas.update()
}

// 收集文档CSS（简化版）
const collectDocumentCss = () => {
  let css = ''
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        css += rule.cssText + '\n'
      }
    } catch (e) {
      // 跨域样式表无法访问
    }
  }
  return css
}

// 设置平滑滚动（完全照搬原项目）
const setupLenis = () => {
  lenis = new Lenis({
    infinite: true,
    smoothWheel: true,
    syncTouch: true,
    lerp: 0.08,
  })
}

// 获取滚动进度（完全照搬原项目）
const getLoopProgress = () => {
  if (!lenis) return 0
  const limit = lenis.limit
  if (!limit) return 0
  const raw = (lenis.scroll % limit) / limit
  return raw < 0 ? raw + 1 : raw
}

// 动画循环（完全照搬原项目）
const animate = () => {
  requestAnimationFrame(animate)
  
  if (lenis) {
    lenis.raf(performance.now())
  }
  
  const progress = getLoopProgress()
  
  // 更新相机位置
  const kf = keyframeValue(progress)
  camera.position.set(
    REST_POSITION.x + kf.x,
    REST_POSITION.y + kf.y,
    REST_POSITION.z + kf.z
  )
  camera.lookAt(LOOK_TARGET)
  camera.rotateZ(kf.roll)

  // 更新投影器
  if (projector) {
    const distFromRest = Math.min(progress, 1 - progress) * 2
    const t = Math.min(distFromRest / 1, 1)
    projector.uniforms.uLitness.value = smoothstep(t)
  }
  
  // 渲染场景
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

// 处理窗口大小变化
const handleResize = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  
  renderer.setSize(width, height)
  
  if (projector) {
    projector.camera.aspect = width / height
    projector.camera.updateProjectionMatrix()
    projector.update()
  }

  if (htmlToCanvas) {
    htmlToCanvas.resize(width, height)
    rasterizePage()
  }
  
  if (lenis) {
    lenis.resize()
  }
}

onMounted(async () => {
  console.log('=== AboutView 组件已挂载 ===')
  // 加载数据（优先远程，fallback 本地）
  await loadSiteData()
  if (siteData.value && siteData.value.about) {
    about.value = siteData.value.about
  }
  // 根据 about.content 构建幻灯片
  buildAboutSlides()
  await nextTick()

  initScene()
  setupLenis()
  await loadModel()
  animate()

  window.addEventListener('resize', handleResize)
  console.log('=== 初始化完成 ===')
})

// 根据 about 数据构建 4 张幻灯片
function buildAboutSlides() {
  const content = about.value.content || ''
  const skills = about.value.skills || ''
  // 粗略按段落拆分
  const paragraphs = content.split('\n\n').filter(Boolean)
  aboutSlides.value = [
    { title: 'ABOUT ME', text: paragraphs[0] || content },
    { title: 'MANGO', text: paragraphs[1] || skills || '全栈开发 / 内容创作' },
    { title: 'POMELO', text: paragraphs[2] || '' },
    { title: 'SAGO', text: paragraphs[3] || '欢迎联系我' },
  ]
  // 更新 hidden 的 HTML 幻灯片内容
  nextTick(() => {
    rasterizePage()
  })
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  if (lenis) {
    lenis.destroy()
  }
  if (renderer) {
    renderer.dispose()
  }
  if (htmlToCanvas) {
    htmlToCanvas.dispose()
  }
})
</script>

<style scoped>
.about-view {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #ffffff;
}

.canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1;
}

/* 滚动 spacer */
.scroll-spacer {
  position: relative;
  width: 1px;
  height: 400vh;
  pointer-events: none;
}

/* 隐藏的HTML内容，用于生成纹理 */
.page-host {
  position: fixed;
  top: 0;
  left: -200vw;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
}

.page {
  display: flex;
  flex-direction: column;
  position: relative; /* 为绝对定位的子元素提供参考 */
}

.slide {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background-color: #10b981; /* 绿色背景 */
  position: relative; /* 为绝对定位的子元素提供参考 */
}

.slide h1 {
  font-size: 5rem;
  margin-bottom: 1rem;
  color: #000000; /* 黑色文字 */
  font-weight: bold;
  font-family: Arial, sans-serif;
}

.slide .small-text {
  font-size: 1.5rem;
  color: #000000; /* 黑色文字 */
  font-family: Arial, sans-serif;
}

.scroll-down-text {
  display: none;
}

/* 额外投影文字 */
.extra-text {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.extra-side-left {
  left: -60vw; /* 左侧很远，初始不可见 */
}

.extra-side-right {
  right: -60vw; /* 右侧很远，初始不可见 */
}

.extra-text h2 {
  font-size: 4rem; /* 适中的字体 */
  color: #000000; /* 黑色文字 */
  font-weight: bold;
  font-family: Arial, sans-serif;
  margin: 0;
}

.text-groups,
.text-group,
.heading {
  display: none;
}


</style>
