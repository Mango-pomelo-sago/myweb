<template>
  <div class="custom-cursor">
    <!-- 主圈：带 SVG 滤镜（feTurbulence + feDisplacementMap） -->
    <svg
      ref="cursorMain"
      class="cursor cursor--main"
      data-filter="cursor-filter"
      width="120" height="120" viewBox="0 0 120 120"
    >
      <defs>
        <filter
          id="cursor-filter"
          x="-50%" y="-50%" width="200%" height="200%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0"
            numOctaves="1"
            result="warp"
          />
          <feDisplacementMap
            xChannelSelector="R"
            yChannelSelector="G"
            scale="20"
            in="SourceGraphic"
          />
        </filter>
      </defs>
      <circle class="cursor__inner" cx="60" cy="60" r="20" />
    </svg>

    <!-- 跟随圈：独立滤镜，稍慢跟随 -->
    <svg
      ref="cursorTrail"
      class="cursor cursor--trail"
      data-filter="cursor-filter-2"
      width="120" height="120" viewBox="0 0 120 120"
    >
      <defs>
        <filter
          id="cursor-filter-2"
          x="-50%" y="-50%" width="200%" height="200%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0"
            numOctaves="1"
            result="warp"
          />
          <feDisplacementMap
            xChannelSelector="R"
            yChannelSelector="G"
            scale="20"
            in="SourceGraphic"
          />
        </filter>
      </defs>
      <circle class="cursor__inner" cx="60" cy="60" r="20" />
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const cursorMain = ref(null)
const cursorTrail = ref(null)

// 线性插值
const lerp = (a, b, n) => (1 - n) * a + n * b

// 全局鼠标位置追踪
let cursor = { x: 0, y: 0 }
window.addEventListener('mousemove', (ev) => {
  cursor.x = ev.clientX
  cursor.y = ev.clientY
})

/**
 * 单个光标元素（对应一个 SVG .cursor）
 */
class CursorElement {
  constructor(DOM_el, options = {}) {
    this.DOM = {
      el: DOM_el,
      inner: DOM_el.querySelector('.cursor__inner'),
      feTurbulence: null
    }

    // 悬停时半径 / 透明度
    this.radiusOnEnter = options.radiusOnEnter || 30
    this.opacityOnEnter = options.opacityOnEnter || 1

    // 插值样式
    this.renderedStyles = {
      tx: { previous: 0, current: 0, amt: options.amt || 0.15 },
      ty: { previous: 0, current: 0, amt: options.amt || 0.15 },
      radius: { previous: 20, current: 20, amt: 0.15 },
      opacity: { previous: 1, current: 1, amt: 0.15 }
    }

    this.bounds = this.DOM.el.getBoundingClientRect()
    this.radius = parseFloat(this.DOM.inner.getAttribute('r'))
    this.renderedStyles.radius.previous = this.renderedStyles.radius.current = this.radius

    // 检查此 SVG 是否包含滤镜
    const filterId = DOM_el.dataset.filter
    this.DOM.filterId = filterId
    const feTurbulence = filterId
      ? DOM_el.querySelector(`#${filterId} > feTurbulence`)
      : null
    if (feTurbulence) {
      this.DOM.feTurbulence = feTurbulence
      this.primitiveValues = { turbulence: 0 }
      this.createFilterTimeline()
    }

    // 初始隐藏
    this.DOM.el.style.opacity = 0

    // 首次移动时显示并开始渲染循环
    const onFirstMove = () => {
      this.renderedStyles.tx.previous = this.renderedStyles.tx.current = cursor.x - this.bounds.width / 2
      this.renderedStyles.ty.previous = this.renderedStyles.ty.current = cursor.y - this.bounds.height / 2
      this.DOM.el.style.opacity = 1
      requestAnimationFrame(() => this.render())
      window.removeEventListener('mousemove', onFirstMove)
    }
    window.addEventListener('mousemove', onFirstMove)
  }

  /** 创建滤镜动画时间线 */
  createFilterTimeline() {
    this.filterTimeline = gsap.timeline({
      paused: true,
      onStart: () => {
        this.DOM.inner.style.filter = `url(#${this.DOM.filterId})`
      },
      onUpdate: () => {
        this.DOM.feTurbulence.setAttribute('baseFrequency', this.primitiveValues.turbulence)
      },
      onComplete: () => {
        this.DOM.inner.style.filter = 'none'
      }
    })
    .to(this.primitiveValues, {
      duration: 2,
      ease: 'expo.out',
      startAt: { turbulence: 0.15 },
      turbulence: 0
    })
  }

  /** 鼠标进入可点击元素 */
  enter() {
    this.renderedStyles.radius.current = this.radiusOnEnter
    this.renderedStyles.opacity.current = this.opacityOnEnter
    if (this.filterTimeline) {
      this.filterTimeline.restart()
    }
  }

  /** 鼠标离开可点击元素 */
  leave() {
    this.renderedStyles.radius.current = this.radius
    this.renderedStyles.opacity.current = 1
    if (this.filterTimeline) {
      this.filterTimeline.progress(1).kill()
    }
  }

  /** 渲染循环：平滑跟随鼠标 */
  render() {
    this.renderedStyles.tx.current = cursor.x - this.bounds.width / 2
    this.renderedStyles.ty.current = cursor.y - this.bounds.height / 2

    for (const key in this.renderedStyles) {
      this.renderedStyles[key].previous = lerp(
        this.renderedStyles[key].previous,
        this.renderedStyles[key].current,
        this.renderedStyles[key].amt
      )
    }

    this.DOM.el.style.transform =
      `translateX(${this.renderedStyles.tx.previous}px) translateY(${this.renderedStyles.ty.previous}px)`
    this.DOM.inner.setAttribute('r', this.renderedStyles.radius.previous)
    this.DOM.el.style.opacity = this.renderedStyles.opacity.previous

    requestAnimationFrame(() => this.render())
  }
}

onMounted(() => {
  const mainCursor = new CursorElement(cursorMain.value, { amt: 0.15 })
  const trailCursor = new CursorElement(cursorTrail.value, { amt: 0.1 })

  // 为所有可点击元素绑定悬停事件
  const addHoverListeners = () => {
    document.querySelectorAll('a, button, .clickable').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        mainCursor.enter()
        trailCursor.enter()
      })
      el.addEventListener('mouseleave', () => {
        mainCursor.leave()
        trailCursor.leave()
      })
    })
  }

  addHoverListeners()

  // 路由变化时重新绑定
  const observer = new MutationObserver(() => addHoverListeners())
  observer.observe(document.body, { childList: true, subtree: true })
})
</script>

<style scoped>
.custom-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 9999;
}

.cursor {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
}

@media (any-pointer: fine) {
  .cursor {
    display: block;
  }
}

.cursor--main .cursor__inner,
.cursor--trail .cursor__inner {
  fill: none;
  stroke: var(--nyc-yellow);
  stroke-width: 1px;
}
</style>