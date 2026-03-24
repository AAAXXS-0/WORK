<template>
  <div class="audit-log">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="帖子ID">
        <el-input v-model="searchForm.postId" placeholder="输入帖子ID" />
      </el-form-item>
      <el-form-item label="审核类型">
        <el-select v-model="searchForm.type" placeholder="选择类型">
          <el-option label="全部" value="" />
          <el-option label="AI审核" :value="1" />
          <el-option label="人工审核" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核结果">
        <el-select v-model="searchForm.result" placeholder="选择结果">
          <el-option label="全部" value="" />
          <el-option label="通过" :value="1" />
          <el-option label="驳回" :value="2" />
          <el-option label="合规" :value="3" />
          <el-option label="违规" :value="4" />
          <el-option label="不确定" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getAuditLog">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button @click="exportLog" type="primary">导出日志</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="logList" border>
      <el-table-column prop="post_id" label="帖子ID" width="100" />
      <el-table-column prop="type" label="审核类型" width="120">
        <template #default="scope">
          {{ getAuditTypeText(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column prop="result" label="审核结果" width="120">
        <template #default="scope">
          {{ getAuditResultText(scope.row.result) }}
        </template>
      </el-table-column>
      <el-table-column prop="operator_name" label="操作人" width="150">
        <template #default="scope">
          <span v-if="scope.row.operator_id === 0">系统/AI</span>
          <span v-else-if="scope.row.operator_name">{{ scope.row.operator_name }} ({{ scope.row.operator_student_id }})</span>
          <span v-else>未知</span>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="审核时间" width="180" />
      <el-table-column prop="content" label="帖子内容" min-width="300" show-overflow-tooltip />
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageNum"
      :page-sizes="[10, 20, 50]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px; text-align: right;"
    >
    </el-pagination>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import auditApi from '@/api/audit'

// 审核类型映射
const AUDIT_TYPE_MAP = {
  1: 'AI审核',
  2: '人工审核'
}

// 审核结果映射
const AUDIT_RESULT_MAP = {
  1: '通过',
  2: '驳回',
  3: '合规',
  4: '违规',
  5: '不确定'
}

const searchForm = ref({
  postId: '',
  type: '',
  result: ''
})
const logList = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取审核类型文本
const getAuditTypeText = (type) => {
  return AUDIT_TYPE_MAP[type] || '未知'
}

// 获取审核结果文本
const getAuditResultText = (result) => {
  return AUDIT_RESULT_MAP[result] || '未知'
}

// 获取审核日志
const getAuditLog = async () => {
  const params = {
    ...searchForm.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }
  const res = await auditApi.getAuditLog(params)
  logList.value = res.data.list
  total.value = res.data.total
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    postId: '',
    type: '',
    result: ''
  }
  pageNum.value = 1
  getAuditLog()
}

// 导出日志
const exportLog = async () => {
  const res = await auditApi.exportAuditLog()
  // 下载文件
  const blob = new Blob([res.data])
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `审核日志_${new Date().toLocaleDateString()}.xlsx`
  a.click()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  getAuditLog()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val
  getAuditLog()
}

onMounted(() => {
  getAuditLog()
})
</script>

<style scoped>
.audit-log { padding: 20px; }
.search-form { margin-bottom: 20px; }
</style>