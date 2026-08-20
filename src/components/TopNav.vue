<template>
  <nav class="top-nav menu menu--dustu">
    <div class="nav-header">
      <img class="mushroom-icon" :src="mushroomImg" alt="蘑菇" />
    </div>

    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="menu__item"
      :class="{ active: route.path === item.path }"
    >
      <span class="menu__item-name">{{ item.name }}</span>
      <span class="menu__item-label">{{ item.label }}</span>
    </router-link>

    <span class="copyright">© 2026</span>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import mushroomImg from '@/assets/images/11.png'

const route = useRoute()

const navItems = ref([
  { path: '/', name: '首页', label: 'Home' },
  // { path: '/about', name: '关于我', label: 'About' }, // 暂隐藏
  { path: '/portfolio', name: '作品集', label: 'Portfolio' },
  { path: '/contact', name: '联系我', label: 'Contact' }
])
</script>

<style scoped>
/* =========================================
   顶部通栏导航 — 固定在顶部
   ========================================= */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88px;
  width: 100%;
  z-index: 100;
  background: var(--nyc-white);
  border-bottom: 1px solid var(--nyc-line);
  display: flex;
  align-items: center;
  padding: 0 48px;
  pointer-events: none;       /* 容器不拦点击，子项单独开启 */
}

/* =========================================
   Logo 头部
   ========================================= */
.nav-header {
  display: flex;
  align-items: center;
  margin-right: 48px;
  pointer-events: auto;
}

.mushroom-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  animation: floaty 6s ease-in-out infinite;
}

/* =========================================
   菜单项 — Dustu #6 风格
   上面中文（粗体），下面英文（小字）
   ========================================= */
.menu__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 1.5em;
  pointer-events: auto;
  cursor: pointer;
  text-decoration: none;
  line-height: 1;
  outline: none;
}

/* ---- 中文名 ---- */
.menu__item-name {
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
  padding: 0 0.25em;
  color: var(--nyc-black);
  position: relative;
  display: inline-block;
  transition: color 0.7s cubic-bezier(0.7, 0, 0.3, 1);
  z-index: 0;
}

/* 绿色衬底滑块 — 从左侧滑入文本后方 */
.menu__item-name::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--nyc-green);
  transform: translate3d(-100%, 0, 0) translate3d(-1px, 0, 0);
  transition: transform 0.7s cubic-bezier(0.7, 0, 0.3, 1);
  z-index: -1;
}

/* 黄色横线 — 停在文本中间 */
.menu__item-name::after {
  content: '';
  position: absolute;
  top: calc(50% - 2px);
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--nyc-yellow);
  transform: translate3d(-100%, 0, 0) translate3d(-1px, 0, 0);
  transition: transform 0.7s cubic-bezier(0.7, 0, 0.3, 1);
  z-index: 1;
}

/* hover / active 状态 */
.menu__item:hover .menu__item-name,
.menu__item.active .menu__item-name {
  color: var(--nyc-white);
}

.menu__item:hover .menu__item-name::before,
.menu__item.active .menu__item-name::before {
  transform: translate3d(100%, 0, 0) translate3d(1px, 0, 0);
}

.menu__item:hover .menu__item-name::after,
.menu__item.active .menu__item-name::after {
  transform: translate3d(0, 0, 0);
}

/* ---- 英文小字 ---- */
.menu__item-label {
  position: absolute;
  top: calc(100% + 4px);   /* 挂在中文名下方 */
  left: 0.5em;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: #888;
  white-space: nowrap;
  transition: color 0.7s cubic-bezier(0.7, 0, 0.3, 1);
}

.menu__item:hover .menu__item-label,
.menu__item.active .menu__item-label {
  color: var(--nyc-green);
}

/* =========================================
   版权
   ========================================= */
.copyright {
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

/* =========================================
   动效
   ========================================= */
@keyframes floaty {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@media (prefers-reduced-motion: reduce) {
  .mushroom-icon {
    animation: none;
  }
  .menu__item-name::before,
  .menu__item-name::after {
    transition: none;
  }
  .menu__item-name,
  .menu__item-label {
    transition: none;
  }
}
</style>