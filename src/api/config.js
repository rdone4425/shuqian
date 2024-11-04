const isProd = import.meta.env.PROD
const API_BASE = isProd 
  ? '/api'  // Pages 生产环境
  : import.meta.env.VITE_API_BASE_URL // 开发环境

export const API_CONFIG = {
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
} 