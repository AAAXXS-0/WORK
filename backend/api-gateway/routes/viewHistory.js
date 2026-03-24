const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../middleware/asyncHandler')
const { authMiddleware } = require('../middleware/auth')
const viewHistoryService = require('../../service/view-history-service')

// 添加浏览记录（需要登录）
router.post('/add', authMiddleware, asyncHandler(async (req, res) => {
  const { postId } = req.body
  const userId = req.user.id
  
  const result = await viewHistoryService.addViewHistory(userId, postId)
  res.json({
    code: 0,
    message: '浏览记录添加成功',
    data: result
  })
}))

// 获取用户浏览历史列表（需要登录）
router.get('/my', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { pageNum = 1, pageSize = 10 } = req.query
  
  const result = await viewHistoryService.getUserViewHistory(userId, pageNum, pageSize)
  res.json({
    code: 0,
    message: '获取成功',
    data: result
  })
}))

// 删除浏览记录（需要登录）
router.delete('/:postId', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const postId = req.params.postId
  
  await viewHistoryService.deleteViewHistory(userId, postId)
  res.json({
    code: 0,
    message: '删除成功'
  })
}))

// 清空所有浏览历史（需要登录）
router.delete('/clear/all', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id
  
  await viewHistoryService.clearViewHistory(userId)
  res.json({
    code: 0,
    message: '清空成功'
  })
}))

module.exports = router
