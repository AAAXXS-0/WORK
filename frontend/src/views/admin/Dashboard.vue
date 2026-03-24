<template>
    <div class="dashboard">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card>
            <div class="card-header">待审核帖子</div>
            <div class="card-value">{{ waitAuditCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="card-header">今日发帖数</div>
            <div class="card-value">{{ todayPostCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="card-header">AI驳回数</div>
            <div class="card-value">{{ aiRejectCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="card-header">活跃用户数</div>
            <div class="card-value">{{ activeUserCount }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import adminApi from '@/api/admin'
  
  const waitAuditCount = ref(0)
  const todayPostCount = ref(0)
  const aiRejectCount = ref(0)
  const activeUserCount = ref(0)
  
  // 获取仪表盘数据
  const getDashboardData = async () => {
    const res = await adminApi.getDashboardData()
    waitAuditCount.value = res.data.waitAuditCount
    todayPostCount.value = res.data.todayPostCount
    aiRejectCount.value = res.data.aiRejectCount
    activeUserCount.value = res.data.activeUserCount
  }
  
  onMounted(() => {
    getDashboardData()
  })
  </script>
  
  <style scoped>
  .dashboard { padding: 20px; }
  .card-header { font-size: 14px; color: #999; margin-bottom: 10px; }
  .card-value { font-size: 24px; font-weight: bold; }
  </style>