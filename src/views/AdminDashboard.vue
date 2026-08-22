<template>
  <div class="admin-dashboard">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <h1 class="admin-title">后台管理面板</h1>
      <div class="header-actions">
        <span v-if="saving" class="saving-indicator">保存中…</span>
        <span v-if="saved" class="saved-indicator">✓ 已保存</span>
        <button class="btn btn-preview" @click="openPreview">预览</button>
        <button class="btn btn-save" @click="handleSave" :disabled="saving">保存到 GitHub</button>
        <button class="btn btn-logout" @click="handleLogout">退出</button>
      </div>
    </header>

    <!-- 设置区：GitHub Token -->
    <section class="section token-section">
      <h2 class="section-title">GitHub 配置</h2>
      <div class="form-row">
        <label>GitHub Token</label>
        <input
          type="password"
          v-model="githubToken"
          placeholder="输入 GitHub Fine-grained Personal Access Token"
          class="input"
        />
        <button class="btn btn-sm" @click="saveToken">保存 Token</button>
      </div>
      <p class="hint">
        请创建<strong>细粒度 Token</strong>（Fine-grained PAT）：仓库选择 <code>{{ GITHUB_OWNER }}/{{ GITHUB_REPO }}</code>，
        权限只勾选 <code>Contents: Read and write</code>，过期时间设为 90 天。Token 仅保存在浏览器 localStorage，
        切勿使用带 <code>repo</code> 全仓库权限的 Token。
      </p>
      <p v-if="tokenValid === true" class="token-status token-ok">✓ Token 有效</p>
      <p v-if="tokenValid === false" class="token-status token-invalid">✗ Token 无效或已过期，请重新配置</p>
    </section>

    <!-- 安全设置：修改密码 -->
    <section class="section password-section">
      <h2 class="section-title">安全设置</h2>
      <div class="form-row">
        <label>当前密码</label>
        <input type="password" v-model="currentPassword" class="input" placeholder="输入当前密码" />
      </div>
      <div class="form-row">
        <label>新密码</label>
        <input type="password" v-model="newPassword" class="input" placeholder="输入新密码（留空不修改）" />
      </div>
      <button class="btn btn-sm" @click="changePassword" :disabled="changingPassword">
        {{ changingPassword ? '修改中…' : '修改密码' }}
      </button>
      <p v-if="passwordMsg" class="password-msg" :class="{ 'password-ok': passwordOk, 'password-err': !passwordOk }">{{ passwordMsg }}</p>
      <p class="hint">密码保存在 data.json 的 <code>adminPassword</code> 字段中，修改后需保存到 GitHub 才会生效</p>
    </section>

    <!-- 选项卡导航 -->
    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >{{ tab.label }}<span v-if="dirtyTabs.has(tab.id)" class="dirty-dot">●</span></button>
    </nav>

    <!-- ============================================ -->
    <!-- 选项卡内容 -->
    <!-- ============================================ -->

    <!-- 1. 个人资料 -->
    <section v-if="activeTab === 'profile'" class="section">
      <h2 class="section-title">个人资料</h2>
      <div class="form-group">
        <label>姓名</label>
        <input v-model="editData.profile.name" class="input" />
      </div>
      <div class="form-group">
        <label>标语</label>
        <input v-model="editData.profile.slogan" class="input" />
      </div>
      <div class="form-group">
        <label>关于我</label>
        <textarea v-model="editData.profile.about" class="textarea" rows="4"></textarea>
      </div>
      <div class="form-row-3">
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="editData.profile.contact.email" class="input" />
        </div>
        <div class="form-group">
          <label>GitHub 链接</label>
          <input v-model="editData.profile.contact.github" class="input" />
        </div>
        <div class="form-group">
          <label>GitHub 用户名</label>
          <input v-model="editData.profile.contact.githubName" class="input" />
        </div>
      </div>
      <div class="form-row-3">
        <div class="form-group">
          <label>抖音链接</label>
          <input v-model="editData.profile.contact.douyin" class="input" />
        </div>
        <div class="form-group">
          <label>抖音名称</label>
          <input v-model="editData.profile.contact.douyinName" class="input" />
        </div>
        <div class="form-group">
          <label>小红书名称</label>
          <input v-model="editData.profile.contact.xiaohongshuName" class="input" />
        </div>
      </div>
      <div class="form-group">
        <label>小红书链接</label>
        <input v-model="editData.profile.contact.xiaohongshu" class="input" />
      </div>
    </section>

    <!-- 2. 导航项 -->
    <section v-if="activeTab === 'nav'" class="section">
      <h2 class="section-title">导航菜单</h2>
      <div
        v-for="(item, i) in editData.nav"
        :key="i"
        class="card"
        :class="{ 'drag-over': dragOverIndex === i && dragSource === 'nav' }"
        draggable="true"
        @dragstart="onDragStart(i, 'nav')"
        @dragover.prevent="onDragOver(i)"
        @dragenter="onDragEnter(i)"
        @dragleave="onDragLeave(i)"
        @drop.prevent="onDrop(i, 'nav')"
        @dragend="dragEnd"
      >
        <div class="form-row-3">
          <div class="form-group">
            <label>路径</label>
            <input v-model="item.path" class="input" />
          </div>
          <div class="form-group">
            <label>中文名</label>
            <input v-model="item.name" class="input" />
          </div>
          <div class="form-group">
            <label>英文标签</label>
            <input v-model="item.label" class="input" />
          </div>
        </div>
        <button class="btn btn-danger btn-sm" @click="removeNavItem(i)">删除</button>
      </div>
      <button class="btn btn-add" @click="addNavItem">+ 添加导航项</button>
    </section>

    <!-- 3. 首页诗歌 -->
    <section v-if="activeTab === 'home'" class="section">
      <h2 class="section-title">首页诗歌文字</h2>
      <p class="hint">每组包含一个或多个元素（element），可设置位置、动画参数</p>
      <div
        v-for="(group, gi) in editData.home"
        :key="gi"
        class="card"
      >
        <div class="card-header">
          <span class="card-title">第 {{ gi + 1 }} 组</span>
          <button class="btn btn-danger btn-sm" @click="removeHomeGroup(gi)">删除组</button>
        </div>
        <div
          v-for="(el, ei) in group.elements"
          :key="ei"
          class="sub-card"
        >
          <div class="form-row-2">
            <div class="form-group">
              <label>文本</label>
              <input v-model="el.text" class="input" />
            </div>
            <div class="form-group">
              <label>位置 class（如 pos-1）</label>
              <input v-model="el.class" class="input" />
            </div>
          </div>
          <div class="form-row-4">
            <div class="form-group">
              <label>目标位置</label>
              <input v-model="el.altPos" class="input" />
            </div>
            <div class="form-group">
              <label>大号字体</label>
              <select v-model="el.xl" class="input">
                <option :value="false">否</option>
                <option :value="true">是</option>
              </select>
            </div>
            <div class="form-group">
              <label>打字光标</label>
              <select v-model="el.typingIndicator" class="input">
                <option :value="false">否</option>
                <option :value="true">是</option>
              </select>
            </div>
            <div class="form-group">
              <label>闪烁时长(s)</label>
              <input v-model="el.scrambleDuration" class="input" placeholder="留空=默认" />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Flip 缓动</label>
              <input v-model="el.flipEase" class="input" placeholder="如 expo.in, 留空=默认" />
            </div>
          </div>
          <button class="btn btn-danger btn-sm" @click="removeHomeElement(gi, ei)">删除元素</button>
        </div>
        <button class="btn btn-add btn-sm" @click="addHomeElement(gi)">+ 添加元素</button>
      </div>
      <button class="btn btn-add" @click="addHomeGroup">+ 添加组</button>
    </section>

    <!-- 4. 关于我 -->
    <section v-if="activeTab === 'about'" class="section">
      <h2 class="section-title">关于我</h2>
      <div class="form-group">
        <label>简介内容（Markdown 格式）</label>
        <textarea v-model="editData.about.content" class="textarea" rows="10" placeholder="支持 Markdown 语法"></textarea>
      </div>
      <div class="form-group">
        <label>技能标签（逗号分隔）</label>
        <input v-model="editData.about.skills" class="input" placeholder="如 Vue, React, Node.js, Three.js" />
      </div>
    </section>

    <!-- 5. 工作经历 -->
    <section v-if="activeTab === 'work'" class="section">
      <h2 class="section-title">工作经历</h2>
      <div
        v-for="(section, si) in editData.work.sections"
        :key="section.id"
        class="card"
        :class="{ 'drag-over': dragOverIndex === si && dragSource === 'workSections' }"
        draggable="true"
        @dragstart="onDragStart(si, 'workSections')"
        @dragover.prevent="onDragOver(si)"
        @dragenter="onDragEnter(si)"
        @dragleave="onDragLeave(si)"
        @drop.prevent="onDrop(si, 'workSections')"
        @dragend="dragEnd"
      >
        <div class="card-header">
          <span class="card-title">{{ section.label }}</span>
          <button class="btn btn-danger btn-sm" @click="removeWorkSection(si)">删除分区</button>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>分区 ID</label>
            <input v-model="section.id" class="input" />
          </div>
          <div class="form-group">
            <label>分区名称</label>
            <input v-model="section.label" class="input" />
          </div>
        </div>
        <div
          v-for="(card, ci) in section.cards"
          :key="ci"
          class="sub-card"
          :class="{ 'drag-over': dragOverIndex === ci && dragSource === 'workCards' }"
          draggable="true"
          @dragstart="onDragStart(ci, 'workCards-' + si)"
          @dragover.prevent="onDragOver(ci)"
          @dragenter="onDragEnter(ci)"
          @dragleave="onDragLeave(ci)"
          @drop.prevent="onDropWorkCard(ci, si)"
          @dragend="dragEnd"
        >
          <div class="card-header">
            <span class="card-title">卡片 {{ ci + 1 }}：{{ card.company }}</span>
            <button class="btn btn-danger btn-sm" @click="removeWorkCard(si, ci)">删除卡片</button>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label>时间</label>
              <input v-model="card.time" class="input" />
            </div>
            <div class="form-group">
              <label>公司/项目</label>
              <input v-model="card.company" class="input" />
            </div>
            <div class="form-group">
              <label>角色</label>
              <input v-model="card.role" class="input" />
            </div>
          </div>
          <div
            v-for="(detail, di) in card.details"
            :key="di"
            class="detail-row"
          >
            <div class="form-row-2">
              <div class="form-group">
                <label>标题</label>
                <input v-model="detail.label" class="input" />
              </div>
              <div class="form-group">
                <label>描述</label>
                <input v-model="detail.text" class="input" />
              </div>
            </div>
            <button class="btn btn-danger btn-sm" @click="removeWorkDetail(si, ci, di)">删除</button>
          </div>
          <button class="btn btn-add btn-sm" @click="addWorkDetail(si, ci)">+ 添加详情</button>
        </div>
        <button class="btn btn-add btn-sm" @click="addWorkCard(si)">+ 添加卡片</button>
      </div>
      <button class="btn btn-add" @click="addWorkSection">+ 添加分区</button>
    </section>

    <!-- 5. 项目（作品集） -->
    <section v-if="activeTab === 'projects'" class="section">
      <h2 class="section-title">作品集项目</h2>
      <div
        v-for="(proj, pi) in editData.projects"
        :key="proj.id"
        class="card"
        :class="{ 'drag-over': dragOverIndex === pi && dragSource === 'projects' }"
        draggable="true"
        @dragstart="onDragStart(pi, 'projects')"
        @dragover.prevent="onDragOver(pi)"
        @dragenter="onDragEnter(pi)"
        @dragleave="onDragLeave(pi)"
        @drop.prevent="onDrop(pi, 'projects')"
        @dragend="dragEnd"
      >
        <div class="card-header">
          <span class="card-title">{{ proj.title }}</span>
          <button class="btn btn-danger btn-sm" @click="removeProject(pi)">删除项目</button>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>ID</label>
            <input v-model="proj.id" type="number" class="input" />
          </div>
          <div class="form-group">
            <label>标题</label>
            <input v-model="proj.title" class="input" />
          </div>
        </div>
        <div class="form-group">
          <label>描述</label>
          <input v-model="proj.desc" class="input" />
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label>英文标题</label>
            <input v-model="proj.enTitle" class="input" />
          </div>
          <div class="form-group">
            <label>详情页标识</label>
            <input v-model="proj.detail" class="input" />
          </div>
          <div class="form-group">
            <label>封面图片 URL</label>
            <input v-model="proj.coverImage" class="input" placeholder="留空=使用本地图片" />
            <button class="btn btn-sm btn-pick" @click="openImagePicker('projects.' + pi + '.coverImage')">🖼 从已上传图片选择</button>
          </div>
        </div>
        <div class="form-group">
          <label>链接</label>
          <input v-model="proj.link" class="input" />
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="proj.hidden" />
            隐藏该项目
          </label>
        </div>
      </div>
      <button class="btn btn-add" @click="addProject">+ 添加项目</button>
    </section>

    <!-- 6. 小红书帖子 -->
    <section v-if="activeTab === 'xiaohongshu'" class="section">
      <h2 class="section-title">小红书帖子</h2>
      <div class="form-group">
        <label>作者名称</label>
        <input v-model="editData.xiaohongshu.author" class="input" />
      </div>
      <div
        v-for="(post, pi) in editData.xiaohongshu.posts"
        :key="post.id"
        class="card"
        :class="{ 'drag-over': dragOverIndex === pi && dragSource === 'xiaohongshu' }"
        draggable="true"
        @dragstart="onDragStart(pi, 'xiaohongshu')"
        @dragover.prevent="onDragOver(pi)"
        @dragenter="onDragEnter(pi)"
        @dragleave="onDragLeave(pi)"
        @drop.prevent="onDrop(pi, 'xiaohongshu')"
        @dragend="dragEnd"
      >
        <div class="card-header">
          <span class="card-title">{{ post.title }}</span>
          <button class="btn btn-danger btn-sm" @click="removeXhsPost(pi)">删除</button>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>ID</label>
            <input v-model="post.id" type="number" class="input" />
          </div>
          <div class="form-group">
            <label>标题</label>
            <input v-model="post.title" class="input" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>链接</label>
            <input v-model="post.link" class="input" />
          </div>
          <div class="form-group">
            <label>点赞数</label>
            <input v-model="post.likes" type="number" class="input" />
          </div>
        </div>
        <div class="form-group">
          <label>封面图片 URL</label>
          <input v-model="post.imageUrl" class="input" placeholder="留空=使用本地图片" />
          <button class="btn btn-sm btn-pick" @click="openImagePicker('xiaohongshu.posts.' + pi + '.imageUrl')">🖼 从已上传图片选择</button>
        </div>
      </div>
      <button class="btn btn-add" @click="addXhsPost">+ 添加帖子</button>
    </section>

    <!-- 7. 公众号 -->
    <section v-if="activeTab === 'gongzhonghao'" class="section">
      <h2 class="section-title">公众号文章</h2>
      <div class="form-group">
        <label>区块标题</label>
        <input v-model="editData.gongzhonghao.title" class="input" />
      </div>
      <div class="form-group">
        <label>副标题</label>
        <input v-model="editData.gongzhonghao.sub" class="input" />
      </div>
      <div
        v-for="(art, ai) in editData.gongzhonghao.articles"
        :key="ai"
        class="card"
        :class="{ 'drag-over': dragOverIndex === ai && dragSource === 'gongzhonghao' }"
        draggable="true"
        @dragstart="onDragStart(ai, 'gongzhonghao')"
        @dragover.prevent="onDragOver(ai)"
        @dragenter="onDragEnter(ai)"
        @dragleave="onDragLeave(ai)"
        @drop.prevent="onDrop(ai, 'gongzhonghao')"
        @dragend="dragEnd"
      >
        <div class="form-row-2">
          <div class="form-group">
            <label>文章标题</label>
            <input v-model="art.title" class="input" />
          </div>
          <div class="form-group">
            <label>链接</label>
            <input v-model="art.url" class="input" />
          </div>
        </div>
        <button class="btn btn-danger btn-sm" @click="removeGzhArticle(ai)">删除</button>
      </div>
      <button class="btn btn-add" @click="addGzhArticle">+ 添加文章</button>
    </section>

    <!-- 8. 个人媒体（个人小红书/个人抖音） -->
    <section v-if="activeTab === 'personal'" class="section">
      <h2 class="section-title">个人媒体</h2>
      <div class="personal-block">
        <h3>个人小红书</h3>
        <div class="form-row-2">
          <div class="form-group">
            <label>作者名</label>
            <input v-model="editData.personalXiaohongshu.author" class="input" />
          </div>
          <div class="form-group">
            <label>副标题（展示在页面）</label>
            <input v-model="editData.personalXiaohongshu.subtitle" class="input" />
          </div>
        </div>
        <div class="form-group">
          <label>封面图片 URL</label>
          <div class="url-picker-row">
            <input v-model="editData.personalXiaohongshu.imageUrl" class="input" placeholder="点击右侧按钮从已上传图片中选择" />
            <button class="btn btn-sm" @click="openImagePicker('personalXiaohongshu.imageUrl')">🖼 选择图片</button>
          </div>
        </div>
        <div class="form-group">
          <label>链接</label>
          <input v-model="editData.personalXiaohongshu.link" class="input" placeholder="个人主页链接（可选）" />
        </div>
      </div>

      <div class="personal-block">
        <h3>个人抖音</h3>
        <div class="form-row-2">
          <div class="form-group">
            <label>作者名</label>
            <input v-model="editData.personalDouyin.author" class="input" />
          </div>
          <div class="form-group">
            <label>副标题（展示在页面）</label>
            <input v-model="editData.personalDouyin.subtitle" class="input" />
          </div>
        </div>
        <div class="form-group">
          <label>封面图片 URL</label>
          <div class="url-picker-row">
            <input v-model="editData.personalDouyin.imageUrl" class="input" placeholder="点击右侧按钮从已上传图片中选择" />
            <button class="btn btn-sm" @click="openImagePicker('personalDouyin.imageUrl')">🖼 选择图片</button>
          </div>
        </div>
        <div class="form-group">
          <label>链接</label>
          <input v-model="editData.personalDouyin.link" class="input" placeholder="个人主页链接（可选）" />
        </div>
      </div>
    </section>

    <!-- 9. 图片上传 -->
    <section v-if="activeTab === 'images'" class="section">
      <h2 class="section-title">图片上传</h2>
      <p class="hint">上传图片到 GitHub，上传后自动返回 URL，可复制到对应字段中使用</p>
      <div class="upload-area">
        <input
          type="file"
          accept="image/*"
          multiple
          @change="handleFileSelect"
          class="file-input"
        />
        <button class="btn" @click="uploadFiles" :disabled="uploading || selectedFiles.length === 0">
          {{ uploading ? '上传中…' : `上传 ${selectedFiles.length} 个文件` }}
        </button>
      </div>
      <div v-if="uploadedUrls.length" class="uploaded-urls">
        <h3>上传成功，URL 列表：</h3>
        <div v-for="(item, i) in uploadedUrls" :key="i" class="url-item">
          <code>{{ item.url }}</code>
          <button class="btn btn-sm" @click="copyText(item.url)">复制</button>
        </div>
      </div>

      <!-- 已上传图片列表 -->
      <div class="image-list-section">
        <h3>已上传图片</h3>
        <button class="btn btn-sm" @click="refreshImageList" :disabled="loadingImages">
          {{ loadingImages ? '加载中…' : '刷新列表' }}
        </button>
        <div v-if="imageList.length === 0 && !loadingImages" class="hint">暂无已上传的图片</div>
        <div class="image-grid">
          <div
            v-for="img in imageList"
            :key="img.name"
            class="image-item"
            @click="copyText(img.url)"
            :title="'点击复制 URL: ' + img.name"
          >
            <img :src="img.downloadUrl" :alt="img.name" class="image-thumb" loading="lazy" />
            <span class="image-name">{{ img.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 图片选择器模态框（选择后直接填入目标字段） -->
    <div v-if="pickTarget" class="modal-overlay" @click.self="pickTarget = null">
      <div class="modal">
        <div class="modal-header">
          <h3>选择已上传图片</h3>
          <button class="btn btn-sm" @click="pickTarget = null">关闭</button>
        </div>
        <div v-if="loadingImages" class="hint">加载中…</div>
        <div v-else-if="imageList.length === 0" class="hint">暂无已上传图片，请先到「图片上传」选项卡上传</div>
        <div v-else class="image-grid">
          <div
            v-for="img in imageList"
            :key="img.name"
            class="image-item"
            @click="pickImage(img.downloadUrl)"
            :title="img.name"
          >
            <img :src="img.downloadUrl" :alt="img.name" class="image-thumb" loading="lazy" />
            <span class="image-name">{{ img.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { siteData, loadSiteData } from '../utils/dataLoader'
import { saveData, uploadImage, listImages, validateToken, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } from '../utils/githubApi'

const router = useRouter()

// 草稿自动保存：localStorage 键
const DRAFT_KEY = 'admin_draft_v1'
// 最后一次自动保存的时间戳（用于草稿过期判断）
let draftTimer = null

// 深拷贝原始数据，在本地编辑
const editData = reactive({
  profile: { contact: {} },
  about: {},
  nav: [],
  home: [],
  work: { sections: [] },
  projects: [],
  xiaohongshu: { posts: [] },
  gongzhonghao: { articles: [] },
  personalXiaohongshu: {},
  personalDouyin: {},
  adminPassword: ''
})

// 加载数据到编辑区
function loadDataIntoEdit() {
  const src = siteData.value
  if (!src) return
  editData.profile = JSON.parse(JSON.stringify(src.profile || { contact: {} }))
  editData.about = JSON.parse(JSON.stringify(src.about || {}))
  editData.nav = JSON.parse(JSON.stringify(src.nav || []))
  editData.home = JSON.parse(JSON.stringify(src.home || []))
  editData.work = JSON.parse(JSON.stringify(src.work || { sections: [] }))
  editData.projects = JSON.parse(JSON.stringify(src.projects || []))
  editData.xiaohongshu = JSON.parse(JSON.stringify(src.xiaohongshu || { author: '', posts: [] }))
  editData.gongzhonghao = JSON.parse(JSON.stringify(src.gongzhonghao || { title: '', sub: '', articles: [] }))
  editData.personalXiaohongshu = JSON.parse(JSON.stringify(src.personalXiaohongshu || { author: '', subtitle: '', imageUrl: '', link: '' }))
  editData.personalDouyin = JSON.parse(JSON.stringify(src.personalDouyin || { author: '', subtitle: '', imageUrl: '', link: '' }))
  editData.adminPassword = (src.adminPassword || '')
}

// ---------- 草稿：自动保存 + 恢复 ----------
// 将当前编辑数据序列化存入 localStorage（节流：编辑后 800ms 静默期才写入）
function scheduleDraftSave() {
  if (draftTimer) clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), ...serializeEditData() }))
    } catch (e) {
      /* localStorage 配额满/隐私模式，静默忽略 */
    }
  }, 800)
}

// 序列化编辑数据（避免保存 reactive 代理本身）
// C档安全加固：不序列化 adminPassword，防止草稿/预览泄漏密码
function serializeEditData() {
  return {
    profile: JSON.parse(JSON.stringify(editData.profile)),
    about: JSON.parse(JSON.stringify(editData.about || {})),
    nav: JSON.parse(JSON.stringify(editData.nav)),
    home: JSON.parse(JSON.stringify(editData.home)),
    work: JSON.parse(JSON.stringify(editData.work)),
    projects: JSON.parse(JSON.stringify(editData.projects)),
    xiaohongshu: JSON.parse(JSON.stringify(editData.xiaohongshu)),
    gongzhonghao: JSON.parse(JSON.stringify(editData.gongzhonghao)),
    personalXiaohongshu: JSON.parse(JSON.stringify(editData.personalXiaohongshu || {})),
    personalDouyin: JSON.parse(JSON.stringify(editData.personalDouyin || {}))
  }
}

// 读取草稿（不存在或损坏返回 null）
function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw)
    if (!draft || typeof draft !== 'object' || !('profile' in draft)) return null
    return draft
  } catch {
    return null
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

// 拖拽排序状态
const dragIndex = ref(null)
const dragOverIndex = ref(null)
const dragSource = ref(null)

function onDragStart(index, source) {
  dragIndex.value = index
  dragSource.value = source
}

function onDragOver(index) {
  if (dragIndex.value === null) return
  dragOverIndex.value = index
}

function onDragEnter(index) {
  dragOverIndex.value = index
}

function onDragLeave(index) {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

function onDrop(index, target) {
  if (dragIndex.value === null || dragIndex.value === index) {
    dragEnd()
    return
  }
  const arr = resolveArray(target)
  if (!arr) { dragEnd(); return }
  const from = dragIndex.value
  const to = index
  const [removed] = arr.splice(from, 1)
  const insertAt = to > from ? to - 1 : to
  arr.splice(insertAt, 0, removed)
  dragEnd()
}

function onDropWorkCard(index, sectionIdx) {
  if (dragIndex.value === null || dragIndex.value === index) {
    dragEnd()
    return
  }
  const section = editData.work.sections[sectionIdx]
  if (!section) { dragEnd(); return }
  const from = dragIndex.value
  const to = index
  const [removed] = section.cards.splice(from, 1)
  const insertAt = to > from ? to - 1 : to
  section.cards.splice(insertAt, 0, removed)
  dragEnd()
}

function dragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
  dragSource.value = null
}

function resolveArray(name) {
  switch (name) {
    case 'nav': return editData.nav
    case 'projects': return editData.projects
    case 'xiaohongshu': return editData.xiaohongshu.posts
    case 'gongzhonghao': return editData.gongzhonghao.articles
    case 'workSections': return editData.work.sections
    default: return null
  }
}

// 已修改标记：记录哪些选项卡有未保存的变更
const dirtyTabs = ref(new Set())
function markDirty(tabId) {
  dirtyTabs.value.add(tabId)
}
function clearDirty() {
  dirtyTabs.value = new Set()
}
// 监听编辑数据变化，标记对应选项卡为已修改
watch(
  () => JSON.stringify(editData.profile),
  () => markDirty('profile')
)
watch(
  () => JSON.stringify(editData.about),
  () => markDirty('about')
)
watch(
  () => JSON.stringify(editData.nav),
  () => markDirty('nav')
)
watch(
  () => JSON.stringify(editData.home),
  () => markDirty('home')
)
watch(
  () => JSON.stringify(editData.work),
  () => markDirty('work')
)
watch(
  () => JSON.stringify(editData.projects),
  () => markDirty('projects')
)
watch(
  () => JSON.stringify(editData.xiaohongshu),
  () => markDirty('xiaohongshu')
)
watch(
  () => JSON.stringify(editData.gongzhonghao),
  () => markDirty('gongzhonghao')
)
watch(
  () => JSON.stringify(editData.personalXiaohongshu) + JSON.stringify(editData.personalDouyin),
  () => markDirty('personal')
)
watch(
  () => editData.adminPassword,
  () => markDirty('personal')
)

// 选项卡
const tabs = [
  { id: 'profile', label: '个人资料' },
  { id: 'nav', label: '导航' },
  { id: 'home', label: '首页诗歌' },
  { id: 'about', label: '关于我' },
  { id: 'work', label: '工作经历' },
  { id: 'projects', label: '作品集' },
  { id: 'xiaohongshu', label: '小红书' },
  { id: 'gongzhonghao', label: '公众号' },
  { id: 'personal', label: '个人媒体' },
  { id: 'images', label: '图片上传' },
]
const activeTab = ref('profile')

// 保存状态
const saving = ref(false)
const saved = ref(false)
const githubToken = ref(localStorage.getItem('github_token') || '')
const tokenValid = ref(null) // null=未检测, true=有效, false=无效

// Token 有效性检测
async function checkToken() {
  tokenValid.value = null
  const token = localStorage.getItem('github_token')
  if (!token) {
    tokenValid.value = false
    return
  }
  try {
    const valid = await validateToken()
    tokenValid.value = valid
  } catch {
    tokenValid.value = false
  }
}

function saveToken() {
  localStorage.setItem('github_token', githubToken.value)
  alert('Token 已保存到浏览器')
  checkToken()
}

// 密码修改
const currentPassword = ref('')
const newPassword = ref('')
const changingPassword = ref(false)
const passwordMsg = ref('')
const passwordOk = ref(false)

async function changePassword() {
  if (!newPassword.value) {
    passwordMsg.value = '请输入新密码'
    passwordOk.value = false
    return
  }
  // 验证当前密码是否与 data.json 中的一致
  const currentAdminPassword = (siteData.value && siteData.value.adminPassword) || ''
  if (currentPassword.value !== currentAdminPassword) {
    passwordMsg.value = '当前密码错误'
    passwordOk.value = false
    return
  }
  // 同步修改 editData 中的 adminPassword，保存时一并写入 data.json
  editData.adminPassword = newPassword.value
  passwordMsg.value = '密码已修改，点击「保存到 GitHub」后生效'
  passwordOk.value = true
  currentPassword.value = ''
  newPassword.value = ''
}

// 保存前校验必填字段，返回第一个错误信息（null = 通过）
function validateData() {
  if (!editData.profile || !editData.profile.name || !editData.profile.name.trim()) {
    return { tab: 'profile', msg: '「姓名」不能为空' }
  }
  for (let i = 0; i < editData.nav.length; i++) {
    const item = editData.nav[i]
    if (!item.path || !item.path.trim()) return { tab: 'nav', msg: `导航第 ${i + 1} 项「路径」不能为空` }
    if (!item.name || !item.name.trim()) return { tab: 'nav', msg: `导航第 ${i + 1} 项「中文名」不能为空` }
  }
  for (let i = 0; i < editData.projects.length; i++) {
    if (!editData.projects[i].title || !editData.projects[i].title.trim()) {
      return { tab: 'projects', msg: `作品集第 ${i + 1} 项「标题」不能为空` }
    }
  }
  for (const section of editData.work.sections) {
    for (const card of section.cards) {
      if (!card.company || !card.company.trim()) {
        return { tab: 'work', msg: `「${section.label}」中存在公司/项目为空的卡片` }
      }
    }
  }
  return null
}

// 保存到 GitHub
async function handleSave() {
  // 先校验必填字段
  const invalid = validateData()
  if (invalid) {
    activeTab.value = invalid.tab
    alert(invalid.msg)
    return
  }

  saving.value = true
  saved.value = false
  try {
    // 构建完整数据对象
    const fullData = {
      ...siteData.value,
      profile: editData.profile,
      about: editData.about,
      nav: editData.nav,
      home: editData.home,
      work: editData.work,
      projects: editData.projects,
      xiaohongshu: editData.xiaohongshu,
      gongzhonghao: editData.gongzhonghao,
      personalXiaohongshu: editData.personalXiaohongshu,
      personalDouyin: editData.personalDouyin,
      adminPassword: editData.adminPassword || ''
    }
    // 保存时处理 scrambleDuration 为 null 的字段
    // 递归处理 home 中的 null scrambleDuration
    for (const group of fullData.home) {
      for (const el of group.elements) {
        if (el.scrambleDuration === '' || el.scrambleDuration === null) {
          el.scrambleDuration = null
        } else if (typeof el.scrambleDuration === 'string') {
          const parsed = parseFloat(el.scrambleDuration)
          el.scrambleDuration = isNaN(parsed) ? null : parsed
        }
      }
    }
    // 处理 likes 空字符串
    for (const post of fullData.xiaohongshu.posts) {
      if (post.likes === '' || post.likes === null) post.likes = null
    }
    await saveData(fullData)
    // 保存成功后清除草稿
    clearDraft()
    // 清除所有修改标记
    clearDirty()
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) {
    alert('保存失败：' + (e.message || e))
  } finally {
    saving.value = false
  }
}

function handleLogout() {
  localStorage.removeItem('isAdmin')
  router.push('/admin')
}

// ----- 导航项操作 -----
function addNavItem() {
  editData.nav.push({ path: '/', name: '新页面', label: 'New' })
}
function removeNavItem(i) {
  editData.nav.splice(i, 1)
}

// ----- 首页诗歌操作 -----
function addHomeGroup() {
  editData.home.push({
    elements: [{ text: '新文字', class: 'pos-1', altPos: 'pos-2', scrambleDuration: null, xl: false, typingIndicator: false, flipEase: null }]
  })
}
function removeHomeGroup(gi) {
  editData.home.splice(gi, 1)
}
function addHomeElement(gi) {
  editData.home[gi].elements.push({ text: '', class: 'pos-1', altPos: 'pos-1', scrambleDuration: null, xl: false, typingIndicator: false, flipEase: null })
}
function removeHomeElement(gi, ei) {
  editData.home[gi].elements.splice(ei, 1)
}

// ----- 工作经历操作 -----
function addWorkSection() {
  const id = 'sec-' + Date.now()
  editData.work.sections.push({ id, label: '新分区', cards: [] })
}
function removeWorkSection(si) {
  editData.work.sections.splice(si, 1)
}
function addWorkCard(si) {
  editData.work.sections[si].cards.push({ time: '', company: '', role: '', details: [] })
}
function removeWorkCard(si, ci) {
  editData.work.sections[si].cards.splice(ci, 1)
}
function addWorkDetail(si, ci) {
  editData.work.sections[si].cards[ci].details.push({ label: '', text: '' })
}
function removeWorkDetail(si, ci, di) {
  editData.work.sections[si].cards[ci].details.splice(di, 1)
}

// ----- 项目操作 -----
function addProject() {
  const maxId = Math.max(...editData.projects.map(p => p.id), 0)
  editData.projects.push({ id: maxId + 1, title: '新项目', desc: '', enTitle: '', detail: '', coverImage: '', link: '', hidden: false, curveConfig: null })
}
function removeProject(pi) {
  editData.projects.splice(pi, 1)
}

// ----- 小红书操作 -----
function addXhsPost() {
  const maxId = Math.max(...editData.xiaohongshu.posts.map(p => p.id), 0)
  editData.xiaohongshu.posts.push({ id: maxId + 1, title: '新帖子', link: '', likes: null, imageUrl: '' })
}
function removeXhsPost(pi) {
  editData.xiaohongshu.posts.splice(pi, 1)
}

// ----- 公众号操作 -----
function addGzhArticle() {
  editData.gongzhonghao.articles.push({ title: '新文章', url: '' })
}
function removeGzhArticle(ai) {
  editData.gongzhonghao.articles.splice(ai, 1)
}

// ----- 图片上传 -----
const selectedFiles = ref([])
const uploading = ref(false)
const uploadedUrls = ref([])

// 已上传图片列表（从 GitHub public/images 读取）
const imageList = ref([])
const loadingImages = ref(false)

async function refreshImageList() {
  loadingImages.value = true
  try {
    imageList.value = await listImages()
  } catch (e) {
    console.error('获取图片列表失败:', e)
    imageList.value = []
  } finally {
    loadingImages.value = false
  }
}

function handleFileSelect(e) {
  selectedFiles.value = Array.from(e.target.files || [])
  uploadedUrls.value = []
}

async function uploadFiles() {
  uploading.value = true
  uploadedUrls.value = []
  for (const file of selectedFiles.value) {
    try {
      const url = await uploadImage(file, file.name)
      uploadedUrls.value.push({ name: file.name, url })
    } catch (e) {
      console.error('上传失败:', file.name, e)
      uploadedUrls.value.push({ name: file.name, url: '上传失败: ' + (e.message || e) })
    }
  }
  uploading.value = false
  // 上传完成后刷新已上传列表
  refreshImageList()
}

// 复制/填入图片 URL
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板')
  })
}

// 预览模式：将当前编辑数据注入 sessionStorage，然后在新标签页打开前台
function openPreview() {
  const previewData = {
    ...serializeEditData(),
    // 确保预览数据完整
    about: editData.about || {},
    personalXiaohongshu: editData.personalXiaohongshu || {},
    personalDouyin: editData.personalDouyin || {}
  }
  try {
    sessionStorage.setItem('preview_data', JSON.stringify(previewData))
    // 计算站点的根路径（hash 路由模式下，去掉 # 后面的部分）
    const base = window.location.href.split('#')[0]
    window.open(base, '_blank')
  } catch (e) {
    alert('预览启动失败：' + (e.message || e))
  }
}

// 图片选择器：当前编辑的目标字段 + 方法
const pickTarget = ref(null)
function openImagePicker(field) {
  pickTarget.value = field
  refreshImageList()
}
function pickImage(url) {
  if (!pickTarget.value) return
  const t = pickTarget.value
  const parts = t.split('.')
  // 支持 editData.xxx 深层路径 或 editData.arr[i].field
  const key = parts.shift()
  const obj = editData[key]
  if (!obj) return
  // 用 lodash 风格 setter 简化
  setByPath(editData, t, url)
  pickTarget.value = null
  alert('已填入图片 URL')
}
function setByPath(obj, path, value) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]]
    if (!cur) return
  }
  cur[parts[parts.length - 1]] = value
}

// 监听所有编辑字段的深度变化，自动安排草稿保存
watch(
  () => JSON.stringify(editData),
  () => scheduleDraftSave()
)

// 上传图片成功后也触发一次草稿保存（图片 URL 复制场景不影响）
onMounted(async () => {
  if (await loadSiteData()) loadDataIntoEdit()
  // —— Token 有效性检测 ——
  checkToken()
  // —— 草稿恢复逻辑：有草稿则提示用户，选择恢复则覆盖当前编辑数据 ——
  const draft = readDraft()
  if (draft) {
    const ok = confirm(
      '检测到未保存的草稿（保存于 ' + new Date(draft.savedAt || Date.now()).toLocaleString() + '）\n是否恢复？'
    )
    if (ok) {
      if (editData.profile.contact) {
        // C档安全加固：草稿已不含 adminPassword（见 serializeEditData），恢复时也不覆盖密码，保留当前已加载的密码
        ;['profile', 'about', 'nav', 'home', 'work', 'projects', 'xiaohongshu', 'gongzhonghao', 'personalXiaohongshu', 'personalDouyin'].forEach(k => {
          if (draft[k] !== undefined) editData[k] = JSON.parse(JSON.stringify(draft[k]))
        })
      }
    } else {
      clearDraft()
    }
  }
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 80px;
  font-family: system-ui, -apple-system, sans-serif;
}

/* 头部 */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 4px solid var(--nyc-black);
  margin-bottom: 24px;
}

.admin-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--nyc-black);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.saving-indicator {
  color: #f59e0b;
  font-weight: 700;
  font-size: 14px;
}

.saved-indicator {
  color: var(--nyc-green);
  font-weight: 700;
  font-size: 14px;
}

/* 按钮 */
.btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  border: 2px solid var(--nyc-black);
  background: var(--nyc-white);
  color: var(--nyc-black);
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn:hover {
  background: var(--nyc-yellow);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}
.btn-save {
  background: var(--nyc-black);
  color: var(--nyc-white);
}
.btn-save:hover {
  background: var(--nyc-green);
  border-color: var(--nyc-green);
  color: var(--nyc-white);
}
.btn-preview {
  border-color: var(--nyc-green);
  color: var(--nyc-green);
}
.btn-preview:hover {
  background: var(--nyc-green);
  color: var(--nyc-white);
  border-color: var(--nyc-green);
}
.btn-logout {
  border-color: #e74c3c;
  color: #e74c3c;
}
.btn-logout:hover {
  background: #e74c3c;
  color: var(--nyc-white);
}
.btn-add {
  margin-top: 12px;
  border-style: dashed;
  border-color: var(--nyc-green);
  color: var(--nyc-green);
}
.btn-add:hover {
  background: var(--nyc-green);
  color: var(--nyc-white);
}
.btn-danger {
  border-color: #e74c3c;
  color: #e74c3c;
  margin-top: 8px;
}
.btn-danger:hover {
  background: #e74c3c;
  color: var(--nyc-white);
}

/* 选项卡 */
.tab-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 2px solid #eee;
  padding-bottom: 2px;
}

.tab {
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: #888;
  transition: all 0.15s ease;
}
.tab:hover {
  color: var(--nyc-black);
  background: #f5f5f5;
}
.tab.active {
  color: var(--nyc-black);
  border-bottom-color: var(--nyc-green);
}

/* 区块 */
.section {
  margin-bottom: 32px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--nyc-black);
  margin: 0 0 16px;
}

/* 表单 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.form-group label {
  font-size: 12px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.form-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
.form-row-4 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 12px;
}

.input, .textarea {
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.15s ease;
  width: 100%;
  box-sizing: border-box;
}
.input:focus, .textarea:focus {
  border-color: var(--nyc-green);
}
.textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}
select.input {
  appearance: auto;
}
.hint {
  font-size: 13px;
  color: #999;
  margin: 4px 0 16px;
}
/* Token 状态 */
.token-status {
  font-size: 13px;
  font-weight: 700;
  margin-top: 8px;
}
.token-ok {
  color: #27ae60;
}
.token-invalid {
  color: #e74c3c;
}
/* 密码修改 */
.password-section {
  margin-bottom: 20px;
}
.password-msg {
  font-size: 13px;
  font-weight: 700;
  margin-top: 8px;
}
.password-ok {
  color: #27ae60;
}
.password-err {
  color: #e74c3c;
}
code {
  font-size: 12px;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
}

/* 卡片 */
.card {
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--nyc-black);
}
.sub-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
  background: var(--nyc-white);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}
.detail-row .form-row-2 {
  flex: 1;
}

/* Token 配置 */
.token-section {
  background: #fffbe6;
  border: 2px solid #fde68a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

/* 图片上传 */
.upload-area {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.file-input {
  font-size: 14px;
}
.uploaded-urls {
  margin-top: 16px;
}
.uploaded-urls h3 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}
.url-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
  word-break: break-all;
}
.url-item code {
  font-size: 12px;
  flex: 1;
}

/* 从已上传图片选择按钮 */
.btn-pick {
  margin-top: 6px;
  border-color: var(--nyc-green);
  color: var(--nyc-green);
}
.btn-pick:hover {
  background: var(--nyc-green);
  color: var(--nyc-white);
}

/* 拖拽排序 */
.card.dragging, .sub-card.dragging {
  opacity: 0.5;
}
.drag-over {
  border-color: var(--nyc-green) !important;
  box-shadow: 0 0 0 2px var(--nyc-green);
}
.card[draggable="true"], .sub-card[draggable="true"] {
  cursor: grab;
}
.card[draggable="true"]:active, .sub-card[draggable="true"]:active {
  cursor: grabbing;
}

/* 修改标记 */
.dirty-dot {
  color: #e74c3c;
  font-size: 10px;
  margin-left: 2px;
  vertical-align: super;
}

/* 预览按钮点击后禁用短暂防连点 */
.btn-preview:active {
  opacity: 0.7;
}

/* 已上传图片网格 */
.image-list-section {
  margin-top: 32px;
  border-top: 2px solid #eee;
  padding-top: 20px;
}
.image-list-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.image-item {
  border: 2px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
  background: #fafafa;
}
.image-item:hover {
  border-color: var(--nyc-green);
  transform: translateY(-2px);
}
.image-thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}
.image-name {
  display: block;
  font-size: 11px;
  color: #666;
  padding: 6px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 图片选择器模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: var(--nyc-white);
  border-radius: 12px;
  padding: 24px;
  max-width: 640px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

/* 个人媒体区块 */
.personal-block {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}
.personal-block h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #333;
  border-bottom: 2px solid var(--nyc-green);
  padding-bottom: 8px;
}
.url-picker-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.url-picker-row .input {
  flex: 1;
}

@media (max-width: 768px) {
  .form-row-2, .form-row-3, .form-row-4 {
    grid-template-columns: 1fr;
  }
  .form-row {
    flex-direction: column;
  }
}
</style>