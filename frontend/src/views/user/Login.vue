<template>
<<<<<<< HEAD
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
=======
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">校园墙登录</h2>
      <el-form :model="loginForm" label-width="40px">
        <el-form-item label="学号">
          <el-input
            v-model="loginForm.studentId"
            placeholder="请输入学号"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" style="width: 100%" round
            >登录</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="goRegister" style="width: 100%"
            >学生第一次进入注册</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import request from "../../utils/request";
import auth from "../../utils/auth";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();
const loginForm = ref({
  studentId: "1",
  password: "1",
});

const login = async () => {
  if (!loginForm.value.studentId || !loginForm.value.password) {
    ElMessage.warning("请输入学号和密码");
    return;
  }

  try {
    const res = await request.post("/auth/login", {
      studentId: loginForm.value.studentId,
      password: loginForm.value.password,
    });

    if (res.code === 0) {
      auth.setToken(res.data.token);
      if (res.data.user) {
        auth.setUser(res.data.user);
        localStorage.setItem(
          "user-role",
          res.data.user.role === 1 ? "admin" : "user",
        );
      }
      ElMessage.success("登录成功");
      if (res.data.user && res.data.user.role === 1) {
        router.push("/admin/dashboard");
      } else {
        router.push("/home");
      }
    } else {
      ElMessage.error(res.msg || "登录失败");
    }
  } catch (error) {
    console.error("登录失败:", error);
    ElMessage.error(error.response?.data?.msg || "登录失败，请稍后重试");
  }
};

const goRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
/* 登录页面容器 + 统一背景图 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;

  /* 统一使用你本地的背景图 */
  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 背景柔和虚化层 */
.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(4px);
  z-index: 0;
}

/* 登录卡片：高级统一风格 */
.login-card {
  width: 420px;
  padding: 40px 30px;
  position: relative;
  z-index: 10;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: none;
  background: rgba(255, 255, 255, 0.95);
}

/* 标题 */
.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

/* 输入框样式统一 */
:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 按钮统一圆角 */
:deep(.el-button) {
  border-radius: 10px;
}

/* 表单居中 */
:deep(.el-form) {
  text-align: center;
}
</style>
>>>>>>> zhe-chen
