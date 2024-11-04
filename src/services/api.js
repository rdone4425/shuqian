import { API_BASE_URL } from '../config';

const fetchAPI = async (endpoint, options = {}) => {
  try {
    console.log(`Fetching ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`API Response:`, data);
    return data;
    
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};

export const bookmarkAPI = {
  // 获取书签列表
  getBookmarks: (domain) => 
    fetchAPI(`/api/bookmarks${domain ? `?domain=${domain}` : ''}`),
    
  // 保存书签
  saveBookmark: (data) => 
    fetchAPI('/api/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  // 更新书签
  updateBookmark: (data) => 
    fetchAPI('/api/update', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  // 删除书签
  deleteBookmark: (data) => 
    fetchAPI('/api/delete', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  // 获取分类
  getCategories: () => 
    fetchAPI('/api/categories/list'),
    
  // 保存分类
  saveCategory: (data) => 
    fetchAPI('/api/categories/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  // 获取统计信息
  getStats: () => 
    fetchAPI('/api/stats'),
    
  // 搜索书签
  searchBookmarks: (params) => 
    fetchAPI(`/api/search?${new URLSearchParams(params)}`),
    
  // 获取域名标签
  getDomainTags: () => 
    fetchAPI('/api/domain/tags'),
}; 