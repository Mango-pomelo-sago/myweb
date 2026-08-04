<template>
  <div class="main-layout">
    <ContourBackground />
    <BackToPortfolio v-if="route.meta.showBackToPortfolio" />
    <CustomCursor />
    <Sidebar />
    <main class="content-area">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import CustomCursor from '../components/CustomCursor.vue'
import ContourBackground from '../components/ContourBackground.vue'
import BackToPortfolio from '../components/BackToPortfolio.vue'

const route = useRoute()
</script>

<style scoped>
.main-layout {
  position: relative;
  display: flex;
  min-height: 100vh;
}

.content-area {
  margin-left: 200px;
  flex: 1;
  padding: 60px 80px;
  position: relative;
  z-index: 1;
  background-color: transparent;
}

/* 页面切换动效 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
