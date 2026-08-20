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
        <!-- ========== 一、实习经历 ========== -->
        <section id="sec-intern" class="section">
          <h2 class="section-title">一、实习经历</h2>
          <div class="section-divider"></div>

          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2026.01 – 2026.03</span>
              <div class="exp-company">
                <span class="exp-name">上海悠星网络科技有限公司</span>
                <span class="exp-role">新媒体运营实习生</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">内容运营</span>
                <p class="exp-detail-text">负责"基沃托斯百货"账号内容发布，定期完成流量、互动、转化等数据统计分析，依据数据反馈优化内容方向与发布节奏，提升账号活跃度。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">AI赋能项目支持</span>
                <p class="exp-detail-text">独立使用Cursor进行Vibe Coding赋能工作流，完成素材收集、信息分类；开展二次元游戏竞品营销活动、宣传内容专项调研，梳理竞品优势与运营思路。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">活动策划</span>
                <p class="exp-detail-text">全流程策划线上主题活动，构思活动形式与宣传话术，协助推进活动落地、宣发推广与流程跟进。</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ========== 二、项目经历 ========== -->
        <section id="sec-project" class="section">
          <h2 class="section-title">二、项目经历</h2>
          <div class="section-divider"></div>

          <!-- 原创桌游 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2025.07 – 2025.08</span>
              <div class="exp-company">
                <span class="exp-name">原创桌游项目</span>
                <span class="exp-role">美术、游戏机制设计</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">游戏机制设计</span>
                <p class="exp-detail-text">参与全原创大富翁类桌游经济系统与规则框架搭建，完成核心玩法原型测试与迭代。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">视觉设计</span>
                <p class="exp-detail-text">负责全角色造型、地图及UI视觉设计，形成完整美术风格指南，提升产品辨识度。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">团队协作</span>
                <p class="exp-detail-text">协同推进产品开发，完成demo版本，获校内项目晋级机会。</p>
              </div>
            </div>
          </div>

          <!-- 欧莱雅商赛 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2025.03 – 2025.04</span>
              <div class="exp-company">
                <span class="exp-name">欧莱雅"有意思青年"商赛</span>
                <span class="exp-role">队长</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">全案策划</span>
                <p class="exp-detail-text">主导校园义卖营销方案，完成市场调研、竞品分析、创意策划与落地规划，短时间内完成方案3次迭代。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">团队管理</span>
                <p class="exp-detail-text">统筹8人团队分工，把控项目进度，主导终版PPT设计与现场答辩，获企业评委高度认可。</p>
              </div>
            </div>
          </div>

          <!-- 复旦大学行业分析大赛 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2025.08 – 2025.09</span>
              <div class="exp-company">
                <span class="exp-name">复旦大学行业分析大赛（二等奖）</span>
                <span class="exp-role">核心成员</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">数据分析</span>
                <p class="exp-detail-text">运用Python爬虫采集女性向游戏市场数据，进行清洗、归类与可视化分析。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">报告撰写</span>
                <p class="exp-detail-text">撰写近万字行业研究报告，提出市场趋势判断与运营建议，助力团队获校级二等奖。</p>
              </div>
            </div>
          </div>

          <!-- 毕马威ESG案例分析大赛 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2025.09 – 2025.10</span>
              <div class="exp-company">
                <span class="exp-name">第四届毕马威ESG案例分析大赛</span>
                <span class="exp-role">核心成员</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">调研整理</span>
                <p class="exp-detail-text">负责纺织品产业链ESG相关资料收集、数据整理与案例梳理。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">企业洞察</span>
                <p class="exp-detail-text">参与撰写可持续改进方案，从环保、社会责任与企业治理三方面提出具体建议。</p>
              </div>
            </div>
          </div>

          <!-- 自媒体账号运营 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2024.12 – 至今</span>
              <div class="exp-company">
                <span class="exp-name">自媒体账号运营</span>
                <span class="exp-role">总负责</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">冷启动账号</span>
                <p class="exp-detail-text">独立策划并0基础启动寝室日常类抖音账号，完成账号定位、内容规划与视觉设计。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">全流程运营</span>
                <p class="exp-detail-text">负责选题策划、脚本撰写、拍摄剪辑、发布推广及数据复盘，累计发布视频40+条。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">运营成果</span>
                <p class="exp-detail-text">半年内获赞7k+，积累粉丝500+，单条视频最高播放量10w+、获赞2.2k+，互动率超过行业平均水平。</p>
              </div>
            </div>
          </div>

          <!-- 薯格工作室 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2025.12 – 至今</span>
              <div class="exp-company">
                <span class="exp-name">大学生创业项目"薯格工作室"</span>
                <span class="exp-role">核心成员</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">全栈项目支持</span>
                <p class="exp-detail-text">参与城市实景游戏策划，协作完成小程序UI设计、后端数据库维护、活动流程搭建，触达玩家1.3k+。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">品牌传播策略搭建</span>
                <p class="exp-detail-text">深度参与大型商业合作全链路，统筹策划案撰写与品牌宣传，策划To B团建项目、To G合作等。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">活动落地及复盘</span>
                <p class="exp-detail-text">推动活动落地、人员统筹与流程复盘，优化运营模式，项目获虹口区创业支持。</p>
              </div>
            </div>
          </div>

          <!-- 幻想战闻录 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2020.02 – 至今</span>
              <div class="exp-company">
                <span class="exp-name">东方Project同人文比赛"幻想战闻录"</span>
                <span class="exp-role">独立创作者</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">世界观拓展与融合</span>
                <p class="exp-detail-text">在东方Project原有幻想乡体系基础上创作中长篇同人小说，构建个人风格衍生世界观，深度融入现代哲学与神话元素。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">原创角色全流程塑造</span>
                <p class="exp-detail-text">独立完成主角及配角设定架构，涵盖背景故事、性格动机、能力体系与人物弧光。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">社群反响</span>
                <p class="exp-detail-text">作品获1次冠军、2次第六名，以"薄汐鹿"笔名发表于同人平台"炎上书屋"。</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ========== 三、校园经历 ========== -->
        <section id="sec-campus" class="section">
          <h2 class="section-title">三、校园经历</h2>
          <div class="section-divider"></div>

          <!-- 复旦大学融媒体中心 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2024.09 – 至今</span>
              <div class="exp-company">
                <span class="exp-name">复旦大学融媒体中心</span>
                <span class="exp-role">文字、小红书、美术编辑</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">内容运营</span>
                <p class="exp-detail-text">负责校官方小红书账号体系化运营，通过热点追踪、数据分析及校园话题挖掘精准匹配用户兴趣，单篇笔记互动量最高突破3500+。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">爆款策划</span>
                <p class="exp-detail-text">负责公众号多篇重量级推文（120周年校庆、国庆、高考）的策划、撰稿与设计，打造多篇阅读量10W+爆款。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">项目统筹</span>
                <p class="exp-detail-text">协同美术、视频、文字等多组别资源，完成复杂选题从创意到落地的全流程推进。</p>
              </div>
            </div>
          </div>

          <!-- 军训宣传组 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2024.09 – 至今</span>
              <div class="exp-company">
                <span class="exp-name">复旦大学校军训宣传组（免训，全校仅选拔9人）</span>
                <span class="exp-role">组长</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">统筹管理</span>
                <p class="exp-detail-text">负责宣传组全周期工作规划，制定内容排期、任务分工与质量审核机制。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">跨团队协作</span>
                <p class="exp-detail-text">协调指导老师、各专业学员与宣传组成员多方需求，推送总阅读量突破5w+。</p>
              </div>
            </div>
          </div>

          <!-- 复旦大学城市定向社 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2025.09 – 至今</span>
              <div class="exp-company">
                <span class="exp-name">复旦大学城市定向社</span>
                <span class="exp-role">游戏策划、文创设计组组长</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">大型线下解密冒险活动策划</span>
                <p class="exp-detail-text">策划面向上海高校及市民的"城市定向"活动，设计剧情动线、谜题关卡与现场互动，参与人数1000+，营收2w+。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">社团品牌化运营</span>
                <p class="exp-detail-text">运营社团小红书账号，统筹互动宣发提升曝光，运营期间涨粉200+，笔记平均互动提升30%。</p>
              </div>
            </div>
          </div>

          <!-- 团委学生艺术团 -->
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-time">2025.03 – 2025.12</span>
              <div class="exp-company">
                <span class="exp-name">复旦大学团委学生艺术团</span>
                <span class="exp-role">影音制作中心成员</span>
              </div>
            </div>
            <div class="exp-body">
              <div class="exp-detail">
                <span class="exp-detail-label">创意执行</span>
                <p class="exp-detail-text">参与校庆主题MV制作，负责分镜脚本设计与视觉叙事构建，将音乐情感转化为画面语言。</p>
              </div>
              <div class="exp-detail">
                <span class="exp-detail-label">后期支持</span>
                <p class="exp-detail-text">协助完成视频剪辑与特效处理，助力项目在校园平台发布并获得广泛传播。</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const sections = [
  { id: 'sec-intern', label: '实习经历' },
  { id: 'sec-project', label: '项目经历' },
  { id: 'sec-campus', label: '校园经历' }
]

const activeSection = ref('sec-intern')

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