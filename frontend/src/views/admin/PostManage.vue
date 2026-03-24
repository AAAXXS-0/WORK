<template>
  <div class="post-manage">
    <el-card class="post-card">
      <template #header>
        <div class="card-header">
          <span>📝 帖子管理</span>
        </div>
      </template>

      <div class="filter-bar">
        <el-select
          v-model="statusFilter"
          placeholder="选择状态"
          @change="getPostList"
          style="width: 150px; margin-right: 10px"
          clearable
        >
          <el-option label="已发布" :value="3" />
          <el-option label="已删除" :value="5" />
        </el-select>
        <el-button @click="getPostList" icon="Refresh" type="primary" round
          >刷新</el-button
        >
      </div>

      <el-table :data="postList" border class="post-table" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column
          prop="student_id"
          label="学号"
          width="120"
          align="center"
        />
        <el-table-column
          prop="username"
          label="用户名"
          width="120"
          align="center"
        />
        <el-table-column prop="content" label="内容" min-width="220">
          <template #default="scope">
            <div class="post-content">{{ scope.row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="200" align="center">
          <template #default="scope">
            <div
              v-if="scope.row.images && scope.row.images.length > 0"
              class="image-preview"
            >
              <el-image
                v-for="(img, index) in scope.row.images.slice(0, 3)"
                :key="index"
                :src="getImageUrl(img)"
                :preview-src-list="
                  scope.row.images.map((img) => getImageUrl(img))
                "
                fit="cover"
                style="
                  width: 50px;
                  height: 50px;
                  margin-right: 5px;
                  border-radius: 6px;
                "
                :preview-teleported="true"
              />
              <span
                v-if="scope.row.images.length > 3"
                style="font-size: 12px; color: #909399"
              >
                +{{ scope.row.images.length - 3 }}
              </span>
            </div>
            <el-tag v-else type="info" size="small">无图片</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="ai_result"
          label="AI审核结果"
          width="130"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getAiResultType(scope.row.ai_result)" size="small">
              {{ getAiResultText(scope.row.ai_result) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="reject_reason"
          label="驳回原因"
          width="160"
          show-overflow-tooltip
        />
        <el-table-column
          prop="create_time"
          label="创建时间"
          width="180"
          align="center"
        />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="scope">
            <el-button
              v-if="scope.row.status !== 5"
              size="small"
              type="danger"
              round
              @click="managePost(scope.row.id, 'delete')"
            >
              删除
            </el-button>
            <el-button
              v-if="scope.row.status === 5"
              size="small"
              type="success"
              round
              @click="managePost(scope.row.id, 'restore')"
            >
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getPostList"
        @current-change="getPostList"
        class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request";

const statusFilter = ref(3);
const postList = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 获取图片完整URL
const getImageUrl = (imgPath) => {
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
    return imgPath;
  }
  const serverUrl = "http://localhost:3000";
  return serverUrl + imgPath;
};

// 获取帖子列表
const getPostList = async () => {
  const res = await request.get("/admin/post/list", {
    params: {
      status: statusFilter.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    },
  });
  postList.value = res.data.list.map((post) => ({
    ...post,
    images: post.images ? JSON.parse(post.images) : [],
  }));
  total.value = res.data.total;
};

// 帖子管理（删除/恢复）
const managePost = async (id, action) => {
  const actionText = action === "delete" ? "删除" : "恢复";
  try {
    await ElMessageBox.confirm(`确认要${actionText}该帖子吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await request.post("/admin/post/manage", { id, action });
    ElMessage.success(`${actionText}成功`);
    getPostList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(`${actionText}失败`);
    }
  }
};

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    0: "info",
    1: "warning",
    2: "warning",
    3: "success",
    4: "danger",
    5: "danger",
  };
  return typeMap[status] || "info";
};

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    0: "草稿",
    1: "AI审核中",
    2: "待人工审核",
    3: "已发布",
    4: "已驳回",
    5: "已删除",
  };
  return textMap[status] || "未知";
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// AI审核结果
const getAiResultText = (aiResult) => {
  const resultNum = parseInt(aiResult) || 0;
  const resultMap = {
    1: "通过",
    2: "驳回",
    3: "合规",
    4: "违规",
    5: "不确定",
  };
  return resultMap[resultNum] || "未知";
};
const getAiResultType = (aiResult) => {
  const resultNum = parseInt(aiResult) || 0;
  if (resultNum === 1 || resultNum === 3) return "success";
  if (resultNum === 2 || resultNum === 4) return "danger";
  if (resultNum === 5) return "warning";
  return "info";
};

onMounted(() => {
  getPostList();
});
</script>

<style scoped>
/* 页面容器 + 背景图 */
.post-manage {
  padding: 25px;
  min-height: 100vh;
  position: relative;

  /* 你的本地背景图 */
  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 背景虚化层，不挡内容 */
.post-manage::before {
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

/* 卡片样式 */
.post-card {
  position: relative;
  z-index: 10;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 10px 20px 25px;
  background: rgba(255, 255, 255, 0.92);
}

/* 标题 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

/* 搜索栏 */
.filter-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

/* 表格 */
.post-table {
  --el-table-row-hover-bg-color: #f8f9ff;
  border-radius: 12px;
  overflow: hidden;
  --el-table-header-bg-color: #f5f7fa;
}

/* 内容省略 */
.post-content {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 图片预览 */
.image-preview {
  display: flex;
  align-items: center;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
