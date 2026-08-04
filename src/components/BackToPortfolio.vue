<template>
  <router-link to="/portfolio" class="back-to-portfolio" aria-label="返回作品集">
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  </router-link>
</template>

<style scoped>
.back-to-portfolio {
  position: fixed;
  top: 24px;
  left: 216px;
  z-index: 300;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--nyc-green);
  color: var(--nyc-white);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease, background-color 0.25s ease;
}

.back-to-portfolio:hover {
  transform: scale(1.08) translateX(-2px);
  background-color: #007a4c;
}

.back-to-portfolio svg {
  display: block;
}
</style>
