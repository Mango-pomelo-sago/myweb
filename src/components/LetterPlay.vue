<template>
  <span
    class="letter-play"
    ref="wordEl"
    :style="{ '--letter-color': accent }"
    :aria-label="text"
  >
    <span
      v-for="(ch, i) in letters"
      :key="i"
      class="letter"
      @mouseenter="onLetterEnter(i, $event)"
    >
      <span class="letter-inner">{{ ch }}</span>
    </span>
  </span>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

// 参考 codrops/LetterInteractions 的 "DAZIQUE"(playful) 效果：
// 每个字母拆成独立 span，悬停时按字母序号循环播放 7 种俏皮动画之一。
// 原 demo 用 anime.js + charming.js，这里改用项目已有的 GSAP 实现。

const props = defineProps({
  text: { type: String, required: true },
  accent: { type: String, default: 'var(--nyc-black)' },
})

const wordEl = ref(null)
// 空格替换为不换行空格，避免多词文本在 inline-flex 中被压缩
const letters = computed(() =>
  props.text.split('').map((ch) => (ch === ' ' ? ' ' : ch))
)
const reduceMotion = ref(false)

// 正在播放动画的字母序号；悬停同一字母在动画未完成时不重复触发
const animating = new Set()
const presets = [
  presetRotateFall,
  presetStretchPop,
  presetFlipX,
  presetOriginStretch,
  presetFlipY,
  presetFlyTop,
  presetSquash,
]

function onLetterEnter(index, event) {
  if (animating.has(index) || reduceMotion.value) return
  const inner = event.currentTarget.querySelector('.letter-inner')
  if (!inner) return
  animating.add(index)
  const tl = presets[index % presets.length](inner, wordEl.value)
  tl.eventCallback('onComplete', () => animating.delete(index))
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
onBeforeUnmount(() => {
  wordEl.value?.querySelectorAll('.letter-inner').forEach((el) => gsap.killTweensOf(el))
})

// ---- 7 种动画预设（anime.js → GSAP） ----
// 缓动对照：easeOutExpo→expo.out、easeInQuad→power2.in、
// easeOutElastic→elastic.out(1, 0.35/0.6)、[0.2,1,0.3,1]→power4.out、
// [0.4,0,0.8,0]→power2.inOut

// 0 旋转/坠落
function presetRotateFall(inner) {
  const angle = gsap.utils.random(-20, -55, 1)
  const fell = angle < -45
  const tl = gsap.timeline()
  tl.set(inner, { transformOrigin: '0% 100%' })
  tl.to(inner, { rotation: angle, duration: 1, ease: 'power4.out' })
  if (fell) {
    tl.to(inner, { rotation: -90, duration: 1, ease: 'power2.inOut' })
    tl.to(inner, { rotation: 0, duration: 0.6, delay: 1, ease: 'power2.out' })
  } else {
    tl.to(inner, { rotation: 0, duration: 0.6, ease: 'power2.out' })
  }
  return tl
}

// 1 拉伸弹跳
function presetStretchPop(inner) {
  const tl = gsap.timeline()
  tl.set(inner, { transformOrigin: '50% 100%' })
  tl.fromTo(
    inner,
    { scaleY: 0.3, scaleX: 2, y: 0 },
    { scaleY: 1, scaleX: 0.6, y: gsap.utils.random(-200, -100), duration: 0.6, ease: 'expo.out' }
  )
  tl.to(inner, { scaleX: 1, y: 0, duration: 1.2, ease: 'power2.in' })
  return tl
}

// 2 弹性翻X
function presetFlipX(inner) {
  const tl = gsap.timeline()
  tl.set(inner, { transformOrigin: '50% 100%', transformPerspective: 1000 })
  tl.fromTo(inner, { rotateX: 0 }, { rotateX: -180, duration: 1.6, ease: 'elastic.out(1, 0.35)' })
  tl.to(inner, { rotateX: -360, duration: 0.4, ease: 'power2.in' })
  return tl
}

// 3 随机原点拉伸
function presetOriginStretch(inner) {
  const origins = ['50% 100%', '50% 0%', '50% 50%']
  const tl = gsap.timeline()
  tl.set(inner, { transformOrigin: origins[gsap.utils.random(0, 2, 1)] })
  tl.fromTo(inner, { scaleY: 6, scaleX: 0.5 }, { scaleY: 1, scaleX: 1, duration: 1.6, ease: 'elastic.out(1, 0.35)' })
  return tl
}

// 4 弹性翻Y
function presetFlipY(inner) {
  const tl = gsap.timeline()
  tl.set(inner, { transformOrigin: '50% 0%', transformPerspective: 1000 })
  inner.style.perspectiveOrigin = '50% -300%' // GSAP 不直接支持 perspectiveOrigin，直接赋值
  tl.fromTo(inner, { rotateY: 0 }, { rotateY: -180, duration: 0.8, ease: 'power3.inOut' })
  tl.to(inner, { rotateY: -360, duration: 1, ease: 'elastic.out(1, 0.6)' })
  return tl
}

// 5 飞向上方（含在副标题行上方，避免被 .portfolio-view 的 overflow:hidden 裁掉）
function presetFlyTop(inner, wordEl) {
  const letterTop = inner.getBoundingClientRect().top
  const rowTop = wordEl.getBoundingClientRect().top
  const tl = gsap.timeline()
  tl.set(inner, { transformOrigin: '50% 0%' })
  tl.to(inner, { y: rowTop - letterTop - 5, scaleX: 0.8, scaleY: 3, duration: 0.7, ease: 'power3.inOut' })
  tl.to(inner, { y: 0, scaleX: 1, scaleY: 1, duration: 0.7, delay: 0.75, ease: 'expo.out' })
  return tl
}

// 6 挤压弹跳
function presetSquash(inner) {
  const tl = gsap.timeline()
  tl.set(inner, { transformOrigin: '50% 100%' })
  tl.fromTo(inner, { scaleY: 0.3, scaleX: 1.5 }, { scaleY: 1, scaleX: 1, duration: 1.6, ease: 'elastic.out(1, 0.35)' })
  return tl
}
</script>

<style scoped>
.letter-play {
  display: inline-flex;
  user-select: none;
  margin-bottom: 20px;
  cursor: none;
}
.letter {
  position: relative;
  display: inline-block;
  padding: 0.1em 0.04em;
  cursor: none;
}
.letter-inner {
  display: inline-block;
  pointer-events: none; /* 悬停命中外层的带 padding span，命中区域更大 */
  font-size: clamp(20px, 3.4vw, 28px);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--letter-color, var(--nyc-black));
}
</style>
