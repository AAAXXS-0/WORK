<template>
    <el-tag :type="getStatusType()">{{ getStatusText() }}</el-tag>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  const props = defineProps({
    status: {
      type: [String, Number],
      required: true
    },
    type: {
      type: String,
      default: 'post' // post 或 comment
    }
  })
  
  // 获取状态类型（Element Plus 标签类型）
  const getStatusType = () => {
    const status = props.status
    // 如果是数字类型，转换为对应的文本状态
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'info' // 已删除
        case 1: return 'info' // AI审核中
        case 2: return 'warning' // 待人工审核
        case 3: return 'success' // 已发布
        case 4: return 'danger' // 已驳回
        case 5: return 'info' // 已删除
        default: return 'default'
      }
    }
    // 如果是字符串类型，使用原有逻辑
    switch (status) {
      case '已发布': return 'success'
      case '已驳回': return 'danger'
      case '待人工审核': return 'warning'
      case 'AI审核中': return 'info'
      case '正常': return 'success'
      case '已删除': return 'info'
      default: return 'default'
    }
  }
  
  // 获取状态文本
  const getStatusText = () => {
    const status = props.status
    // 如果是数字类型，转换为对应的文本状态
    if (typeof status === 'number') {
      const statusMap = {
        0: '已删除',
        1: 'AI审核中',
        2: '待人工审核',
        3: '已发布',
        4: '已驳回',
        5: '已删除'
      }
      return statusMap[status] || '未知'
    }
    // 如果是字符串类型，使用原有逻辑
    const statusMap = {
      '待审核': '待审核',
      'AI审核中': 'AI审核中',
      '已发布': '审核通过',
      '已驳回': '审核驳回',
      '待人工审核': '待人工审核',
      '正常': '正常',
      '已删除': '已删除'
    }
    return statusMap[status] || status
  }
  </script>