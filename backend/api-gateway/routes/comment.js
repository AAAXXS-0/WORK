const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const commentService = require('../../service/comment-service')
const commentAuditService = require('../../service/comment-audit-service')
const { asyncHandler } = require('../middleware/asyncHandler')
const { BusinessException } = require('../../common/exception')

// 添加评论
router.post('/add', authMiddleware, asyncHandler(async (req, res, next) => {
  const { postId, content, parentId = 0 } = req.body
  const userId = req.user.id
  
  // 创建评论（初始状态为AI审核中）
  const result = await commentService.createComment(postId, userId, content, parentId)
  
  // 调用AI审核服务
  try {
    await commentAuditService.aiAuditDispatch(result.id, content)
  } catch (err) {
    // AI审核失败，评论会自动转为待人工审核状态
    console.error('AI审核失败，已转人工审核:', err.message)
  }
  
  res.json({ code: 0, msg: '评论发布成功，正在审核中', data: result })
}))

// 获取评论列表
router.get('/list', asyncHandler(async (req, res, next) => {
  const { postId } = req.query
  
  if (!postId) {
    throw new BusinessException('帖子ID不能为空')
  }
  
  const comments = await commentService.getPostComments(postId)
  res.json({ code: 0, data: comments })
}))

// 获取用户评论列表
router.get('/my', authMiddleware, asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const { pageNum = 1, pageSize = 10, status } = req.query
  
  const result = await commentService.getUserComments(userId, pageNum, pageSize, status)
  res.json({ code: 0, data: result })
}))

// 删除评论
router.delete('/:id', authMiddleware, asyncHandler(async (req, res, next) => {
  const commentId = req.params.id
  const userId = req.user.id
  
  await commentService.deleteComment(commentId, userId)
  res.json({ code: 0, msg: '删除成功' })
}))

module.exports = router