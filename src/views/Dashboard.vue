<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <h3>总书签数</h3>
          <div class="stat-value">{{ stats.bookmarks }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <h3>总域名数</h3>
          <div class="stat-value">{{ stats.domains }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <h3>总标签数</h3>
          <div class="stat-value">{{ stats.tags }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <h3>总分类数</h3>
          <div class="stat-value">{{ stats.categories }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热门域名</span>
            </div>
          </template>
          <el-table :data="stats.topDomains">
            <el-table-column prop="domain" label="域名" />
            <el-table-column prop="count" label="书签数" width="100" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热门标签</span>
            </div>
          </template>
          <el-table :data="stats.topTags">
            <el-table-column prop="tag" label="标签" />
            <el-table-column prop="count" label="使用次数" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row class="mt-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近更新</span>
            </div>
          </template>
          <el-table :data="stats.recentBookmarks">
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column prop="domain" label="域名" width="180" />
            <el-table-column prop="updatedAt" label="更新时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.updatedAt).toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/bookmarks'

const stats = ref({
  bookmarks: 0,
  domains: 0,
  tags: 0,
  categories: 0,
  topDomains: [],
  topTags: [],
  recentBookmarks: []
})

const fetchStats = async () => {
  try {
    const { data } = await api.getStats()
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-top: 10px;
}

.mt-4 {
  margin-top: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 