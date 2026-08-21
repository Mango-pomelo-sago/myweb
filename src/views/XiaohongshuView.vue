<template>
  <div class="xhs-view">
    <div class="page-header">
      <h1 class="page-title">新媒体运营</h1>
      <p class="page-sub">社交媒体内容策划与运营案例</p>
      <div class="divider"></div>
    </div>

    <!-- 左侧本页导航 + 右侧分区内容 -->
    <div class="content-layout">
      <!-- 左侧本页导航栏 -->
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

      <!-- 各分区内容 -->
      <div class="sections">
        <!-- 复旦大学小红书 -->
        <section id="sec-fudan" class="section">
          <h2 class="section-title">复旦大学小红书</h2>
          <p class="section-sub">复旦大学官方小红书账号运营作品</p>
          <div class="section-divider"></div>

          <div class="card-grid">
            <a
              v-for="post in posts"
              :key="post.id"
              class="xhs-card"
              :href="post.link"
              target="_blank"
              rel="noopener"
            >
              <!-- 圆角图片 -->
              <div class="card-img-wrap">
                <img
                  v-if="post.image"
                  class="card-img"
                  :src="post.image"
                  :alt="post.title"
                  loading="lazy"
                />
                <div v-else class="card-img img-placeholder">
                  <span>图片待补充</span>
                </div>
              </div>

              <div class="card-body">
                <!-- 标题（单行省略） -->
                <p class="card-title">{{ post.title }}</p>

                <!-- 圆形头像框 + 复旦大学 + 空心爱心点赞数 -->
                <div class="card-meta">
                  <div class="author">
                    <img class="avatar" :src="authorLogo" :alt="author" />
                    <span class="author-name">{{ author }}</span>
                  </div>
                  <span class="likes">
                    <svg
                      class="heart"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    >
                      <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.4 12 21 12 21z"/>
                    </svg>
                    {{ post.likes }}
                  </span>
                </div>
              </div>
            </a>
          </div>
        </section>

        <!-- 公众号 -->
        <section id="sec-gongzhonghao" class="section">
          <h2 class="section-title">公众号</h2>
          <p class="section-sub">{{ gongzhonghaoSub }}</p>
          <div class="section-divider"></div>

          <ul class="article-list">
            <li
              v-for="article in articles"
              :key="article.url"
              class="article-item"
            >
              <a
                :href="article.url"
                target="_blank"
                rel="noopener"
                class="article-link"
              >
                <span class="article-title">{{ article.title }}</span>
                <svg
                  class="article-arrow"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M7 17L17 7"/>
                  <path d="M9 7h8v8"/>
                </svg>
              </a>
            </li>
          </ul>
        </section>

        <!-- 个人小红书 -->
        <section id="sec-personal" class="section">
          <h2 class="section-title">个人小红书</h2>
          <p class="section-sub">{{ personalXiaohongshu.subtitle || ('个人账号 · ' + personalXiaohongshu.author) }}</p>
          <div class="section-divider"></div>
          <a
            class="personal-link"
            :href="personalXiaohongshu.link || profile.contact.xiaohongshu"
            target="_blank"
            rel="noopener"
          >
            <img
              class="personal-img"
              :src="personalXhsImg"
              :alt="personalXiaohongshu.author || profile.contact.xiaohongshuName"
              loading="lazy"
            />
          </a>
        </section>

        <!-- 悠星网络 -->
        <section id="sec-yostar" class="section">
          <h2 class="section-title">悠星网络</h2>
          <p class="section-sub">悠星网络 · 新媒体运营</p>
          <div class="section-divider"></div>
          <div class="placeholder-box">内容整理中，敬请期待</div>
        </section>

        <!-- 个人抖音 -->
        <section id="sec-douyin" class="section">
          <h2 class="section-title">个人抖音</h2>
          <p class="section-sub">{{ personalDouyin.subtitle || ('个人账号 · ' + personalDouyin.author) }}</p>
          <div class="section-divider"></div>
          <a
            class="douyin-card"
            :href="personalDouyin.link || profile.contact.douyin"
            target="_blank"
            rel="noopener"
          >
            <img
              class="douyin-img"
              :src="personalDouyinImg"
              :alt="personalDouyin.author || profile.contact.douyinName"
              loading="lazy"
            />
          </a>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { siteData, loadSiteData } from '../utils/dataLoader'

const profile = computed(() => {
  const p = (siteData.value && siteData.value.profile) ? siteData.value.profile : {}
  return { contact: {}, ...p }
})

// 按序号导入对应的图片（本地 fallback，后台可上传图片后用 imageUrl 覆盖）
import img1 from '@/assets/images/xiaohongshu/NǐHǎo ，我是小红书本地人复旦大学_1_复旦大学_来自小红书网页版 (1).jpg'
import img2 from '@/assets/images/xiaohongshu/🙀听说复旦人的期末季将近，怎么办？_1_复旦大学_来自小红书网页版.jpg'
import img3 from '@/assets/images/xiaohongshu/征集｜2025你在复旦收到的好消息！_1_复旦大学_来自小红书网页版.jpg'
import img4 from '@/assets/images/xiaohongshu/4.png'
import img5 from '@/assets/images/xiaohongshu/5.png'
import img6 from '@/assets/images/xiaohongshu/6.png'
import img7 from '@/assets/images/xiaohongshu/17.png'
import img8 from '@/assets/images/xiaohongshu/💌请查收复旦的一千零一个故事_1_复旦大学_来自小红书网页版.jpg'
import img9 from '@/assets/images/xiaohongshu/9.png'
import img10 from '@/assets/images/xiaohongshu/10.png'
import personalImg from '@/assets/images/xiaohongshu/fungi.png'
import authorLogo from '@/assets/images/xiaohongshu/logo.webp'
import douyinImg from '@/assets/images/othermedia/douyin.png'
import img12 from '@/assets/images/xiaohongshu/🍂风起时  整个复旦都在为你写诗✨_1_复旦大学_来自小红书网页版.jpg'
import img13 from '@/assets/images/xiaohongshu/期中加油！把复旦地标的祝福揣进书包💯_1_复旦大学_来自小红书网页版.jpg'
import img14 from '@/assets/images/xiaohongshu/14.png'
import img15 from '@/assets/images/xiaohongshu/人，跟着猫来体验复旦大学的一天吧👉🏻_1_复旦大学_来自小红书网页版.jpg'
import img16 from '@/assets/images/xiaohongshu/16.png'

const images = {
  1: img1,
  2: img2,
  3: img3,
  4: img4,
  5: img5,
  6: img6,
  7: img7,
  8: img8,
  9: img9,
  10: img10,
  12: img12,
  13: img13,
  14: img14,
  15: img15,
  16: img16
}

const author = computed(() => (siteData.value && siteData.value.xiaohongshu && siteData.value.xiaohongshu.author) ? siteData.value.xiaohongshu.author : '复旦大学')

// 将文字数据与图片一一对应（后台上传的 imageUrl 优先，否则用本地导入图）
const posts = computed(() =>
  (siteData.value && siteData.value.xiaohongshu && siteData.value.xiaohongshu.posts ? siteData.value.xiaohongshu.posts : []).map((p) => ({
    ...p,
    image: p.imageUrl || images[p.id] || ''
  }))
)

// 公众号推文
const articles = computed(() => (siteData.value && siteData.value.gongzhonghao && siteData.value.gongzhonghao.articles) ? siteData.value.gongzhonghao.articles : [])
const gongzhonghaoSub = computed(() => (siteData.value && siteData.value.gongzhonghao && siteData.value.gongzhonghao.sub) ? siteData.value.gongzhonghao.sub : '')

// 个人小红书数据（从 data.json 读取）
const personalXiaohongshu = computed(() => (siteData.value && siteData.value.personalXiaohongshu) ? siteData.value.personalXiaohongshu : { author: '', subtitle: '', imageUrl: '', link: '' })
const personalXhsImg = computed(() => personalXiaohongshu.value.imageUrl || personalImg)

// 个人抖音数据（从 data.json 读取）
const personalDouyin = computed(() => (siteData.value && siteData.value.personalDouyin) ? siteData.value.personalDouyin : { author: '', subtitle: '', imageUrl: '', link: '' })
const personalDouyinImg = computed(() => personalDouyin.value.imageUrl || douyinImg)

// 本页左侧导航分区
const sections = [
  { id: 'sec-fudan', label: '复旦大学小红书' },
  { id: 'sec-gongzhonghao', label: '公众号' },
  { id: 'sec-personal', label: '个人小红书' },
  { id: 'sec-yostar', label: '悠星网络' },
  { id: 'sec-douyin', label: '个人抖音' }
]

const activeSection = ref('sec-fudan')

// 点击导航跳转到对应分区（平滑滚动）
const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 滚动时高亮当前所在分区
const onScroll = () => {
  const els = document.querySelectorAll('.section')
  if (!els.length) return
  let current = els[0].id
  const threshold = 140
  els.forEach((s) => {
    if (s.getBoundingClientRect().top <= threshold) current = s.id
  })
  // 滚动到底部时选中最后一个分区
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
.xhs-view {
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

/* 内容区：左侧导航 + 右侧分区 */
.content-layout {
  display: flex;
  align-items: flex-start;
  gap: 48px;
}

/* 左侧本页导航（sticky 跟随滚动） */
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
  font-size: 32px;
  font-weight: 700;
  color: var(--nyc-black);
  margin-bottom: 6px;
}

.section-sub {
  font-size: 14px;
  font-weight: 600;
  color: #999;
  margin-bottom: 18px;
}

.section-divider {
  width: 60px;
  height: 4px;
  background-color: var(--nyc-yellow);
  margin-bottom: 28px;
}

/* 公众号推文列表 */
.article-list {
  list-style: none;
  border-top: 3px solid var(--nyc-black);
}

.article-item {
  border-bottom: 1px solid #eee;
}

.article-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 12px;
  transition: background-color 0.2s ease;
}

.article-link:hover {
  background-color: var(--nyc-yellow);
}

.article-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
}

.article-arrow {
  flex-shrink: 0;
  color: #999;
  transition: transform 0.2s ease, color 0.2s ease;
}

.article-link:hover .article-arrow {
  color: var(--nyc-black);
  transform: translate(2px, -2px);
}

/* 待补充占位 */
.placeholder-box {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 60px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 卡片平铺网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

/* 小红书风格圆角卡片 */
.xhs-card {
  display: block;
  background: var(--nyc-white);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.xhs-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 个人抖音：圆角等比例卡片 + 超链接 */
.douyin-card {
  display: inline-block;
  max-width: 614px;
  width: 100%;
}

.douyin-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.douyin-img:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 个人小红书：仅圆角图片 + 超链接 */
.personal-link {
  display: inline-block;
}

.personal-img {
  display: block;
  width: 480px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.personal-img:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-img-wrap {
  position: relative;
}

.card-img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  display: block;
}

.img-placeholder {
  background-color: #f5f5f5;
  color: #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.card-body {
  padding: 10px 12px 12px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
}

.author-name {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.likes {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

.heart {
  color: #999;
}

/* =========================================
   响应式适配
   ========================================= */
@media (max-width: 768px) {
  /* 双栏改单栏：目录导航上移为吸顶 pill 条 */
  .content-layout {
    flex-direction: column;
    gap: 24px;
  }

  .sub-nav {
    position: sticky;
    top: 96px;                 /* 挂在 88px 固定导航栏下方 */
    width: 100%;
    flex-shrink: 0;
    flex-direction: row;
    gap: 10px;
    padding: 4px 0 10px;
    overflow-x: auto;          /* 5 项在窄屏下可横滑 */
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    background: var(--nyc-white);
    z-index: 5;
  }

  .sub-nav-title {
    display: none;             /* 目录标题移动端隐藏 */
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
    scroll-margin-top: 150px;  /* 给吸顶 pill 条留位 */
  }

  /* 固定宽度图片改为自适应 */
  .personal-img {
    width: 100%;
    max-width: 480px;
    height: auto;
  }

  /* 卡片网格收紧为小尺寸自适应 */
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 32px;
  }

  /* 手机上固定 2 列 */
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
