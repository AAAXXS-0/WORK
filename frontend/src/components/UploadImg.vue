<template>
  <div class="upload-img">
    <el-upload
      action="/api/upload/img"
      list-type="picture-card"
      :on-success="handleSuccess"
      :on-remove="handleRemove"
      :file-list="fileList"
    >
      <el-icon><plus /></el-icon>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, defineEmits, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const emit = defineEmits(['update:images'])
const fileList = ref([])

// 上传成功
const handleSuccess = (res, file) => {
  console.log('上传成功响应:', res)
  console.log('上传的文件:', file)
  
  // 直接从响应中获取URL
  if (res && res.data && res.data.url) {
    console.log('获取到的图片URL:', res.data.url)
    // 将新URL添加到fileList中
    if (!fileList.value.find(item => item.uid === file.uid)) {
      fileList.value.push({
        name: file.name,
        url: res.data.url,
        uid: file.uid,
        response: res
      })
    }
    // 生成URL数组
    const urls = fileList.value.map(item => {
      if (item.response && item.response.data && item.response.data.url) {
        return item.response.data.url
      }
      return item.url
    })
    console.log('发送的图片URL数组:', urls)
    emit('update:images', urls)
  } else {
    console.error('响应格式错误:', res)
  }
}

// 移除图片
const handleRemove = (file) => {
  console.log('删除的文件:', file)
  
  // 从fileList中移除对应的文件
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    console.log('删除后的fileList:', fileList.value)
  }
  
  // 生成URL数组
  const urls = fileList.value.map(item => {
    if (item.response && item.response.data && item.response.data.url) {
      return item.response.data.url
    }
    if (item.response && item.response.url) {
      return item.response.url
    }
    return item.url
  })
  console.log('删除后的图片URL数组:', urls)
  emit('update:images', urls)
}

// 监听 fileList 变化，确保数据同步
watch(fileList, (newVal) => {
  console.log('fileList 变化:', newVal)
}, { deep: true })
</script>

<style scoped>
.upload-img { margin: 10px 0; }
</style>