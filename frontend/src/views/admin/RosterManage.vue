<template>
  <div class="roster-manage">
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <span>导入学生花名册</span>
        </div>
      </template>
      <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :show-file-list="false"
        accept=".xlsx,.xls"
      >
        <el-button type="primary">选择Excel文件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/xls 文件，且必须包含"姓名"、"学号"、"统一验证码"三列
          </div>
        </template>
      </el-upload>
    </el-card>

    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>学生花名册列表</span>
        </div>
      </template>
      
      <div class="search-bar">
        <el-input
          v-model="searchKey"
          placeholder="搜索学号/姓名"
          @keyup.enter="getRosterList"
          style="width: 200px; margin-right: 10px;"
        />
        <el-button @click="getRosterList">查询</el-button>
      </div>

      <el-table :data="rosterList" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="student_id" label="学号" width="150" />
        <el-table-column prop="verify_code" label="统一验证码" width="150" />
        <el-table-column prop="is_registered" label="注册状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_registered === 1 ? 'success' : 'info'">
              {{ scope.row.is_registered === 1 ? '已注册' : '未注册' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getRosterList"
        @current-change="getRosterList"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import auth from '@/utils/auth'

const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/admin/roster/import'
const uploadHeaders = {
  Authorization: 'Bearer ' + auth.getToken()
}

const searchKey = ref('')
const rosterList = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 上传前校验
const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件！')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过5MB！')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.code === 0) {
    ElMessage.success(`导入成功，共导入${response.data.count}条记录`)
    getRosterList()
  } else {
    ElMessage.error(response.msg || '导入失败')
  }
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('上传失败，请重试')
}

// 获取花名册列表
const getRosterList = async () => {
  const res = await request.get('/admin/roster/list', {
    params: {
      key: searchKey.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
  })
  rosterList.value = res.data.list
  total.value = res.data.total
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

onMounted(() => {
  getRosterList()
})
</script>

<style scoped>
.roster-manage {
  padding: 20px;
}

.upload-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-card {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.el-upload__tip {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}
</style>
