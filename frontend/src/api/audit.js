import request from '@/utils/request'

export default {
  // 获取审核日志
  getAuditLog(params) {
    return request.get('/admin/audit/log', { params })
  },
  // 导出审核日志
  exportAuditLog() {
    return request.get('/admin/audit/export', { responseType: 'blob' })
  }
}