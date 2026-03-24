<template>
  <div class="audit-log">
    <el-card class="log-card">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="帖子ID">
          <el-input
            v-model="searchForm.postId"
            placeholder="输入帖子ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="审核类型">
          <el-select v-model="searchForm.type" placeholder="选择类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="AI审核" :value="1" />
            <el-option label="人工审核" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核结果">
          <el-select
            v-model="searchForm.result"
            placeholder="选择结果"
            clearable
          >
            <el-option label="全部" value="" />
            <el-option label="通过" :value="1" />
            <el-option label="驳回" :value="2" />
            <el-option label="合规" :value="3" />
            <el-option label="违规" :value="4" />
            <el-option label="不确定" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="getAuditLog" type="primary" icon="Search" round
            >查询</el-button
          >
          <el-button @click="resetSearch" icon="Refresh" round>重置</el-button>
          <el-button @click="exportLog" type="success" icon="Download" round
            >导出日志</el-button
          >
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="logList" border class="log-table" stripe>
        <el-table-column
          prop="post_id"
          label="帖子ID"
          width="100"
          align="center"
        />
        <el-table-column
          prop="type"
          label="审核类型"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="scope.row.type === 1 ? 'primary' : 'warning'">
              {{ getAuditTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="result"
          label="审核结果"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getResultTagType(scope.row.result)">
              {{ getAuditResultText(scope.row.result) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator_name" label="操作人" width="180" />
        <el-table-column prop="create_time" label="审核时间" width="190" />
        <el-table-column
          prop="content"
          label="帖子内容"
          min-width="300"
          show-overflow-tooltip
        />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="pagination"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import auditApi from "@/api/audit";
import { ElMessage } from "element-plus";

// 审核类型映射
const AUDIT_TYPE_MAP = {
  1: "AI审核",
  2: "人工审核",
};

// 审核结果映射
const AUDIT_RESULT_MAP = {
  1: "通过",
  2: "驳回",
  3: "合规",
  4: "违规",
  5: "不确定",
};

// 结果标签颜色
const getResultTagType = (result) => {
  if (result === 1 || result === 3) return "success";
  if (result === 2 || result === 4) return "danger";
  return "info";
};

const searchForm = ref({
  postId: "",
  type: "",
  result: "",
});
const logList = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 获取审核类型文本
const getAuditTypeText = (type) => {
  return AUDIT_TYPE_MAP[type] || "未知";
};

// 获取审核结果文本
const getAuditResultText = (result) => {
  return AUDIT_RESULT_MAP[result] || "未知";
};

// 获取审核日志
const getAuditLog = async () => {
  try {
    const params = {
      ...searchForm.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    };
    const res = await auditApi.getAuditLog(params);
    logList.value = res.data.list;
    total.value = res.data.total;
  } catch (e) {
    ElMessage.error("获取日志失败");
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    postId: "",
    type: "",
    result: "",
  };
  pageNum.value = 1;
  getAuditLog();
};

// 导出日志
const exportLog = async () => {
  try {
    const res = await auditApi.exportAuditLog();
    const blob = new Blob([res.data]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `审核日志_${new Date().toLocaleDateString()}.xlsx`;
    a.click();
    ElMessage.success("导出成功");
  } catch (e) {
    ElMessage.error("导出失败");
  }
};

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val;
  getAuditLog();
};
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getAuditLog();
};

onMounted(() => {
  getAuditLog();
});
</script>

<style scoped>
/* 页面 + 背景图 */
.audit-log {
  padding: 25px;
  min-height: 100vh;
  position: relative;

  /* 本地背景图（和你之前保持一致） */
  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 背景虚化层，不挡内容 */
.audit-log::before {
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

/* 卡片容器 */
.log-card {
  position: relative;
  z-index: 10;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 25px;
  background: rgba(255, 255, 255, 0.92);
}

/* 搜索表单 */
.search-form {
  margin-bottom: 25px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

/* 表格美化 */
.log-table {
  --el-table-row-hover-bg-color: #f8f9ff;
  border-radius: 12px;
  overflow: hidden;
  --el-table-header-text-color: #333;
  --el-table-header-bg-color: #f5f7fa;
}

/* 分页居中 */
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
