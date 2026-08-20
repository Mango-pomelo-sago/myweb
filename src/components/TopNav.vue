<template>
  <nav class="top-nav menu menu--dustu">
    <div class="nav-header">
      <img class="mushroom-icon" :src="mushroomImg" alt="蘑菇" />
    </div>

    <div class="nav-menu">
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
    </div>

    <span class="copyright">© 2026</span>

    <!-- 汉堡按钮 -->
    <button class="hamburger" @click="toggleMenu" aria-label="导航菜单">
      <span class="hamburger-line" :class="{ open: mobileMenuOpen }"></span>
    </button>

    <!-- 移动端下拉菜单 -->
    <transition name="fade">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="mobile-menu__item"
          :class="{ active: route.path === item.path }"
          @click="closeMenu"
        >
          <span class="mobile-menu__name">{{ item.name }}</span>
          <span class="mobile-menu__label">{{ item.label }}</span>
        </router-link>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import mushroomImg from '@/assets/images/11.png'

const route = useRoute()

const navItems = ref([
  { path: '/', name: '首页', label: 'Home' },
  // { path: '/about', name: '关于我', label: 'About' }, // 暂隐藏
  { path: '/portfolio', name: '作品集', label: 'Portfolio' },
  { path: '/contact', name: '联系我', label: 'Contact' }
])

// 移动端汉堡菜单
const mobileMenuOpen = ref(false)
const toggleMenu = () => { mobileMenuOpen.value = !mobileMenuOpen.value }
const closeMenu = () => { mobileMenuOpen.value = false }
// 路由变化时自动收起
watch(() => route.path, closeMenu)
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
.nav-menu {
  display: flex;
  flex-direction: row;
  align-items: center;
}

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

/* =========================================
   汉堡按钮（≤480px 显示）
   ========================================= */
.hamburger {
  display: none;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  pointer-events: auto;
  align-items: center;
  justify-content: center;
  z-index: 110;
}

.hamburger-line {
  position: relative;
  display: block;
  width: 24px;
  height: 2px;
  background: var(--nyc-black);
  transition: background 0.3s ease;
}
.hamburger-line::before,
.hamburger-line::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--nyc-black);
  transition: transform 0.3s ease;
}
.hamburger-line::before {
  top: -7px;
}
.hamburger-line::after {
  bottom: -7px;
}
.hamburger-line.open {
  background: transparent;
}
.hamburger-line.open::before {
  transform: translateY(7px) rotate(45deg);
}
.hamburger-line.open::after {
  transform: translateY(-7px) rotate(-45deg);
}

/* =========================================
   移动端下拉菜单（≤480px 显示，固定于导航栏下方）
   ========================================= */
.mobile-menu {
  display: none;
  position: fixed;
  top: 88px;
  left: 0;
  right: 0;
  z-index: 105;
  background: var(--nyc-white);
  border-bottom: 1px solid var(--nyc-line);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 8px 20px 20px;
}

.mobile-menu__item {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 16px 4px;
  border-bottom: 1px solid var(--nyc-line);
  text-decoration: none;
  color: var(--nyc-black);
}

.mobile-menu__item:last-child {
  border-bottom: none;
}

.mobile-menu__item.active .mobile-menu__name,
.mobile-menu__item:active .mobile-menu__name {
  color: var(--nyc-green);
}

.mobile-menu__name {
  font-size: 20px;
  font-weight: 700;
}

.mobile-menu__label {
  font-size: 13px;
  letter-spacing: 0.04em;
  color: #888;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* =========================================
   响应式断点
   ========================================= */
@media (max-width: 768px) {
  .top-nav {
    padding: 0 20px;
  }
  .nav-header {
    margin-right: 20px;
  }
  .menu__item {
    margin: 0 0.9em;
  }
  .copyright {
    right: 20px;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    display: none;
  }
  .copyright {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .mobile-menu {
    display: block;
  }
}
</style>