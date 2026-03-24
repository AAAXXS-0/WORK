<template>
  <div class="post-detail">
    <el-card v-if="post.id" class="detail-card">
      <div class="post-header">
        <div class="user-info">
          <el-avatar :size="50" :src="getImageUrl(post.avatar) || ''">
            {{ post.username?.charAt(0) || "U" }}
          </el-avatar>
          <div class="user-details">
            <div class="username">{{ post.username }}</div>
            <div class="student-id">学号：{{ post.studentId }}</div>
            <div class="post-time">{{ formatTime(post.createTime) }}</div>
          </div>
        </div>
        <audit-status :status="post.status" />
      </div>

      <el-divider></el-divider>

      <div class="post-content">{{ post.content }}</div>

      <div v-if="post.images && post.images.length > 0" class="post-images">
        <div class="images-title">{{ post.images.length }} 张图片</div>
        <div class="images-grid">
          <el-image
            v-for="(img, index) in post.images"
            :key="index"
            :src="getImageUrl(img)"
            :preview-src-list="post.images.map((i) => getImageUrl(i))"
            :initial-index="index"
            fit="cover"
            class="detail-image"
            :preview-teleported="true"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>

      <div class="post-actions">
        <el-button
          :type="isLiked ? 'warning' : 'primary'"
          @click="like"
          :loading="likeLoading"
          round
        >
          <el-icon><Star /></el-icon>
          {{ isLiked ? "已点赞" : "点赞" }} ({{ likeCount }})
        </el-button>
      </div>
    </el-card>

    <comment-list :post-id="postId" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Star, Picture } from "@element-plus/icons-vue";
import AuditStatus from "@/components/AuditStatus.vue";
import CommentList from "@/components/CommentList.vue";
import postApi from "@/api/post";
import commentApi from "@/api/comment";
import viewHistoryApi from "@/api/viewHistory";

const route = useRoute();
const postId = Number(route.params.id);
const post = ref({});
const likeLoading = ref(false);
const isLiked = ref(false);
const likeCount = ref(0);

// 获取图片完整URL
const getImageUrl = (imgPath) => {
  if (!imgPath) return "";
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
    return imgPath;
  }
  return `http://localhost:3000${imgPath}`;
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取帖子详情
const getPostDetail = async () => {
  try {
    const res = await postApi.getPostDetail(postId);
    if (res.code === 0) {
      post.value = res.data;
      // 获取点赞数
      await getLikeCount();
      // 添加浏览记录
      await addViewHistory();
    } else {
      ElMessage.error(res.msg || "获取帖子详情失败");
    }
  } catch (error) {
    console.error("获取帖子详情失败:", error);
    ElMessage.error("获取帖子详情失败");
  }
};

// 添加浏览记录
const addViewHistory = async () => {
  try {
    await viewHistoryApi.addViewHistory(postId);
  } catch (error) {
    console.error("添加浏览记录失败:", error);
  }
};

// 获取点赞数
const getLikeCount = async () => {
  try {
    const res = await postApi.getLikeCount(postId);
    if (res.code === 0) {
      likeCount.value = res.data.count;
    }
  } catch (error) {
    console.error("获取点赞数失败:", error);
  }
};

// 点赞
const like = async () => {
  likeLoading.value = true;
  try {
    const res = await commentApi.like(postId);
    if (res.code === 0) {
      isLiked.value = res.data.liked;
      likeCount.value += res.data.liked ? 1 : -1;
      ElMessage.success(res.data.liked ? "点赞成功" : "取消点赞成功");
    } else {
      ElMessage.error(res.msg || "操作失败");
    }
  } catch (error) {
    console.error("点赞操作失败:", error);
    ElMessage.error("操作失败");
  } finally {
    likeLoading.value = false;
  }
};

onMounted(() => {
  getPostDetail();
});
</script>

<style scoped>
/* 页面容器 + 统一背景图 */
.post-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 25px;
  min-height: 100vh;
  position: relative;

  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.post-detail::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  z-index: 0;
}

/* 卡片统一样式 */
.detail-card {
  position: relative;
  z-index: 10;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 25px;
  background: rgba(255, 255, 255, 0.94);
  margin-bottom: 25px;
}

/* 头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.student-id {
  font-size: 14px;
  color: #909399;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

/* 内容 */
.post-content {
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 20px 0;
  color: #333;
}

/* 图片区域 */
.post-images {
  margin: 20px 0;
}

.images-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.detail-image {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  cursor: pointer;
  object-fit: cover;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 32px;
  border-radius: 10px;
}

/* 点赞按钮 */
.post-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
