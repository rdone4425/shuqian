import axios from 'axios'
import { ElMessage } from 'element-plus'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    const message = error.response?.data?.error || error.message
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default {
  async login(credentials) {
    return api.post('/api/auth/login', credentials)
  },
  
  async logout() {
    return api.post('/api/auth/logout')
  },
  
  async refreshToken() {
    return api.post('/api/auth/refresh')
  }
} 