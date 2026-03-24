<template>
    <div class="user-manage">
      <el-input v-model="searchKey" placeholder="搜索学号/用户名" @keyup.enter="getUserList" />
      <el-button @click="getUserList">查询</el-button>
  
      <el-table :data="userList" border>
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="studentId" label="学号" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button 
              v-if="!scope.row.role || scope.row.role !== 1"
              size="small" 
              @click="changeStatus(scope.row.id, scope.row.status === 1 ? 0 : 1)"
              :type="scope.row.status === 1 ? 'danger' : 'success'"
            >
              {{ scope.row.status === 1 ? '封禁' : '解封' }}
            </el-button>
            <span v-else class="admin-tag">管理员</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import adminApi from '@/api/admin'

const searchKey = ref('')
const userList = ref([])

// 获取用户列表
const getUserList = async () => {
  try {
    const res = await adminApi.getUserList({ key: searchKey.value })
    // 将下划线命名转换为驼峰命名
    userList.value = (res.data.list || []).map(item => ({
      id: item.id,
      studentId: item.student_id,
      username: item.username,
      status: item.status,
      role: item.role
    }))
  } catch (err) {
    ElMessage.error('获取用户列表失败：' + (err.msg || err.message))
  }
}

// 改变用户状态（封禁/解封）
const changeStatus = async (id, status) => {
  try {
    await adminApi.userManage({ id, status })
    ElMessage.success(status === 1 ? '解封成功' : '封禁成功')
    getUserList()
  } catch (err) {
    ElMessage.error('操作失败：' + (err.msg || err.message))
  }
}

onMounted(() => {
  getUserList()
})
</script>
  
  <style scoped>
.user-manage { padding: 20px; }
.admin-tag {
  color: #909399;
  font-size: 12px;
}
</style>