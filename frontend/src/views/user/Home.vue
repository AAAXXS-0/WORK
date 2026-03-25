<template>
  <div class="home-page">
    <el-card class="home-card">
      <div class="header">
        <h3>🏠 校园墙首页</h3>
        <el-button type="primary" @click="goPublish" round icon="Plus"
          >发布新帖子</el-button
        >
      </div>
      <el-divider></el-divider>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-autocomplete
          v-model="searchKeyword"
          :fetch-suggestions="querySearch"
          placeholder="搜索帖子内容、用户名、学号"
          @select="handleSelect"
          @keyup.enter="handleSearch"
          clearable
          style="width: 100%"
          class="search-input"
        >
          <template #suffix>
            <el-icon class="el-input__icon" @click="handleSearch">
              <Search />
            </el-icon>
          </template>
        </el-autocomplete>
      </div>
      <!-- 帖子列表 -->
      <div class="post-list" v-loading="loading">
        <div v-if="posts.length === 0 && !loading" class="empty">
          <el-empty description="暂无帖子"></el-empty>
        </div>
        <div v-else>
          <el-card
            v-for="post in posts"
            :key="post.id"
            class="post-card"
            shadow="hover"
            @click="goPostDetail(post.id)"
          >
            <div class="post-header">
              <div class="user-info">
                <el-avatar
                  :size="40"
                  :src="post.avatar ? backendUrl + post.avatar : ''"
                >
                  {{ post.username?.charAt(0) || "U" }}
                </el-avatar>
                <div class="user-details">
                  <div class="username">{{ post.username }}</div>
                  <div class="student-id">{{ post.studentId }}</div>
                </div>
              </div>
              <div class="post-time">{{ formatTime(post.createTime) }}</div>
            </div>
            <div class="post-content">{{ post.content }}</div>
            <div
              v-if="post.images && post.images.length > 0"
              class="post-images"
            >
              <el-image
                v-for="(img, index) in post.images.slice(0, 3)"
                :key="index"
                :src="backendUrl + img"
                :preview-src-list="post.images.map((i) => backendUrl + i)"
                :initial-index="index"
                fit="cover"
                class="post-image"
              />
            </div>
          </el-card>
          <!-- 分页 -->
          <div class="pagination" v-if="total > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import axios from "axios";
import { ElMessage } from "element-plus";

const router = useRouter();
const searchKeyword = ref("");
const posts = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchHistory = ref([]);
const backendUrl = "http://localhost:3000";

// 从localStorage加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      searchHistory.value = JSON.parse(history);
    }
  } catch (error) {
    console.error("加载搜索历史失败:", error);
  }
};

// 保存搜索历史到localStorage
const saveSearchHistory = (keyword) => {
  if (!keyword || !keyword.trim()) return;

  // 移除已存在的相同关键词
  const index = searchHistory.value.indexOf(keyword);
  if (index > -1) {
    searchHistory.value.splice(index, 1);
  }

  // 添加到开头
  searchHistory.value.unshift(keyword);

  // 最多保存10条
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10);
  }

  try {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory.value));
  } catch (error) {
    console.error("保存搜索历史失败:", error);
  }
};

// 搜索建议
const querySearch = (queryString, cb) => {
  const results = queryString
    ? searchHistory.value.filter((item) =>
        item.toLowerCase().includes(queryString.toLowerCase()),
      )
    : searchHistory.value;
  cb(results.map((item) => ({ value: item })));
};

// 选中搜索建议
const handleSelect = (item) => {
  searchKeyword.value = item.value;
  handleSearch();
};

// 执行搜索
const handleSearch = () => {
  currentPage.value = 1;
  saveSearchHistory(searchKeyword.value);
  fetchPosts();
};

// 获取帖子列表
const fetchPosts = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    };
    if (searchKeyword.value && searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim();
    }

    const response = await axios.get(
      "http://localhost:3000/api/post/list/published",
      { params },
    );
    if (response.data.code === 0) {
      posts.value = response.data.data.list;
      total.value = response.data.data.total;
    } else {
      ElMessage.error(response.data.message || "获取帖子列表失败");
    }
  } catch (error) {
    console.error("获取帖子列表失败:", error);
    ElMessage.error("获取帖子列表失败");
  } finally {
    loading.value = false;
  }
};

// 跳转到发布页面
const goPublish = () => {
  router.push("/publish");
};

// 跳转到帖子详情
const goPostDetail = (postId) => {
  router.push(`/post/${postId}`);
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

  return date.toLocaleDateString("zh-CN");
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchPosts();
};

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchPosts();
};

// 监听搜索关键词变化
watch(searchKeyword, (newVal) => {
  if (!newVal) {
    currentPage.value = 1;
    fetchPosts();
  }
});

onMounted(() => {
  loadSearchHistory();
  fetchPosts();
});
</script>

<style scoped>
/* 页面容器 + 全屏背景图 */
.home-page {
  padding: 25px;
  min-height: 100vh;
  position: relative;

  /* 你的本地统一背景图 */
  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 背景虚化层，不遮挡内容 */
.home-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(3px);
  z-index: 0;
}

/* 主卡片 */
.home-card {
  position: relative;
  z-index: 10;
  border-radius: 18px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 20px 25px;
  background: rgba(255, 255, 255, 0.94);
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header h3 {
  margin: 0;
  font-weight: 600;
  color: #333;
}

/* 搜索栏 */
.search-bar {
  margin: 20px 0;
}
.search-input {
  --el-input-border-radius: 8px;
}

/* 帖子列表 */
.post-list {
  margin-top: 20px;
}
.empty {
  text-align: center;
  padding: 50px 0;
}

/* 帖子卡片 */
.post-card {
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.25s ease;
}
.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

/* 帖子头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-details {
  display: flex;
  flex-direction: column;
}
.username {
  font-weight: 600;
  font-size: 14px;
}
.student-id {
  font-size: 12px;
  color: #909399;
}
.post-time {
  font-size: 12px;
  color: #909399;
}

/* 内容 */
.post-content {
  margin-bottom: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 图片 */
.post-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.post-image {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  cursor: pointer;
}

/* 分页 */
.pagination {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}
</style>
