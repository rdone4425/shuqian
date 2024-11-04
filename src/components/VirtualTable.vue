<template>
  <el-table
    v-bind="$attrs"
    :height="height"
    :virtual-scrolling="true"
    :item-size="54"
  >
    <slot></slot>
  </el-table>
</template>

<script setup>
defineProps({
  height: {
    type: [String, Number],
    default: '400'
  }
})
</script> 