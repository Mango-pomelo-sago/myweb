<template>
  <div class="not-found-view">
    <h1 class="error-code">404</h1>
    <div class="divider"></div>
    <p class="error-msg">页面未找到</p>
    
    <router-link to="/" class="back-btn">
      返回首页
    </router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--nyc-white);
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--nyc-black);
  line-height: 1;
  margin-bottom: 20px;
}

.divider {
  width: 100px;
  height: 6px;
  background-color: var(--nyc-yellow);
  margin-bottom: 30px;
}

.error-msg {
  font-size: 24px;
  font-weight: 700;
  color: var(--nyc-black);
  margin-bottom: 40px;
}

.back-btn {
  padding: 14px 36px;
  font-size: 16px;
  font-weight: 700;
  background-color: var(--nyc-green);
  color: var(--nyc-white);
  border: 3px solid var(--nyc-black);
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: var(--nyc-white);
  color: var(--nyc-black);
  box-shadow: 5px 5px 0px var(--nyc-yellow);
}
</style>
