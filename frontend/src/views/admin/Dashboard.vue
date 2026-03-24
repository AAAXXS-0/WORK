<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-header">待审核帖子</div>
          <div class="card-value blue">{{ waitAuditCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-header">今日发帖数</div>
          <div class="card-value green">{{ todayPostCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-header">AI驳回数</div>
          <div class="card-value orange">{{ aiRejectCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-header">活跃用户数</div>
          <div class="card-value purple">{{ activeUserCount }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import adminApi from "@/api/admin";

const waitAuditCount = ref(0);
const todayPostCount = ref(0);
const aiRejectCount = ref(0);
const activeUserCount = ref(0);

// 获取仪表盘数据
const getDashboardData = async () => {
  const res = await adminApi.getDashboardData();
  waitAuditCount.value = res.data.waitAuditCount;
  todayPostCount.value = res.data.todayPostCount;
  aiRejectCount.value = res.data.aiRejectCount;
  activeUserCount.value = res.data.activeUserCount;
};

onMounted(() => {
  getDashboardData();
});
</script>

<style scoped>
.dashboard {
  padding: 25px;
  min-height: 100vh;

  /* ========== 背景图片 ========== */
  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

/* ========== 半透明虚化层，不挡文字 ========== */
.dashboard::before {
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

/* 让内容在背景上层 */
.dashboard > * {
  position: relative;
  z-index: 10;
}

/* 卡片美化：圆角 + 阴影 + 居中 */
.stat-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  text-align: center;
  padding: 28px 10px;
  background: rgba(255, 255, 255, 0.9);
}

/* 鼠标悬浮效果 */
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 标题样式 */
.card-header {
  font-size: 15px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
}

/* 数字样式 + 彩色渐变 */
.card-value {
  font-size: 32px;
  font-weight: bold;
  line-height: 1.2;
}

/* 渐变颜色 */
.blue {
  color: #1677ff;
}
.green {
  color: #00b42a;
}
.orange {
  color: #ff7d00;
}
.purple {
  color: #722ed1;
}
</style>
