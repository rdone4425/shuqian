<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>书签管理系统</h2>
        <p class="subtitle">欢迎回来，请登录您的账号</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            @keyup.enter="focusPassword"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            ref="passwordInput"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            size="large"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)
const formRef = ref(null)
const passwordInput = ref(null)

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const focusPassword = () => {
  passwordInput.value?.focus()
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    await authStore.login(form.value)
    
    const redirect = route.query.redirect || '/'
    router.push(redirect)
    ElMessage.success('登录成功')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:root {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  overflow: hidden;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  margin: 0;
  color: #1f2f3d;
  font-size: 24px;
}

.subtitle {
  margin-top: 12px;
  color: #606266;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

:deep(.el-input__wrapper) {
  padding: 4px 11px;
}

:deep(.el-input__inner) {
  height: 40px;
  font-size: 14px;
}

:deep(.el-form-item__error) {
  padding-top: 4px;
}

:deep(.el-button--primary) {
  background: linear-gradient(90deg, #409eff 0%, #36cfc9 100%);
  border: none;
  transition: transform 0.3s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
</style> 
