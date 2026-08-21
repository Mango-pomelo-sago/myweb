<template>
  <div class="work-view">
    <div class="page-header">
      <h1 class="page-title">我的工作</h1>
      <p class="page-sub">实习经历 · 项目经历 · 校园经历</p>
      <div class="divider"></div>
    </div>

    <!-- 左侧本页导航 + 右侧分区内容 -->
    <div class="content-layout">
      <!-- 左侧竖排目录 -->
      <nav class="sub-nav">
        <span class="sub-nav-title">目录</span>
        <a
          v-for="item in sections"
          :key="item.id"
          :href="'#' + item.id"
          class="sub-nav-item"
          :class="{ active: activeSection === item.id }"
          @click.prevent="scrollToSection(item.id)"
        >
          {{ item.label }}
        </a>
      </nav>

      <!-- 右侧各分区 -->
      <div class="sections">
        <section
          v-for="(section, si) in workSections"
          :key="section.id"
          :id="section.id"
          class="section"
        >
          <h2 class="section-title">{{ sectionLabel(si) }}</h2>
          <div class="section-divider"></div>

          <div class="exp-card" v-for="card in section.cards" :key="card.company + card.time">
            <div class="exp-header">
              <span class="exp-time">{{ card.time }}</span>
              <div class="exp-company">
                <span class="exp-name">{{ card.company }}</span>
                <span class="exp-role">{{ card.role }}</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail" v-for="detail in card.details" :key="detail.label">
                <span class="exp-detail-label">{{ detail.label }}</span>
                <p class="exp-detail-text">{{ detail.text }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { siteData, loadSiteData } from '../utils/dataLoader'

// 工作经历分区从 data.json 的 work.sections 读取
const workSections = computed(() =>
  (siteData.value && siteData.value.work && siteData.value.work.sections) ? siteData.value.work.sections : []
)

// 左侧目录
const sections = computed(() => workSections.value.map((s, i) => ({ id: s.id, label: s.label })))

// 中文序号前缀（一、二、三…）
const CN_NUMS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const sectionLabel = (i) => `${CN_NUMS[i] || i + 1}、${workSections.value[i].label}`

const activeSection = ref('')

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const onScroll = () => {
  const els = document.querySelectorAll('.section')
  if (!els.length) return
  let current = els[0].id
  const threshold = 140
  els.forEach((s) => {
    if (s.getBoundingClientRect().top <= threshold) current = s.id
  })
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    current = els[els.length - 1].id
  }
  activeSection.value = current
}

onMounted(() => {
  loadSiteData()
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.work-view {
  max-width: 1280px;
}

.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--nyc-black);
  margin: 10px 0 4px;
}

.page-sub {
  font-size: 14px;
  font-weight: 600;
  color: #999;
  margin-bottom: 20px;
}

.divider {
  width: 80px;
  height: 5px;
  background-color: var(--nyc-yellow);
}

/* =========================================
   内容区：左侧导航 + 右侧分区
   ========================================= */
.content-layout {
  display: flex;
  align-items: flex-start;
  gap: 48px;
}

/* 左侧竖排目录（sticky 跟随滚动） */
.sub-nav {
  position: sticky;
  top: 60px;
  width: 150px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
}

.sub-nav-title {
  font-size: 12px;
  font-weight: 700;
  color: #999;
  letter-spacing: 2px;
  margin-bottom: 8px;
  padding-left: 14px;
}

.sub-nav-item {
  display: block;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--nyc-black);
  border-left: 4px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.sub-nav-item:hover {
  background-color: var(--nyc-yellow);
  border-left-color: var(--nyc-black);
}

.sub-nav-item.active {
  background-color: var(--nyc-green);
  color: var(--nyc-white);
  border-left-color: var(--nyc-black);
}

/* 右侧分区 */
.sections {
  flex: 1;
  min-width: 0;
}

.section {
  scroll-margin-top: 60px;
  margin-bottom: 80px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--nyc-black);
  margin-bottom: 6px;
}

.section-divider {
  width: 60px;
  height: 4px;
  background-color: var(--nyc-yellow);
  margin-bottom: 32px;
}

/* =========================================
   经历卡片
   ========================================= */
.exp-card {
  margin-bottom: 28px;
  padding: 24px 28px;
  border: 1px solid var(--nyc-line);
  border-radius: 8px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.exp-card:hover {
  border-color: var(--nyc-green);
  box-shadow: 0 4px 16px rgba(0, 147, 95, 0.08);
}

.exp-card:last-child {
  margin-bottom: 0;
}

/* 表头行：时间 + 单位/项目 */
.exp-header {
  display: flex;
  align-items: baseline;
  gap: 20px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--nyc-black);
}

.exp-time {
  font-size: 13px;
  font-weight: 700;
  color: var(--nyc-green);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 130px;
}

.exp-company {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.exp-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--nyc-black);
}

.exp-role {
  font-size: 13px;
  font-weight: 600;
  color: #888;
  white-space: nowrap;
}

/* 详情条目 */
.exp-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exp-detail {
  display: flex;
  gap: 8px;
}

.exp-detail-label {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--nyc-green);
  min-width: 90px;
  padding-top: 1px;
}

.exp-detail-text {
  font-size: 14px;
  line-height: 1.7;
  color: #333;
}

/* =========================================
   响应式适配
   ========================================= */
@media (max-width: 768px) {
  .content-layout {
    flex-direction: column;
    gap: 24px;
  }

  .sub-nav {
    position: sticky;
    top: 96px;
    width: 100%;
    flex-shrink: 0;
    flex-direction: row;
    gap: 10px;
    padding: 4px 0 10px;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    background: var(--nyc-white);
    z-index: 5;
  }

  .sub-nav-title {
    display: none;
  }

  .sub-nav-item {
    flex-shrink: 0;
    padding: 8px 14px;
    border: 1px solid var(--nyc-line);
    border-radius: 999px;
  }

  .sub-nav-item:hover {
    background-color: transparent;
    border-left-color: var(--nyc-line);
  }

  .sub-nav-item.active {
    border-color: var(--nyc-green);
  }

  .section {
    scroll-margin-top: 150px;
  }

  .exp-header {
    flex-direction: column;
    gap: 6px;
  }

  .exp-time {
    min-width: auto;
  }

  .exp-detail {
    flex-direction: column;
    gap: 2px;
  }

  .exp-detail-label {
    min-width: auto;
  }

  .exp-card {
    padding: 18px 16px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 32px;
  }

  .exp-name {
    font-size: 15px;
  }
}
</style>