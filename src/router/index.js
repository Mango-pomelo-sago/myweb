import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/HomeView.vue')
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('../views/AboutView.vue')
      },
      {
        path: 'portfolio',
        name: 'Portfolio',
        component: () => import('../views/PortfolioView.vue')
      },
      {
        path: 'portfolio/xiaohongshu',
        name: 'Xiaohongshu',
        component: () => import('../views/XiaohongshuView.vue'),
        meta: { showBackToPortfolio: true }
      },
      {
        path: 'portfolio/design',
        name: 'DesignGallery',
        component: () => import('../views/GalleryView.vue'),
        props: { category: 'design' },
        meta: { showBackToPortfolio: true }
      },
      {
        path: 'portfolio/paint',
        name: 'PaintGallery',
        component: () => import('../views/GalleryView.vue'),
        props: { category: 'paint' },
        meta: { showBackToPortfolio: true }
      },
      {
        path: 'portfolio/photo',
        name: 'PhotoGallery',
        component: () => import('../views/GalleryView.vue'),
        props: { category: 'photo' },
        meta: { showBackToPortfolio: true }
      },
      {
        path: 'work',
        name: 'Work',
        component: () => import('../views/WorkExperienceView.vue')
      },
      {
        path: 'contact',
        name: 'Contact',
        component: () => import('../views/ContactView.vue')
      }
    ]
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 会话状态：仅存在于内存（模块级），绝不写入 localStorage。
// 每次整页刷新都会重新走 checkSession() → GET /api/session 校验 HttpOnly cookie。
let sessionChecked = false
let sessionValid = false

// 通过 /api/session 校验会话；silent=true 时失败不抛错（用于启动期静默检查）
export const checkSession = async (silent = true) => {
  if (sessionChecked && sessionValid) return true
  try {
    const { default: api } = await import('../utils/api')
    const { data } = await api.get('/session', { validateStatus: () => true })
    sessionValid = Boolean(data && data.authenticated)
  } catch (e) {
    sessionValid = false
  }
  sessionChecked = true
  return sessionValid
}

// 登录/登出后直接设置内存态（配合服务端 cookie）
export const setSession = (valid) => {
  sessionValid = valid
  sessionChecked = true
}

// 路由守卫：后台路由必须真实会话（服务端校验），否则跳登录页
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const valid = await checkSession()
    if (!valid) {
      next('/admin')
      return
    }
  }
  next()
})

export default router