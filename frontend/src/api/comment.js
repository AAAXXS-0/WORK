import request from '@/utils/request'

export default {
  // 发布评论
  addComment(data) {
    return request.post('/comment/add', data)
  },
  // 获取帖子评论
  getComment(postId) {
    return request.get(`/comment/list?postId=${postId}`)
  },
  // 点赞/取消点赞
  like(postId) {
    return request.post('/post/like', { postId })
  },
  // 获取用户评论列表
  getUserComments() {
    return request.get('/comment/my')
  },
  // 删除评论
  deleteComment(commentId) {
    return request.delete(`/comment/${commentId}`)
  }
}

// 导出单独的函数以便在setup中使用
export const getUserComments = (params) => {
  return request.get('/comment/my', { params })
}

export const deleteComment = (commentId) => {
  return request.delete(`/comment/${commentId}`)
}