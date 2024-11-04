import axios from 'axios'
import { API_CONFIG } from './config'

const api = axios.create(API_CONFIG)

// 添加 CSRF token
api.interceptors.request.use(config => {
  const token = document.cookie.match(/csrf_token=([^;]+)/)?.[1]
  if (token) {
    config.headers['X-CSRF-Token'] = token
  }
  return config
})

export default api 