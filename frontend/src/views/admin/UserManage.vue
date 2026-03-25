<template>
<<<<<<< HEAD
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
=======
  <div class="user-manage">
    <el-card class="user-card">
      <template #header>
        <div class="card-header">
          <span>👥 用户管理</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKey"
          placeholder="搜索学号/用户名"
          @keyup.enter="getUserList"
          clearable
          style="width: 280px"
        />
        <el-button @click="getUserList" type="primary" icon="Search" round
          >查询</el-button
        >
      </div>

      <!-- 用户表格 -->
      <el-table :data="userList" border class="user-table" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column
          prop="studentId"
          label="学号"
          width="160"
          align="center"
        />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.status === 1 ? "正常" : "封禁" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="scope">
            <el-button
              v-if="!scope.row.role || scope.row.role !== 1"
              size="small"
              round
              @click="
                changeStatus(scope.row.id, scope.row.status === 1 ? 0 : 1)
              "
              :type="scope.row.status === 1 ? 'danger' : 'success'"
            >
              {{ scope.row.status === 1 ? "封禁" : "解封" }}
            </el-button>
            <el-tag v-else type="info" size="small">管理员</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import adminApi from "@/api/admin";

const searchKey = ref("");
const userList = ref([]);
>>>>>>> zhe-chen

// 获取用户列表
const getUserList = async () => {
  try {
<<<<<<< HEAD
    const res = await adminApi.getUserList({ key: searchKey.value })
    // 将下划线命名转换为驼峰命名
    userList.value = (res.data.list || []).map(item => ({
=======
    const res = await adminApi.getUserList({ key: searchKey.value });
    userList.value = (res.data.list || []).map((item) => ({
>>>>>>> zhe-chen
      id: item.id,
      studentId: item.student_id,
      username: item.username,
      status: item.status,
<<<<<<< HEAD
      role: item.role
    }))
  } catch (err) {
    ElMessage.error('获取用户列表失败：' + (err.msg || err.message))
  }
}
=======
      role: item.role,
    }));
  } catch (err) {
    ElMessage.error("获取用户列表失败：" + (err.msg || err.message));
  }
};
>>>>>>> zhe-chen

// 改变用户状态（封禁/解封）
const changeStatus = async (id, status) => {
  try {
<<<<<<< HEAD
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
=======
    await adminApi.userManage({ id, status });
    ElMessage.success(status === 1 ? "解封成功" : "封禁成功");
    getUserList();
  } catch (err) {
    ElMessage.error("操作失败：" + (err.msg || err.message));
  }
};

onMounted(() => {
  getUserList();
});
</script>

<style scoped>
/* 页面 + 背景图 */
.user-manage {
  padding: 25px;
  min-height: 100vh;
  position: relative;

  /* 本地背景图（和你所有页面保持统一） */
  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 背景虚化层，不挡内容 */
.user-manage::before {
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
.user-card {
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
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

/* 搜索栏 */
.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 表格美化 */
.user-table {
  --el-table-row-hover-bg-color: #f8f9ff;
  border-radius: 12px;
  overflow: hidden;
  --el-table-header-bg-color: #f5f7fa;
}
</style>
>>>>>>> zhe-chen
