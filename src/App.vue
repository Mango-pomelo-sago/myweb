<template>
  <div id="app-root">
    <LoadingAnimation />
    <router-view />
  </div>
</template>

<script setup>
import LoadingAnimation from './components/LoadingAnimation.vue'
</script>

<style>
/* 全局样式已在 main.css 中定义 */
</style>
