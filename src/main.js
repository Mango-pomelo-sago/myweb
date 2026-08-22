import { createApp } from 'vue'
import App from './App.vue'
import router, { checkSession } from './router'
import './assets/main.css'

// —— 一次性清理废弃的 localStorage 凭据（旧版遗留，HttpOnly cookie 接管后不再需要） ——
;['isAdmin', 'admin_expires', 'github_token'].forEach(k => localStorage.removeItem(k))

const app = createApp(App)
app.use(router)

// 启动时校验 session（静默）后再 mount，确保路由守卫首次拦截有效
checkSession(true).then(() => {
  app.mount('#app')
})