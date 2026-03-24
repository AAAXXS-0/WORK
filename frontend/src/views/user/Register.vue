<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 style="text-align: center; margin-bottom: 20px">学生注册</h2>
      
      <!-- 步骤一：验证学号和验证码 -->
      <el-form v-if="step === 1" :model="verifyForm" label-width="80px">
        <el-form-item label="学号">
          <el-input v-model="verifyForm.studentId" placeholder="请输入学号"></el-input>
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="verifyForm.verifyCode" placeholder="请输入统一验证码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="verifyStudent" style="width: 100%">验证</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="goLogin" style="width: 100%">返回登录</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 步骤二：设置密码 -->
      <el-form v-if="step === 2" :model="registerForm" label-width="80px">
        <el-form-item label="学号">
          <el-input v-model="registerForm.studentId" disabled></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="registerForm.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入新密码（至少6位）"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="register" style="width: 100%">完成注册</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="goBack" style="width: 100%">返回上一步</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '../../utils/request'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const step = ref(1)

const verifyForm = ref({
  studentId: '',
  verifyCode: ''
})

const registerForm = ref({
  studentId: '',
  name: '',
  verifyCode: '',
  password: '',
  confirmPassword: ''
})

// 验证学号和验证码
const verifyStudent = async () => {
  if (!verifyForm.value.studentId) {
    ElMessage.warning('请输入学号')
    return
  }
  if (!verifyForm.value.verifyCode) {
    ElMessage.warning('请输入验证码')
    return
  }
  
  try {
    const res = await request.post('/auth/verify', verifyForm.value)
    ElMessage.success('验证成功')
    
    // 进入第二步，填充信息
    registerForm.value.studentId = verifyForm.value.studentId
    registerForm.value.name = res.data.name
    registerForm.value.verifyCode = verifyForm.value.verifyCode
    step.value = 2
  } catch (err) {
    const errMsg = err?.msg || err?.response?.data?.msg || '验证失败'
    ElMessage.error(errMsg)
  }
}

// 完成注册
const register = async () => {
  if (!registerForm.value.password) {
    ElMessage.warning('请输入密码')
    return
  }
  if (registerForm.value.password.length < 6) {
    ElMessage.warning('密码长度不能少于6位')
    return
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.warning('两次密码输入不一致')
    return
  }
  
  try {
    await request.post('/auth/register', registerForm.value)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    const errMsg = err?.msg || err?.response?.data?.msg || '注册失败'
    ElMessage.error(errMsg)
  }
}

// 返回登录
const goLogin = () => {
  router.push('/login')
}

// 返回上一步
const goBack = () => {
  step.value = 1
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}
.register-card {
  width: 400px;
  padding: 20px;
}
</style>