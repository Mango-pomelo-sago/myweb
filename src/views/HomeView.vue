<template>
  <div class="home-view">
    <!-- 固定标题 -->
    <div class="fixed-title">
      <h1>杨枝甘鹿</h1>
    </div>

    <!-- 主要内容 -->
    <main id="smooth-content" class="scroll-text-content">
      <div class="content">
        <div class="group">
          <div class="el pos-4" data-alt-pos="pos-2">Shall I compare thee to a summer's day?</div>
        </div>

        <div class="group">
          <div class="el pos-1" data-alt-pos="pos-3">Thou art more lovely and more temperate:</div>
        </div>

        <div class="group">
          <div class="el el--xl pos-1" data-alt-pos="pos-2" data-scramble-duration="2.5">Y</div>
        </div>

        <div class="group">
          <div class="el pos-1" data-alt-pos="pos-3" data-scramble-duration="0">鏡越し貴方と 瞳の奥の私と</div>
          <div class="el pos-1 typing-indicator" data-alt-pos="pos-3" data-scramble-duration="0">█</div>
        </div>

        <div class="group">
          <div class="el pos-2" data-alt-pos="pos-5">Rough winds do shake the darling buds of May,</div>
        </div>

        <div class="group">
          <div class="el el--xl pos-3" data-alt-pos="pos-9" data-scramble-duration="2.5">Z</div>
        </div>

        <div class="group">
          <div class="el pos-3" data-alt-pos="pos-2">And summer's lease hath all too short a date;</div>
        </div>

        <div class="group">
          <div class="el pos-1" data-alt-pos="pos-3" data-scramble-duration="0">灰に潜り 秒針を噛み</div>
          <div class="el pos-1 typing-indicator" data-alt-pos="pos-3" data-scramble-duration="0">█</div>
        </div>

        <div class="group">
          <div class="el pos-2" data-alt-pos="pos-4">Sometime too hot the eye of heaven shines,</div>
        </div>

        <div class="group">
          <div class="el el--xl pos-1" data-alt-pos="pos-3" data-scramble-duration="2.5">G</div>
        </div>

        <div class="group">
          <div class="el pos-2" data-alt-pos="pos-9">And often is his gold complexion dimm'd;</div>
        </div>

        <div class="group">
          <div class="el el--xl pos-3" data-alt-pos="pos-10" data-scramble-duration="2.5" data-flip-ease="expo.in">L</div>
        </div>

        <div class="group">
          <div class="el pos-4" data-alt-pos="pos-3">And every fair from fair sometime declines,</div>
        </div>

        <div class="group">
          <div class="el pos-1" data-alt-pos="pos-3" data-scramble-duration="0">ゴミ箱に捨てた 転生林檎</div>
          <div class="el pos-1 typing-indicator" data-alt-pos="pos-3" data-scramble-duration="0">█</div>
        </div>

        <div class="group">
          <div class="el pos-3" data-alt-pos="pos-5">By chance or nature's changing course untrimm'd:</div>
        </div>

        <div class="group">
          <div class="el el--xl pos-2" data-alt-pos="pos-3" data-scramble-duration="2.5">I</div>
        </div>

        <div class="group">
          <div class="el pos-3" data-alt-pos="pos-6">But thy eternal summer shall not fade</div>
        </div>

        <div class="group">
          <div class="el pos-2" data-alt-pos="pos-7">Nor lose possession of that fair thou owest;</div>
        </div>

        <div class="group">
          <div class="el pos-3" data-alt-pos="pos-8">Nor shall Death brag thou wand'rest in his shade,</div>
          <div class="el pos-3" data-alt-pos="pos-8">When in eternal lines to time thou growest</div>
        </div>

        <div class="group">
          <div class="el pos-1" data-alt-pos="pos-1">So long as men can breathe or eyes can see,</div>
          <div class="el pos-1" data-alt-pos="pos-2">So long lives this, and this gives life to thee.</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

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

// 处理 GSAP 窗口大小变化
const handleGsapResize = () => {
  ScrollTrigger.refresh(true)
  initFlips()
  initScramble()
}

onMounted(() => {
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
</style>
