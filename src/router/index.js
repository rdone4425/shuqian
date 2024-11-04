import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import BookmarksManager from '@/views/BookmarksManager.vue'
import CategoriesManager from '@/views/CategoriesManager.vue'
import TagsManager from '@/views/TagsManager.vue'
import SearchResults from '@/views/SearchResults.vue'
import Login from '@/views/Login.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { title: '仪表盘' }
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: BookmarksManager,
    meta: { title: '书签管理' }
  },
  {
    path: '/categories',
    name: 'categories',
    component: CategoriesManager,
    meta: { title: '分类管理' }
  },
  {
    path: '/tags',
    name: 'tags',
    component: TagsManager,
    meta: { title: '标签管理' }
  },
  {
    path: '/search',
    name: 'search',
    component: SearchResults,
    meta: { title: '搜索结果' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { 
      title: '登录',
      public: true 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫，设置页面标题
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  document.title = to.meta.title ? `${to.meta.title} - 书签管理系统` : '书签管理系统'
  
  if (!to.meta.public && !authStore.isAuthenticated()) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router 