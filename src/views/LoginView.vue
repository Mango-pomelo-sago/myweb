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
        
        <button type="submit" class="login-btn">
          登录
        </button>
        
        <p v-if="error" class="error-msg">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const password = ref('')
const error = ref('')

const handleLogin = () => {
  // 简单密码验证（实际部署时建议加密）
  if (password.value === 'admin123') {
    localStorage.setItem('isAdmin', 'true')
    router.push('/admin/dashboard')
  } else {
    error.value = '密码错误'
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
