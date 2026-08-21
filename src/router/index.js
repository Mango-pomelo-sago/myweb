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
      // 关于我页面暂隐藏，不删除
      // {
      //   path: 'about',
      //   name: 'About',
      //   component: () => import('../views/AboutView.vue')
      // },
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

// 路由守卫：验证后台访问权限
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('isAdmin')) {
    next('/admin')
  } else {
    next()
  }
})

export default router
