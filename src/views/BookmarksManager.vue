<template>
  <div class="bookmarks-manager">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-button type="primary" @click="showAddDialog">
          添加书签
        </el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="bookmarks"
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
      
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑书签' : '添加书签'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="URL" prop="url">
          <el-input v-model="form.url" />
        </el-form-item>
        
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3"
          />
        </el-form-item>
        
        <el-form-item label="父分类" prop="parentCategory">
          <el-select
            v-model="form.parentCategory"
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="cat in categories"
              :key="cat.name"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="子分类">
          <el-select
            v-model="form.subCategory"
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="subCat in subCategories"
              :key="subCat.name"
              :label="subCat.name"
              :value="subCat.name"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="tag in tags"
              :key="tag.tag"
              :label="tag.tag"
              :value="tag.tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api/bookmarks'

const loading = ref(false)
const bookmarks = ref([])
const categories = ref([])
const tags = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = ref({
  url: '',
  title: '',
  description: '',
  parentCategory: '',
  subCategory: '',
  tags: []
})

const rules = {
  url: [{ required: true, message: '请输入URL', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  parentCategory: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

// 获取所有书签
const fetchBookmarks = async () => {
  try {
    loading.value = true
    const { data } = await api.getBookmarks()
    bookmarks.value = Object.entries(data).flatMap(([domain, items]) =>
      items.map(item => ({ ...item, domain }))
    )
  } catch (error) {
    ElMessage.error('获取书签失败')
  } finally {
    loading.value = false
  }
}

// 获取分类和标签
const fetchCategoriesAndTags = async () => {
  try {
    const [categoriesRes, tagsRes] = await Promise.all([
      api.getCategories(),
      api.getDomainTags()
    ])
    categories.value = categoriesRes.data
    tags.value = tagsRes.data
  } catch (error) {
    ElMessage.error('获取分类和标签失败')
  }
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  form.value = {
    url: '',
    title: '',
    description: '',
    parentCategory: '',
    subCategory: '',
    tags: []
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个书签吗？')
    await api.deleteBookmark({
      domain: row.domain,
      path: row.path
    })
    ElMessage.success('删除成功')
    fetchBookmarks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      await api.updateBookmark(form.value)
    } else {
      await api.saveBookmark(form.value)
    }
    
    ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
    dialogVisible.value = false
    fetchBookmarks()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  }
}

onMounted(() => {
  fetchBookmarks()
  fetchCategoriesAndTags()
})
</script>

<style scoped>
.bookmarks-manager {
  padding: 20px;
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

.mb-4 {
  margin-bottom: 16px;
}

.mx-1 {
  margin: 0 4px;
}
</style> 