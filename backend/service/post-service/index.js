const PostModel = require('../../model/post')
const LikeModel = require('../../model/like')
const logger = require('../../common/logger')
const { BusinessException } = require('../../common/exception')
const { filterXss, filterSql } = require('../../common/security')
const { POST_STATUS, AUDIT_TYPE, AUDIT_RESULT, getPostStatusText } = require('../../common/constants')
const { ErrorCode } = require('../../common/errorCode')
const auditService = require('../audit-service')

// 创建帖子
const createPost = async (data) => {
  const { userId, content, images } = data
  if (!content) {
    throw new BusinessException(ErrorCode.POST_CONTENT_EMPTY)
  }
  // 过滤XSS和SQL注入
  const safeContent = filterXss(filterSql(content))
  // 创建帖子，初始状态：AI审核中
  const postId = await PostModel.create({
    userId,
    content: safeContent,
    images,
    status: 1,
    aiResult: ''
  })
  logger.info(`帖子创建成功：ID=${postId}，用户ID=${userId}`)
  return { postId }
}

// 更新帖子状态
const updatePostStatus = async (id, status, auditUserId, rejectReason = '') => {
  await PostModel.updateStatus(id, status, auditUserId, rejectReason)
  logger.info(`帖子状态更新：ID=${id}，状态=${getPostStatusText(status)}`)
}

// 更新帖子内容
const updatePost = async (id, userId, content, images) => {
  // 检查帖子是否存在
  const post = await PostModel.findById(id)
  if (!post) {
    throw new BusinessException(ErrorCode.POST_NOT_FOUND)
  }
  
  // 检查是否是帖子作者
  if (post.user_id !== userId) {
    throw new BusinessException(ErrorCode.NO_PERMISSION)
  }
  
  // 过滤XSS和SQL注入
  const safeContent = filterXss(filterSql(content))
  
  // 更新帖子内容，重置状态为AI审核中
  await PostModel.updateContent(id, safeContent, images ? JSON.stringify(images) : '')
  
  // 触发AI审核
  await auditService.aiAuditDispatch(id, safeContent, images)
  
  logger.info(`帖子更新成功：ID=${id}，用户ID=${userId}`)
  return { postId: id }
}

// 获取用户帖子列表
const getUserPosts = async (userId, status) => {
  console.log('[post-service] getUserPosts - 用户ID:', userId, '状态:', status);
  const result = await PostModel.findByUserId(userId, status);
  console.log('[post-service] PostModel.findByUserId 返回结果:', JSON.stringify(result, null, 2));
  // 格式化图片字段
  const formattedList = result.list.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    aiResult: post.ai_result,
    rejectReason: post.reject_reason,
    createTime: post.create_time
  }));
  console.log('[post-service] 格式化后的列表长度:', formattedList.length);
  const returnData = {
    list: formattedList,
    total: result.total
  };
  console.log('[post-service] 最终返回数据:', JSON.stringify(returnData, null, 2));
  return returnData;
}

// 获取帖子详情
const getPostDetail = async (id) => {
  const post = await PostModel.findById(id)
  if (!post) {
    throw new BusinessException(ErrorCode.POST_NOT_FOUND)
  }
  return {
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    aiResult: post.ai_result,
    createTime: post.create_time,
    username: post.username,
    studentId: post.student_id,
    avatar: post.avatar
  }
}

// 获取待人工审核的帖子
const getWaitAuditPosts = async () => {
  const posts = await PostModel.findWaitAudit()
  return posts.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    aiResult: post.ai_result,
    createTime: post.create_time,
    username: post.username,
    studentId: post.student_id
  }))
}

// 获取已发布的帖子列表（首页使用）
const getPublishedPosts = async (keyword, pageNum, pageSize) => {
  const result = await PostModel.getPublishedPosts(keyword, pageNum, pageSize)
  // 格式化图片字段
  const formattedList = result.list.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    createTime: post.create_time,
    userId: post.user_id,
    username: post.username,
    studentId: post.student_id,
    avatar: post.avatar
  }))
  return {
    list: formattedList,
    total: result.total
  }
}

// 点赞帖子
const likePost = async (postId, userId) => {
  // 检查帖子是否存在
  const post = await PostModel.findById(postId)
  if (!post) {
    throw new BusinessException(ErrorCode.POST_NOT_FOUND)
  }
  
  // 检查是否已点赞
  const isLiked = await LikeModel.checkLiked(postId, userId)
  if (isLiked) {
    // 如果已点赞，则取消点赞
    await LikeModel.unlikePost(postId, userId)
    logger.info(`取消点赞成功：帖子ID=${postId}，用户ID=${userId}`)
    return { liked: false }
  } else {
    // 如果未点赞，则添加点赞
    await LikeModel.likePost(postId, userId)
    logger.info(`点赞成功：帖子ID=${postId}，用户ID=${userId}`)
    return { liked: true }
  }
}

// 获取帖子点赞数
const getLikeCount = async (postId) => {
  const count = await LikeModel.getLikeCount(postId)
  return { count }
}

// 获取用户点赞的帖子列表
const getUserLikedPosts = async (userId, pageNum, pageSize) => {
  const result = await LikeModel.getUserLikedPosts(userId, pageNum, pageSize)
  const formattedList = result.list.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    createTime: post.create_time,
    userId: post.user_id,
    username: post.username,
    studentId: post.student_id,
    avatar: post.avatar
  }))
  return {
    list: formattedList,
    total: result.total
  }
}

module.exports = {
  createPost,
  updatePostStatus,
  updatePost,
  getUserPosts,
  getPostDetail,
  getWaitAuditPosts,
  getPublishedPosts,
  likePost,
  getLikeCount,
  getUserLikedPosts
}