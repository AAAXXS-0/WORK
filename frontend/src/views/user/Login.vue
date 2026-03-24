<template>
    <div class="login-container">
      <el-card class="login-card">
        <h2 style="text-align: center; margin-bottom: 20px">校园墙登录</h2>
        <el-form :model="loginForm" label-width="80px">
          <el-form-item label="学号">
            <el-input v-model="loginForm.studentId"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="loginForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="login" style="width: 100%">登录</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="text" @click="goRegister" style="width: 100%">学生第一次进入注册</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
import request from '../../utils/request'
import auth from '../../utils/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginForm = ref({
  studentId: '1', // 默认测试学号
  password: '1'    // 默认测试密码
})

const login = async () => {
  if (!loginForm.value.studentId || !loginForm.value.password) {
    ElMessage.warning('请输入学号和密码')
    return
  }
  
  try {
    const res = await request.post('/auth/login', {
      studentId: loginForm.value.studentId,
      password: loginForm.value.password
    })
    
    if (res.code === 0) {
      auth.setToken(res.data.token)
      // 保存用户信息（包含角色）
      if (res.data.user) {
        auth.setUser(res.data.user)
        localStorage.setItem('user-role', res.data.user.role === 1 ? 'admin' : 'user')
      }
      ElMessage.success('登录成功')
      // 根据角色跳转到不同页面
      if (res.data.user && res.data.user.role === 1) {
        router.push('/admin/dashboard')
      } else {
        router.push('/home')
      }
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.response?.data?.msg || '登录失败，请稍后重试')
  }
}

const goRegister = () => {
  router.push('/register')
}
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
  }
  .login-card {
    width: 400px;
    padding: 20px;
  }
  </style>
