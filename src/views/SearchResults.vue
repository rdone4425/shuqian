<template>
  <div class="search-results">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>搜索结果</span>
          <div class="search-info">
            <template v-if="searchQuery">关键词: {{ searchQuery }}</template>
            <template v-if="searchTag">标签: {{ searchTag }}</template>
            <template v-if="searchCategory">分类: {{ searchCategory }}</template>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="results"
        style="width: 100%"
      >
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="bookmark-title">
              <el-image
                v-if="row.image"
                :src="row.image"
                class="bookmark-icon"
              />
              {{ row.title }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="domain" label="域名" width="180" />
        
        <el-table-column label="分类" width="180">
          <template #default="{ row }">
            {{ row.parentCategory }}
            <span v-if="row.subCategory">
              / {{ row.subCategory }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="标签" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              class="mx-1"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.updatedAt).toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && results.length === 0" class="no-results">
        <el-empty description="没有找到相关书签" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/bookmarks'

const route = useRoute()
const loading = ref(false)
const results = ref([])

const searchQuery = ref('')
const searchTag = ref('')
const searchCategory = ref('')

const search = async () => {
  try {
    loading.value = true
    const params = {
      q: searchQuery.value,
      tag: searchTag.value,
      category: searchCategory.value
    }
    
    const { data } = await api.search(params)
    results.value = data.results || []
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 从路由参数获取搜索条件
  const { q, tag, category } = route.query
  searchQuery.value = q || ''
  searchTag.value = tag || ''
  searchCategory.value = category || ''
  
  if (q || tag || category) {
    search()
  }
})
</script>

<style scoped>
.search-results {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-info {
  font-size: 14px;
  color: #666;
}

.bookmark-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bookmark-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.mx-1 {
  margin: 0 4px;
}

.no-results {
  padding: 40px 0;
  text-align: center;
}
</style> 