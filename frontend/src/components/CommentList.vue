<template>
  <div class="comment-list">
    <h4>评论区</h4>
    <el-input 
      v-model="commentContent" 
      placeholder="输入评论..." 
      @keyup.enter="addComment"
    />
    <el-button @click="addComment">发布评论</el-button>
    <div v-for="item in commentList" :key="item.id" class="comment-item">
      <div class="comment-header">
        <div class="comment-user">
          <el-avatar :size="32" :src="item.avatar ? backendUrl + item.avatar : ''">
            {{ item.username?.charAt(0) || 'U' }}
          </el-avatar>
          <span class="username">{{ item.username }}</span>
        </div>
        <audit-status :status="item.status" />
      </div>
      <div class="comment-content">{{ item.content }}</div>
      <div class="comment-time">{{ formatTime(item.createTime) }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { ElMessage } from 'element-plus'
import AuditStatus from './AuditStatus.vue'
import commentApi from '@/api/comment'

const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
})

const commentContent = ref('')
const commentList = ref([])
const backendUrl = 'http://localhost:3000'

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 获取评论列表
const getCommentList = async () => {
  const res = await commentApi.getComment(props.postId)
  commentList.value = res.data
}

// 发布评论
const addComment = async () => {
  if (!commentContent.value) return ElMessage.warning('评论不能为空')
  await commentApi.addComment({
    postId: props.postId,
    content: commentContent.value
  })
  commentContent.value = ''
  getCommentList()
  ElMessage.success('评论发表成功，正在审核中')
}

onMounted(() => {
  getCommentList()
})
</script>

<style scoped>
.comment-list { margin-top: 20px; }
.comment-item { margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; }
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.username {
  font-weight: 500;
  font-size: 14px;
}
.comment-content {
  margin-bottom: 5px;
  line-height: 1.6;
}
.comment-time { font-size: 12px; color: #999; }
</style>