<template>
  <div class="register-container">
    <el-card class="register-card">
<<<<<<< HEAD
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
=======
      <h2 class="register-title">学生注册</h2>

      <!-- 步骤一：验证学号和验证码 -->
      <el-form v-if="step === 1" :model="verifyForm" label-width="40px">
        <el-form-item label="学号">
          <el-input
            v-model="verifyForm.studentId"
            placeholder="请输入学号"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="验证码">
          <el-input
            v-model="verifyForm.verifyCode"
            placeholder="请输入统一验证码"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="verifyStudent"
            style="width: 100%"
            round
            >验证</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="goLogin" style="width: 100%"
            >返回登录</el-button
          >
        </el-form-item>
      </el-form>

      <!-- 步骤二：设置密码 -->
      <el-form v-if="step === 2" :model="registerForm" label-width="40px">
>>>>>>> zhe-chen
        <el-form-item label="学号">
          <el-input v-model="registerForm.studentId" disabled></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="registerForm.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="新密码">
<<<<<<< HEAD
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
=======
          <el-input
            v-model="registerForm.password"
            type="password"
            show-password
            placeholder="请输入新密码（至少6位）"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="register" style="width: 100%" round
            >完成注册</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="goBack" style="width: 100%"
            >返回上一步</el-button
          >
>>>>>>> zhe-chen
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
<<<<<<< HEAD
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
=======
import { ref } from "vue";
import request from "../../utils/request";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();
const step = ref(1);

const verifyForm = ref({
  studentId: "",
  verifyCode: "",
});

const registerForm = ref({
  studentId: "",
  name: "",
  verifyCode: "",
  password: "",
  confirmPassword: "",
});
>>>>>>> zhe-chen

// 验证学号和验证码
const verifyStudent = async () => {
  if (!verifyForm.value.studentId) {
<<<<<<< HEAD
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
=======
    ElMessage.warning("请输入学号");
    return;
  }
  if (!verifyForm.value.verifyCode) {
    ElMessage.warning("请输入验证码");
    return;
  }

  try {
    const res = await request.post("/auth/verify", verifyForm.value);
    ElMessage.success("验证成功");

    // 进入第二步，填充信息
    registerForm.value.studentId = verifyForm.value.studentId;
    registerForm.value.name = res.data.name;
    registerForm.value.verifyCode = verifyForm.value.verifyCode;
    step.value = 2;
  } catch (err) {
    const errMsg = err?.msg || err?.response?.data?.msg || "验证失败";
    ElMessage.error(errMsg);
  }
};
>>>>>>> zhe-chen

// 完成注册
const register = async () => {
  if (!registerForm.value.password) {
<<<<<<< HEAD
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
=======
    ElMessage.warning("请输入密码");
    return;
  }
  if (registerForm.value.password.length < 6) {
    ElMessage.warning("密码长度不能少于6位");
    return;
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.warning("两次密码输入不一致");
    return;
  }

  try {
    await request.post("/auth/register", registerForm.value);
    ElMessage.success("注册成功，请登录");
    router.push("/login");
  } catch (err) {
    const errMsg = err?.msg || err?.response?.data?.msg || "注册失败";
    ElMessage.error(errMsg);
  }
};

// 返回登录
const goLogin = () => {
  router.push("/login");
};

// 返回上一步
const goBack = () => {
  step.value = 1;
};
</script>

<style scoped>
/* 注册页面容器 + 统一背景图 */
>>>>>>> zhe-chen
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
<<<<<<< HEAD
  background-color: #f5f5f5;
}
.register-card {
  width: 400px;
  padding: 20px;
}
</style>
=======
  position: relative;

  /* 统一使用本地背景图 */
  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 背景柔和虚化层 */
.register-container::before {
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

/* 注册卡片：紧凑版 */
.register-card {
  width: 420px;
  padding: 25px 30px;
  position: relative;
  z-index: 10;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: none;
  background: rgba(255, 255, 255, 0.95);

  /* 让内容垂直居中 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 280px;
}

/* 标题样式 */
.register-title {
  text-align: center;
  margin-bottom: 18px;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

/* 输入框美化 */
:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 按钮统一圆角 */
:deep(.el-button) {
  border-radius: 10px;
}

/* 表单项间距紧凑 */
:deep(.el-form-item) {
  margin-bottom: 15px;
}

/* ✅ 修复密码框标签不对齐 */
:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}
</style>
>>>>>>> zhe-chen
