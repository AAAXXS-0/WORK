<template>
    <div class="user-layout">
      <!-- 顶部导航 -->
      <el-header>
        <el-menu :default-active="$route.path" mode="horizontal">
          <el-menu-item index="/home" @click="router.push('/home')">首页</el-menu-item>
          <el-menu-item index="/publish" @click="router.push('/publish')">发布帖子</el-menu-item>
          <el-menu-item index="/profile" @click="router.push('/profile')">我的</el-menu-item>
          <el-menu-item index="/login" v-if="!isLogin" @click="router.push('/login')">登录</el-menu-item>
          <el-menu-item @click="logout" v-else>退出登录</el-menu-item>
        </el-menu>
      </el-header>
      
      <!-- 主体内容 -->
      <el-main>
        <router-view />
      </el-main>
      
      <!-- 底部 -->
      <el-footer style="text-align: center;">校园墙 ©2026</el-footer>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import auth from '@/utils/auth'
  import authApi from '@/api/auth'
  
  const router = useRouter()
  const isLogin = auth.isLogin()
  
  // 退出登录
  const logout = async () => {
    await authApi.logout()
    auth.clearToken()
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .user-layout { height: 100vh; display: flex; flex-direction: column; }
  .el-header { background-color: #fff; border-bottom: 1px solid #eee; }
  .el-main { flex: 1; padding: 20px; }
  .el-footer { padding: 10px; font-size: 12px; color: #999; }
  </style>