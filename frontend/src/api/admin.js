import request from '@/utils/request'

export default {
  // 获取仪表盘统计数据
  getDashboardData() {
    return request.get('/admin/dashboard/stats')
  },

  // 获取用户列表
  getUserList(params) {
    return request.get('/admin/user/list', { params })
  },
  // 用户管理（封禁/解封）
  userManage(data) {
    return request.post('/admin/user/manage', data)
  },
  
  // ============ 配置管理相关接口 ============
  
  // 获取敏感词列表
  getSensitiveWordList(params) {
    return request.get('/admin/config/sensitive/list', { params })
  },
  // 添加敏感词
  addSensitiveWord(data) {
    return request.post('/admin/config/sensitive/add', data)
  },
  // 批量添加敏感词
  batchAddSensitiveWords(data) {
    return request.post('/admin/config/sensitive/batch-add', data)
  },
  // 删除敏感词
  deleteSensitiveWord(id) {
    return request.delete(`/admin/config/sensitive/${id}`)
  },
  // 批量删除敏感词
  batchDeleteSensitiveWords(data) {
    return request.post('/admin/config/sensitive/batch-delete', data)
  },
  // 更新敏感词状态
  updateSensitiveWordStatus(id, data) {
    return request.put(`/admin/config/sensitive/${id}/status`, data)
  },
  
  // 获取AI审核配置
  getAiConfig() {
    return request.get('/admin/config/ai')
  },
  // 设置AI审核配置
  setAiConfig(data) {
    return request.post('/admin/config/ai', data)
  }
}