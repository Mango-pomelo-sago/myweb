import axios from 'axios'

// 统一 API 实例：所有请求走 /api 代理，携带 cookie
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

export default api