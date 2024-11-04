import axios from 'axios'
import { ElMessage } from 'element-plus'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error || error.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default {
  // 书签相关
  async saveBookmark(data) {
    const { url } = data
    if (!url) throw new Error('URL不能为空')
    return api.post('/api/save', data)
  },
  
  async getBookmarks(domain) {
    const params = domain ? { domain } : {}
    return api.get('/api/bookmarks', { params })
  },
  
  async updateBookmark(data) {
    const { domain, path } = data
    if (!domain || !path) throw new Error('域名和路径不能为空')
    return api.post('/api/update', data)
  },
  
  async deleteBookmark(data) {
    const { domain, path } = data
    if (!domain || !path) throw new Error('域名和路径不能为空')
    return api.post('/api/delete', data)
  },

  // 分类相关
  async getCategories() {
    return api.get('/api/categories/list')
  },
  
  async saveCategory(data) {
    const { parentCategory } = data
    if (!parentCategory) throw new Error('分类名称不能为空')
    return api.post('/api/categories/save', data)
  },
  
  async getDomainCategories(domain) {
    return api.get('/api/domain/categories', { params: { domain } })
  },

  // 标签相关
  async getDomainTags(domain) {
    return api.get('/api/domain/tags', { params: { domain } })
  },

  // 统计相关
  async getStats() {
    return api.get('/api/stats')
  },

  // 搜索
  async search(params) {
    if (!params.q && !params.tag && !params.category) {
      throw new Error('请输入搜索条件')
    }
    return api.get('/api/search', { params })
  }
} 