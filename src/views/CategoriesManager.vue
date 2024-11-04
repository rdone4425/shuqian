<template>
  <div class="categories-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </div>
      </template>

      <el-table :data="categories" v-loading="loading">
        <el-table-column prop="name" label="父分类" />
        <el-table-column label="子分类">
          <template #default="{ row }">
            <el-tag
              v-for="sub in row.subcategories"
              :key="sub.name"
              class="mx-1"
            >
              {{ sub.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加分类"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="父分类" prop="parentCategory">
          <el-input v-model="form.parentCategory" />
        </el-form-item>
        
        <el-form-item label="子分类">
          <el-select
            v-model="form.subCategories"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入子分类"
          >
            <el-option
              v-for="item in form.subCategories"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/bookmarks'

const loading = ref(false)
const categories = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

const form = ref({
  parentCategory: '',
  subCategories: []
})

const rules = {
  parentCategory: [
    { required: true, message: '请输入父分类名称', trigger: 'blur' }
  ]
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    loading.value = true
    const { data } = await api.getCategories()
    categories.value = data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  } finally {
    loading.value = false
  }
}

// 显示添加对话框
const showAddDialog = () => {
  form.value = {
    parentCategory: '',
    subCategories: []
  }
  dialogVisible.value = true
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 逐个添加子分类
    for (const subCategory of form.value.subCategories) {
      await api.saveCategory({
        parentCategory: form.value.parentCategory,
        subCategory
      })
    }
    
    ElMessage.success('分类添加成功')
    dialogVisible.value = false
    fetchCategories()
  } catch (error) {
    console.error('Failed to save category:', error)
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.categories-manager {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mx-1 {
  margin: 0 4px;
}
</style> 