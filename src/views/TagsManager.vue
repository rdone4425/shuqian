<template>
  <div class="tags-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>标签管理</span>
        </div>
      </template>

      <el-table :data="tags" v-loading="loading">
        <el-table-column prop="tag" label="标签名称" />
        <el-table-column prop="count" label="使用次数" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/bookmarks'

const loading = ref(false)
const tags = ref([])

// 获取标签列表
const fetchTags = async () => {
  try {
    loading.value = true
    const { data } = await api.getDomainTags()
    tags.value = data
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.tags-manager {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 