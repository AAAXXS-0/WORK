import request from '@/utils/request'

export default {
  // 发布帖子
  publish(data) {
    return request.post('/post/publish', data)
  },
  // 获取我的帖子
  getMyPosts() {
    return request.get('/post/my')
  },
  // 更新帖子
  updatePost(data) {
    return request.put('/post/update', data)
  },
  // 获取帖子详情
  getPostDetail(postId) {
    return request.get(`/post/${postId}`)
  },
  // 点赞/取消点赞
  like(postId) {
    return request.post('/post/like', { postId })
  },
  // 获取帖子点赞数
  getLikeCount(postId) {
    return request.get(`/post/like/count?postId=${postId}`)
  }
}

// 导出单独的函数以便在setup中使用
export const getUserPosts = (params) => {
  return request.get('/post/my', { params })
}

export const updatePost = (data) => {
  return request.put('/post/update', data)
}