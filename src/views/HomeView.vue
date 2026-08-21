<template>
  <div class="home-view">
    <!-- 固定标题 -->
    <div class="fixed-title">
      <h1>{{ profileName }}</h1>
    </div>

    <!-- 主要内容 -->
    <main id="smooth-content" class="scroll-text-content">
      <div class="content">
        <div class="group" v-for="(group, gi) in home" :key="gi">
          <div
            v-for="(el, ei) in group.elements"
            :key="ei"
            class="el"
            :class="[el.class, { 'el--xl': el.xl, 'typing-indicator': el.typingIndicator }]"
            :data-alt-pos="el.altPos"
            :data-scramble-duration="el.scrambleDuration != null ? el.scrambleDuration : undefined"
            :data-flip-ease="el.flipEase || undefined"
          >{{ el.text }}</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick, computed } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { siteData, loadSiteData } from '../utils/dataLoader'

// 从 data.json 读取首页诗歌文字和标题
const home = computed(() => (siteData.value && siteData.value.home) ? siteData.value.home : [])
const profileName = computed(() => (siteData.value && siteData.value.profile && siteData.value.profile.name) ? siteData.value.profile.name : '杨枝甘鹿')

// GSAP 注册插件
gsap.registerPlugin(ScrollTrigger, Flip, ScrambleTextPlugin)

// DOM 引用
let textElements = []
let scrambleTriggers = []

// ------------------------------------------------------------
// RESET ELEMENT STYLES (USED BEFORE FLIP SETUP)
// ------------------------------------------------------------
function resetTextElements() {
  textElements.forEach((el) => {
    gsap.set(el, {
      clearProps: 'transform,opacity,filter',
    })
  })
}

// ------------------------------------------------------------
// FLIP ANIMATION SETUP
// ------------------------------------------------------------
function initFlips() {
  resetTextElements()

  textElements.forEach((el) => {
    // Find the current positional class (e.g. "pos-1")
    const originalClass = [...el.classList].find((c) => c.startsWith('pos-'))

    // Target class stored in data-alt-pos
    const targetClass = el.dataset.altPos

    const flipEase = el.dataset.flipEase || 'expo.inOut'

    // Temporarily switch to target class to capture end state
    el.classList.add(targetClass)
    el.classList.remove(originalClass)

    // Capture FLIP state (position + selected visual props)
    const flipState = Flip.getState(el, {
      props: 'opacity, filter, width',
    })

    // Restore original class immediately
    el.classList.add(originalClass)
    el.classList.remove(targetClass)

    Flip.to(flipState, {
      ease: flipEase,
      scrollTrigger: {
        trigger: el,
        start: 'clamp(bottom bottom-=10%)',
        end: 'clamp(center center)',
        scrub: true,
      },
    })
    Flip.from(flipState, {
      ease: flipEase,
      scrollTrigger: {
        trigger: el,
        start: 'clamp(center center)',
        end: 'clamp(top top)',
        scrub: true,
      },
    })
  })
}

// ------------------------------------------------------------
// SCRAMBLE TEXT CONFIG
// ------------------------------------------------------------
const scrambleChars = 'upperAndLowerCase'

// ------------------------------------------------------------
// SCRAMBLE FUNCTION
// ------------------------------------------------------------
function scramble(el, { duration, revealDelay = 0 } = {}) {
  const text = el.dataset.text ?? el.textContent

  const finalDuration =
    duration ??
    (el.dataset.scrambleDuration ? parseFloat(el.dataset.scrambleDuration) : 1)

  gsap.killTweensOf(el)

  gsap.fromTo(
    el,
    { scrambleText: { text: '', chars: '' } },
    {
      scrambleText: {
        text,
        chars: scrambleChars,
        revealDelay,
      },
      duration: finalDuration,
    }
  )
}

// ------------------------------------------------------------
// SCRAMBLE SCROLLTRIGGERS SETUP
// ------------------------------------------------------------
function initScramble() {
  // Remove previously created scramble triggers
  killScrambleTriggers()

  // Create a ScrollTrigger per element
  textElements.forEach((el) => {
    const trigger = ScrollTrigger.create({
      id: 'scramble', // used for targeted cleanup
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => scramble(el),
      onEnterBack: () => scramble(el),
    })
    scrambleTriggers.push(trigger)
  })
}

// ------------------------------------------------------------
// SCRAMBLE TRIGGER CLEANUP
// ------------------------------------------------------------
function killScrambleTriggers() {
  scrambleTriggers.forEach((st) => {
    st.kill()
  })
  scrambleTriggers = []
}

// 初始化滚动文字动画
const initScrollTextAnimation = () => {
  // 获取所有文本元素
  textElements = Array.from(document.querySelectorAll('.el'))

  // 存储原始文本内容
  textElements.forEach((el) => {
    el.dataset.text = el.textContent
  })

  // 初始化 Flip 动画
  initFlips()

  // 初始化 Scramble 动画
  initScramble()

  // 监听窗口大小变化
  window.addEventListener('resize', handleGsapResize)
}

// 处理 GSAP 窗口大小变化（节流 150ms，避免手机滚动条/旋转时反复重算卡顿）
let resizeTimer = null
const handleGsapResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh(true)
    initFlips()
    initScramble()
  }, 150)
}

onMounted(async () => {
  // 加载站点数据（GitHub 优先，失败用本地）
  await loadSiteData()

  // 等 DOM 渲染完成后再初始化动画
  await nextTick()

  // 初始化滚动文字动画
  initScrollTextAnimation()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleGsapResize)

  // 清理 GSAP ScrollTrigger
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})
</script>

<style scoped>
.home-view {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: transparent; /* 透出全局等高线背景 */
}

/* ============================================================
   Scroll Text Motion Styles (from Codrops)
   ============================================================ */

.scroll-text-content {
  position: relative;
  z-index: 10;
  background-color: transparent; /* 透出全局等高线背景 */
  color: #10b981;
  font-family: 'forma-djr-mono', monospace;
  text-transform: uppercase;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.scroll-text-content .content {
  padding: 50vh 1.5rem 15vh;
}

.scroll-text-content .group {
  display: flex;
  flex-direction: column;
  flex: 1 1 100px;
  margin-bottom: 5vh;
}

.scroll-text-content .el {
  white-space: nowrap;
  filter: blur(0px);
  text-transform: uppercase;
  opacity: 0.8;
  font-size: clamp(0.8rem, 2vw, 1.5rem);
  line-height: 1.4;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.scroll-text-content .el--xl {
  font-size: clamp(3rem, 12vw, 8rem);
  opacity: 1;
  font-family: 'lores-12', sans-serif;
  font-weight: 400;
  line-height: 1;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.scroll-text-content .pos-2 {
  margin-left: 15vw;
}

.scroll-text-content .pos-3 {
  margin-left: 40vw;
}

.scroll-text-content .pos-4 {
  margin-left: auto;
}

.scroll-text-content .pos-5 {
  margin-top: 100px;
  opacity: 1;
}

.scroll-text-content .pos-6 {
  margin-left: auto;
  margin-top: 100px;
  opacity: 1;
}

.scroll-text-content .pos-7 {
  margin-top: 100px;
  opacity: 1;
  filter: blur(1.2px);
}

.scroll-text-content .pos-8 {
  margin-left: 15vw;
  margin-top: 30px;
  opacity: 1;
  filter: blur(2px);
}

.scroll-text-content .pos-9 {
  margin-left: 15vw;
  margin-top: 150px;
}

.scroll-text-content .pos-10 {
  margin-left: 40vw;
  margin-top: 25vh;
}

@keyframes blink-cursor {
  from,
  to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.scroll-text-content .typing-indicator {
  display: inline-block;
  animation: blink-cursor 0.7s linear infinite;
}

/* 固定标题样式
   让"杨枝甘鹿"标题居中显示在页面中央 */
.fixed-title {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 200;
  pointer-events: none;
}

.fixed-title h1 {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  color: #000000;
  font-family: '思源黑体', 'Microsoft YaHei', 'SimHei', sans-serif;
  letter-spacing: 0.3em;
  line-height: 1.2;
  margin: 0;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .scroll-text-content .el {
    white-space: normal;
  }
  .scroll-text-content .pos-2 {
    margin-left: 8vw;
  }
  .scroll-text-content .pos-3 {
    margin-left: 18vw;
  }
  .scroll-text-content .pos-4 {
    margin-left: auto;
  }
  .scroll-text-content .pos-9 {
    margin-left: 8vw;
    margin-top: 80px;
  }
  .scroll-text-content .pos-10 {
    margin-left: 18vw;
    margin-top: 12vh;
  }
  .scroll-text-content .pos-5,
  .scroll-text-content .pos-6,
  .scroll-text-content .pos-7 {
    margin-top: 60px;
  }
}
</style>
