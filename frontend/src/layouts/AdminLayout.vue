<template>
    <div class="admin-layout">
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <el-menu :default-active="$route.path" router>
          <el-menu-item index="/admin/dashboard">仪表盘</el-menu-item>
          <el-menu-item index="/admin/audit">人工审核</el-menu-item>
          <el-menu-item index="/admin/log">审核日志</el-menu-item>
          <el-menu-item index="/admin/user">用户管理</el-menu-item>
          <el-menu-item index="/admin/roster">学生花名册</el-menu-item>
          <el-menu-item index="/admin/post">帖子管理</el-menu-item>
          <el-menu-item index="/admin/comment">评论管理</el-menu-item>
          <el-menu-item index="/admin/config">系统配置</el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主体内容 -->
      <el-container>
        <el-header>
          <span class="header-title">校园墙管理后台</span>
          <el-button type="primary" size="small" @click="handleLogout">退出登录</el-button>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import auth from '@/utils/auth'
  
  const router = useRouter()
  
  // 权限校验
  if (!auth.hasPermission(['admin', 'super_admin'])) {
    router.push('/login')
  }
  
  // 退出登录
const handleLogout = () => {
  auth.clearToken()
  ElMessage.success('退出登录成功')
  router.push('/login')
}
  </script>
  
  <style scoped>
  .admin-layout { height: 100vh; display: flex; }
  .el-aside { background-color: #f5f5f5; }
  .el-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    font-size: 12px; 
    line-height: 60px; 
    border-bottom: 1px solid #eee; 
    padding: 0 20px;
  }
  .header-title { font-size: 16px; font-weight: bold; }
  .el-main { padding: 20px; }
  </style>