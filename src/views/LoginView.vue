<template>
  <div class="login-view">
    <div class="login-box">
      <h1 class="title">后台管理</h1>
      <div class="divider"></div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="输入管理员密码"
            required
          />
        </div>

        <button type="submit" class="login-btn" :disabled="checking || lockedUntil > 0">
          {{ checking ? '验证中…' : (lockedUntil > 0 ? '已锁定' : '登录') }}
        </button>

        <p v-if="error" class="error-msg">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { siteData } from '../utils/dataLoader'

const router = useRouter()
const password = ref('')
const error = ref('')
const checking = ref(false)

// C档安全加固：登录限流 —— 连续失败 5 次锁 5 分钟（localStorage 记时间戳，防刷新绕过）
const MAX_ATTEMPTS = 5
const LOCK_DURATION = 5 * 60 * 1000
const FAIL_KEY = 'login_fail_count'
const LOCK_KEY = 'login_locked_until'

function getLockRemain() {
  const until = Number(localStorage.getItem(LOCK_KEY) || 0)
  return until - Date.now()
}

const lockedUntil = ref(0)

function updateLockState() {
  lockedUntil.value = getLockRemain()
  if (lockedUntil.value <= 0 && localStorage.getItem(LOCK_KEY)) {
    // 锁已过期：重置计数，清除锁
    localStorage.removeItem(LOCK_KEY)
    localStorage.removeItem(FAIL_KEY)
    lockedUntil.value = 0
  }
}

onMounted(updateLockState)

// 从 data.json 获取当前密码（无回退硬编码）
function getAdminPassword() {
  return (siteData.value && siteData.value.adminPassword) || ''
}

const handleLogin = async () => {
  updateLockState()
  if (lockedUntil.value > 0) {
    const mins = Math.ceil(lockedUntil.value / 60000)
    error.value = `失败次数过多，请 ${mins} 分钟后再试`
    return
  }

  checking.value = true
  error.value = ''
  try {
    // 先尝试加载远程数据，确保获取最新密码
    const { loadSiteData } = await import('../utils/dataLoader')
    await loadSiteData(true)

    const adminPassword = getAdminPassword()
    if (!adminPassword) {
      error.value = '后台密码未配置，无法登录'
    } else if (password.value === adminPassword) {
      // 登录成功：清除失败计数与锁，设置登录标记 + 过期时间（24小时）
      localStorage.removeItem(FAIL_KEY)
      localStorage.removeItem(LOCK_KEY)
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('admin_expires', String(Date.now() + 24 * 60 * 60 * 1000))
      router.push('/admin/dashboard')
    } else {
      recordFailure()
    }
  } catch (e) {
    // 加载失败时用本地数据
    const adminPassword = getAdminPassword()
    if (!adminPassword) {
      error.value = '后台密码未配置，无法登录'
    } else if (password.value === adminPassword) {
      localStorage.removeItem(FAIL_KEY)
      localStorage.removeItem(LOCK_KEY)
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('admin_expires', String(Date.now() + 24 * 60 * 60 * 1000))
      router.push('/admin/dashboard')
    } else {
      recordFailure()
    }
  } finally {
    checking.value = false
  }
}

// 记录一次失败；达到阈值即锁定
function recordFailure() {
  const count = Number(localStorage.getItem(FAIL_KEY) || 0) + 1
  if (count >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCK_KEY, String(Date.now() + LOCK_DURATION))
    localStorage.removeItem(FAIL_KEY)
    error.value = `失败次数过多，已锁定 5 分钟`
  } else {
    localStorage.setItem(FAIL_KEY, String(count))
    error.value = `密码错误（还可尝试 ${MAX_ATTEMPTS - count} 次）`
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--nyc-white);
}

.login-box {
  width: 400px;
  max-width: calc(100% - 40px);
  padding: 60px 40px;
  border: 4px solid var(--nyc-black);
  background-color: var(--nyc-white);
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: var(--nyc-black);
  margin-bottom: 15px;
}

.divider {
  width: 60px;
  height: 4px;
  background-color: var(--nyc-green);
  margin-bottom: 40px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 700;
  color: var(--nyc-black);
}

.form-group input {
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  border: 3px solid var(--nyc-black);
  outline: none;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  border-color: var(--nyc-yellow);
}

.login-btn {
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  background-color: var(--nyc-black);
  color: var(--nyc-white);
  border: 3px solid var(--nyc-black);
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background-color: var(--nyc-white);
  color: var(--nyc-black);
  box-shadow: 4px 4px 0px var(--nyc-yellow);
}

.error-msg {
  color: #ff0000;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}
</style>
