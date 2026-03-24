<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-logo">校园墙管理系统</div>
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
        background-color="#2f4050"
        text-color="#fff"
        active-text-color="#1ab394"
      >
        <el-menu-item index="/admin/dashboard">
          <i class="el-icon-menu"></i>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/audit">
          <i class="el-icon-view"></i>
          <span>人工审核</span>
        </el-menu-item>
        <el-menu-item index="/admin/log">
          <i class="el-icon-document"></i>
          <span>审核日志</span>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <i class="el-icon-user"></i>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/roster">
          <i class="el-icon-user-solid"></i>
          <span>学生花名册</span>
        </el-menu-item>
        <el-menu-item index="/admin/post">
          <i class="el-icon-s-order"></i>
          <span>帖子管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/comment">
          <i class="el-icon-chat-dot-round"></i>
          <span>评论管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/config">
          <i class="el-icon-setting"></i>
          <span>系统配置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主体内容 -->
    <el-container class="main-container">
      <el-header class="header-bar">
        <span class="header-title">校园墙管理后台</span>
        <el-button type="primary" size="small" @click="handleLogout" round>
          <i class="el-icon-switch-button"></i>
          退出登录
        </el-button>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import auth from "@/utils/auth";

const router = useRouter();

// 权限校验
if (!auth.hasPermission(["admin", "super_admin"])) {
  router.push("/login");
}

// 退出登录
const handleLogout = () => {
  auth.clearToken();
  ElMessage.success("退出登录成功");
  router.push("/login");
};
</script>

<style scoped>
/* 整体布局 */
.admin-layout {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  background-color: #2f4050;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 99;
}

/* 侧边栏LOGO */
.sidebar-logo {
  height: 65px;
  line-height: 65px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 菜单样式 */
.sidebar-menu {
  border-right: none;
  flex: 1;
  overflow: auto;
}

:deep(.el-menu-item) {
  height: 46px !important;
  line-height: 46px !important;
  border-radius: 4px;
  margin: 2px 10px;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(26, 179, 148, 0.2) !important;
  font-weight: 500;
}

/* 顶部导航栏 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  height: 65px;
  padding: 0 25px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 10;
}

/* 顶部标题 */
.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

/* 主体内容区域 */
.main-content {
  background-color: #f5f7fa;
  padding: 0;
  overflow: auto;
}

.main-container {
  height: 100vh;
}
</style>
