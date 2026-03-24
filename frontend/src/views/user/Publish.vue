<template>
    <div class="publish-page">
      <el-card>
        <h3>发布帖子</h3>
        <el-form :model="postForm" label-width="80px">
          <el-form-item label="内容">
            <el-input
              v-model="postForm.content"
              type="textarea"
              :rows="10"
              placeholder="请输入帖子内容"
            ></el-input>
          </el-form-item>
          <el-form-item label="图片">
            <upload-img v-model:images="postForm.images" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="publish">发布</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import request from '../../utils/request'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import UploadImg from '@/components/UploadImg.vue'
  
  const router = useRouter()
  const postForm = ref({
    content: '',
    images: []
  })
  
  // 监听images变化
  watch(() => postForm.value.images, (newVal) => {
    console.log('postForm.images 变化:', newVal)
  }, { deep: true })
  
  const publish = async () => {
    if (!postForm.value.content) {
      ElMessage.warning('内容不能为空')
      return
    }
    console.log('准备发布帖子，数据:', postForm.value)
    try {
      await request.post('/post/publish', postForm.value)
      ElMessage.success('发帖成功，审核中')
      router.push('/home')
    } catch (err) {
      ElMessage.error('发帖失败：' + err.msg)
    }
  }
  
  const reset = () => {
    postForm.value.content = ''
    postForm.value.images = []
  }
  </script>
  
  <style scoped>
  .publish-page {
    padding: 20px;
  }
  </style>