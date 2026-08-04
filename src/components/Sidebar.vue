<template>
  <aside class="sidebar">
    <!-- 顶部蘑菇图标 -->
    <div class="logo-area">
      <img class="mushroom-icon" :src="mushroomImg" alt="蘑菇" />
    </div>

    <!-- 导航菜单 -->
    <nav class="nav-menu">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="active"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <!-- 底部留白区域 -->
    <div class="footer-area">
      <span class="copyright">© 2026</span>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import mushroomImg from '@/assets/images/11.png'

const navItems = ref([
  { path: '/', label: '首页' },
  // { path: '/about', label: '关于我' }, // 暂隐藏，不删除
  { path: '/portfolio', label: '作品集' },
  { path: '/contact', label: '联系我' }
])
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  background-color: var(--nyc-white);
  border-right: 3px solid var(--nyc-black);
  display: flex;
  flex-direction: column;
  padding: 40px 20px;
  z-index: 100;
}

.logo-area {
  margin-bottom: 60px;
  text-align: center;
}

.mushroom-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  padding: 12px 16px;
  font-weight: 700;
  font-size: 16px;
  color: var(--nyc-black);
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background-color: var(--nyc-yellow);
  border-left-color: var(--nyc-black);
}

.nav-item.active {
  color: var(--nyc-black);
  border-left-color: transparent;
}

.nav-item.active:hover {
  background-color: var(--nyc-green);
  color: var(--nyc-white);
  border-left-color: var(--nyc-black);
}

.footer-area {
  margin-top: auto;
  text-align: center;
  padding-top: 20px;
}

.copyright {
  font-size: 12px;
  font-weight: 700;
  color: var(--nyc-black);
}
</style>
