<template>
  <div class="custom-cursor">
    <!-- 内圈：小圆点 (SVG) -->
    <svg 
      ref="cursorInner"
      class="cursor cursor--1"
      width="12" 
      height="12" 
      viewBox="0 0 12 12"
    >
      <circle class="cursor__inner" cx="6" cy="6" r="3"></circle>
    </svg>
    
    <!-- 外圈：大圆圈 (SVG) -->
    <svg 
      ref="cursorOuter"
      class="cursor cursor--2"
      width="72" 
      height="72" 
      viewBox="0 0 72 72"
      data-scale-enter="2"
      data-opacity-enter="0.5"
    >
      <circle class="cursor__inner" cx="36" cy="36" r="18"></circle>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const cursorInner = ref(null)
const cursorOuter = ref(null)

// 线性插值函数（完全照搬 Codrops）
const lerp = (a, b, n) => (1 - n) * a + n * b

// 追踪鼠标位置
let cursor = { x: 0, y: 0 }
window.addEventListener('mousemove', (ev) => {
  cursor.x = ev.clientX
  cursor.y = ev.clientY
})

// CursorElement 类（完全照搬 Codrops 实现）
class CursorElement {
  constructor(DOM_el, options = {}) {
    this.DOM = {
      el: DOM_el,
      inner: DOM_el.querySelector('.cursor__inner')
    }
    
    // 悬停时的缩放和透明度
    this.scaleOnEnter = options.scaleOnEnter || parseFloat(DOM_el.dataset.scaleEnter) || 1
    this.opacityOnEnter = options.opacityOnEnter || parseFloat(DOM_el.dataset.opacityEnter) || 1
    
    // 渲染样式（包含插值参数）
    this.renderedStyles = {
      tx: { previous: 0, current: 0, amt: 0.2 },
      ty: { previous: 0, current: 0, amt: 0.2 },
      scale: { previous: 1, current: 1, amt: 0.2 },
      opacity: { previous: 1, current: 1, amt: 0.2 }
    }
    
    // 元素尺寸
    this.bounds = this.DOM.el.getBoundingClientRect()
    
    // 初始隐藏
    this.DOM.el.style.opacity = 0
    
    // 首次移动时显示并开始追踪
    const onMouseMoveEv = () => {
      this.renderedStyles.tx.previous = this.renderedStyles.tx.current = cursor.x - this.bounds.width / 2
      this.renderedStyles.ty.previous = this.renderedStyles.ty.current = cursor.y - this.bounds.height / 2
      this.DOM.el.style.opacity = 1
      requestAnimationFrame(() => this.render())
      window.removeEventListener('mousemove', onMouseMoveEv)
    }
    window.addEventListener('mousemove', onMouseMoveEv)
  }
  
  enter() {
    this.renderedStyles.scale.current = this.scaleOnEnter
    this.renderedStyles.opacity.current = this.opacityOnEnter
  }
  
  leave() {
    this.renderedStyles.scale.current = 1
    this.renderedStyles.opacity.current = 1
  }
  
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
    
    this.DOM.el.style.transform = `translateX(${this.renderedStyles.tx.previous}px) translateY(${this.renderedStyles.ty.previous}px) scale(${this.renderedStyles.scale.previous})`
    this.DOM.el.style.opacity = this.renderedStyles.opacity.previous
    
    requestAnimationFrame(() => this.render())
  }
}

onMounted(() => {
  // 初始化两个光标元素
  const innerCursor = new CursorElement(cursorInner.value, { scaleOnEnter: 0, opacityOnEnter: 0 })
  const outerCursor = new CursorElement(cursorOuter.value)
  
  // 为所有可点击元素添加悬停事件
  const addHoverListeners = () => {
    const clickableElements = document.querySelectorAll('a, button, .clickable')
    clickableElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        innerCursor.enter()
        outerCursor.enter()
      })
      el.addEventListener('mouseleave', () => {
        innerCursor.leave()
        outerCursor.leave()
      })
    })
  }
  
  // 初始添加
  addHoverListeners()
  
  // 监听路由变化，重新绑定事件
  const observer = new MutationObserver(() => {
    addHoverListeners()
  })
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

/* 内圈 SVG */
.cursor--1 .cursor__inner {
  fill: var(--nyc-black);
}

/* 外圈 SVG */
.cursor--2 .cursor__inner {
  fill: none;
  stroke: var(--nyc-yellow);
  stroke-width: 2px;
}
</style>
