import request from '@/utils/request'

export default {
  // 添加浏览记录
  addViewHistory(postId) {
    return request.post('/view-history/add', { postId })
  },
  // 获取用户浏览历史列表
  getViewHistory(params) {
    return request.get('/view-history/my', { params })
  },
  // 删除浏览记录
  deleteViewHistory(postId) {
    return request.delete(`/view-history/${postId}`)
  },
  // 清空所有浏览历史
  clearViewHistory() {
    return request.delete('/view-history/clear/all')
  }
}

// 导出单独的函数以便在setup中使用
export const addViewHistory = (postId) => {
  return request.post('/view-history/add', { postId })
}

export const getViewHistory = (params) => {
  return request.get('/view-history/my', { params })
}

export const deleteViewHistory = (postId) => {
  return request.delete(`/view-history/${postId}`)
}

export const clearViewHistory = () => {
  return request.delete('/view-history/clear/all')
}
