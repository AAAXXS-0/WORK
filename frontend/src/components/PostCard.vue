<template>
  <el-card class="post-card">
    <div class="post-content">{{ post.content }}</div>
    <div class="post-thumbnail" v-if="post.images && post.images.length > 0">
      <el-image
        :src="getImageUrl(post.images[0])"
        :preview-src-list="post.images.map(img => getImageUrl(img))"
        :initial-index="0"
        fit="cover"
        class="thumbnail-img"
        :preview-teleported="true"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      <span class="image-count" v-if="post.images.length > 1">{{ post.images.length }}张图片</span>
    </div>
    <div class="post-footer">
      <audit-status :status="post.status" />
      <el-button size="small" @click="toDetail">查看详情</el-button>
      <el-button size="small" @click="like">点赞</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import AuditStatus from './AuditStatus.vue'
import commentApi from '@/api/comment'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// 获取图片完整URL
const getImageUrl = (imgPath) => {
  // 如果已经是完整URL，直接返回
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
    return imgPath
  }
  // 如果是相对路径，添加后端服务器地址
  const serverUrl = 'http://localhost:3000'
  return serverUrl + imgPath
}

const toDetail = () => {
  router.push(`/home/post/${props.post.id}`)
}

const like = async () => {
  try {
    await commentApi.like(props.post.id)
    ElMessage.success('点赞成功')
  } catch (error) {
    ElMessage.error('点赞失败')
  }
}
</script>

<style scoped>
.post-card { margin: 10px 0; }
.post-content { margin-bottom: 10px; }
.post-thumbnail {
  position: relative;
  display: inline-block;
  margin: 10px 0;
}
.thumbnail-img {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}
.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}
.image-count {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}
.post-footer { display: flex; justify-content: space-between; align-items: center; }
</style>