<template>
  <div v-if="error" class="error-boundary">
    <el-alert
      :title="error.message"
      type="error"
      :closable="false"
      show-icon
    >
      <template #default>
        <el-button type="primary" @click="handleRetry">
          重试
        </el-button>
      </template>
    </el-alert>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)
const emit = defineEmits(['retry'])

onErrorCaptured((err) => {
  error.value = err
  return false
})

const handleRetry = () => {
  error.value = null
  emit('retry')
}
</script> 