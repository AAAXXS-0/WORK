<template>
  <div class="post-manage">
<<<<<<< HEAD
    <el-card>
      <template #header>
        <div class="card-header">
          <span>帖子管理</span>
=======
    <el-card class="post-card">
      <template #header>
        <div class="card-header">
          <span>📝 帖子管理</span>
>>>>>>> zhe-chen
        </div>
      </template>

      <div class="filter-bar">
        <el-select
          v-model="statusFilter"
          placeholder="选择状态"
          @change="getPostList"
<<<<<<< HEAD
          style="width: 150px; margin-right: 10px;"
=======
          style="width: 150px; margin-right: 10px"
          clearable
>>>>>>> zhe-chen
        >
          <el-option label="已发布" :value="3" />
          <el-option label="已删除" :value="5" />
        </el-select>
<<<<<<< HEAD
        <el-button @click="getPostList">刷新</el-button>
      </div>

      <el-table :data="postList" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="student_id" label="学号" width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="content" label="内容" min-width="200">
=======
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
>>>>>>> zhe-chen
          <template #default="scope">
            <div class="post-content">{{ scope.row.content }}</div>
          </template>
        </el-table-column>
<<<<<<< HEAD
        <el-table-column label="图片" width="200">
          <template #default="scope">
            <div v-if="scope.row.images && scope.row.images.length > 0" class="image-preview">
=======
        <el-table-column label="图片" width="200" align="center">
          <template #default="scope">
            <div
              v-if="scope.row.images && scope.row.images.length > 0"
              class="image-preview"
            >
>>>>>>> zhe-chen
              <el-image
                v-for="(img, index) in scope.row.images.slice(0, 3)"
                :key="index"
                :src="getImageUrl(img)"
<<<<<<< HEAD
                :preview-src-list="scope.row.images.map(img => getImageUrl(img))"
                :initial-index="index"
                fit="cover"
                style="width: 50px; height: 50px; margin-right: 5px; border-radius: 4px;"
                :preview-teleported="true"
              />
              <span v-if="scope.row.images.length > 3" style="font-size: 12px; color: #909399;">
                +{{ scope.row.images.length - 3 }}
              </span>
            </div>
            <el-tag v-else type="info">无图片</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
=======
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
>>>>>>> zhe-chen
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
<<<<<<< HEAD
        <el-table-column prop="ai_result" label="AI审核结果" width="120">
          <template #default="scope">
            <el-tag :type="getAiResultType(scope.row.ai_result)">
=======
        <el-table-column
          prop="ai_result"
          label="AI审核结果"
          width="130"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getAiResultType(scope.row.ai_result)" size="small">
>>>>>>> zhe-chen
              {{ getAiResultText(scope.row.ai_result) }}
            </el-tag>
          </template>
        </el-table-column>
<<<<<<< HEAD
        <el-table-column prop="reject_reason" label="驳回原因" width="150" />
        <el-table-column prop="create_time" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
=======
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
>>>>>>> zhe-chen
          <template #default="scope">
            <el-button
              v-if="scope.row.status !== 5"
              size="small"
              type="danger"
<<<<<<< HEAD
=======
              round
>>>>>>> zhe-chen
              @click="managePost(scope.row.id, 'delete')"
            >
              删除
            </el-button>
            <el-button
              v-if="scope.row.status === 5"
              size="small"
              type="success"
<<<<<<< HEAD
=======
              round
>>>>>>> zhe-chen
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
<<<<<<< HEAD
        style="margin-top: 20px; justify-content: flex-end;"
=======
        class="pagination"
>>>>>>> zhe-chen
      />
    </el-card>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const statusFilter = ref(3)
const postList = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取图片完整URL
const getImageUrl = (imgPath) => {
  console.log('PostManage.getImageUrl 输入:', imgPath)
  // 如果已经是完整URL，直接返回
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
    console.log('返回完整URL:', imgPath)
    return imgPath
  }
  // 如果是相对路径，添加后端服务器地址
  const serverUrl = 'http://localhost:3000'
  const fullUrl = serverUrl + imgPath
  console.log('生成的完整URL:', fullUrl)
  return fullUrl
}

// 获取帖子列表
const getPostList = async () => {
  const res = await request.get('/admin/post/list', {
    params: {
      status: statusFilter.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
  })
  postList.value = res.data.list.map(post => ({
    ...post,
    images: post.images ? JSON.parse(post.images) : []
  }))
  total.value = res.data.total
}

// 帖子管理（删除/恢复）
const managePost = async (id, action) => {
  const actionText = action === 'delete' ? '删除' : '恢复'
  try {
    await ElMessageBox.confirm(
      `确认要${actionText}该帖子吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await request.post('/admin/post/manage', { id, action })
    ElMessage.success(`${actionText}成功`)
    getPostList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${actionText}失败`)
    }
  }
}
=======
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
>>>>>>> zhe-chen

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
<<<<<<< HEAD
    0: 'info',
    1: 'warning',
    2: 'warning',
    3: 'success',
    4: 'danger',
    5: 'danger'
  }
  return typeMap[status] || 'info'
}
=======
    0: "info",
    1: "warning",
    2: "warning",
    3: "success",
    4: "danger",
    5: "danger",
  };
  return typeMap[status] || "info";
};
>>>>>>> zhe-chen

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
<<<<<<< HEAD
    0: '草稿',
    1: 'AI审核中',
    2: '待人工审核',
    3: '已发布',
    4: '已驳回',
    5: '已删除'
  }
  return textMap[status] || '未知'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 将AI审核结果数字转换为文本
const getAiResultText = (aiResult) => {
  // 将字符串转换为数字
  const resultNum = parseInt(aiResult) || 0
  const resultMap = {
    1: '通过',
    2: '驳回',
    3: '合规',
    4: '违规',
    5: '不确定'
  }
  return resultMap[resultNum] || '未知'
}

// 获取AI审核结果的标签类型
const getAiResultType = (aiResult) => {
  // 将字符串转换为数字
  const resultNum = parseInt(aiResult) || 0
  // 1=通过, 3=合规 -> success
  // 2=驳回, 4=违规 -> danger
  // 5=不确定 -> warning
  let type = 'info'
  if (resultNum === 1 || resultNum === 3) {
    type = 'success'
  } else if (resultNum === 2 || resultNum === 4) {
    type = 'danger'
  } else if (resultNum === 5) {
    type = 'warning'
  }
  return type
}

onMounted(() => {
  getPostList()
})
</script>

<style scoped>
.post-manage {
  padding: 20px;
}

=======
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
>>>>>>> zhe-chen
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
<<<<<<< HEAD
}

=======
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

/* 搜索栏 */
>>>>>>> zhe-chen
.filter-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

<<<<<<< HEAD
=======
/* 表格 */
.post-table {
  --el-table-row-hover-bg-color: #f8f9ff;
  border-radius: 12px;
  overflow: hidden;
  --el-table-header-bg-color: #f5f7fa;
}

/* 内容省略 */
>>>>>>> zhe-chen
.post-content {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
<<<<<<< HEAD
=======

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
>>>>>>> zhe-chen
</style>
