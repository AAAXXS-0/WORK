const express = require('express')
const router = express.Router()
const userService = require('../../service/user-service')
const avatarAuditService = require('../../service/avatar-audit-service')
const { authMiddleware } = require('../middleware/auth')
const asyncHandler = require('../../common/asyncHandler')

// 校园身份认证
router.post('/student', asyncHandler(async (req, res) => {
  const result = await userService.studentAuth(req.body)
  res.json({ code: 0, msg: '认证成功', data: result })
}))

// 登录
router.post('/login', asyncHandler(async (req, res) => {
  const result = await userService.login(req.body)
  
  // ✅ 修正：后端不再存 Token，只通过响应返回给前端
  res.json({ 
    code: 0, 
    msg: '登录成功', 
    data: { 
      token: result.token,
      user: result.user // 返回用户信息（包含角色）
    }
  })
}))

// 退出登录
router.post('/logout', asyncHandler(async (req, res) => {
  // ✅ 修正：后端不用清 Token，前端自己清除
  res.json({ code: 0, msg: '退出成功' })
}))

// 学生注册 - 验证学号和验证码
router.post('/verify', asyncHandler(async (req, res) => {
  const result = await userService.verifyStudent(req.body)
  res.json({ code: 0, msg: '验证成功', data: result })
}))

// 学生注册 - 设置密码并完成注册
router.post('/register', asyncHandler(async (req, res) => {
  const result = await userService.register(req.body)
  res.json({ code: 0, msg: '注册成功', data: result })
}))

// 获取用户信息（需要认证）
router.get('/info', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const userInfo = await userService.getUserInfo(userId)
  res.json({ code: 0, msg: '获取成功', data: userInfo })
}))

// 更新用户头像（需要认证）
router.post('/avatar', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { avatar } = req.body
  
  // 第一步：保存待审核的头像，设置状态为审核中
  await userService.updatePendingAvatar(userId, avatar)
  
  // 第二步：调用AI审核服务
  try {
    await avatarAuditService.aiAuditDispatch(userId, avatar)
  } catch (err) {
    // AI审核失败，头像会自动转为待人工审核状态
    console.error('AI审核失败，已转人工审核:', err.message)
  }
  
  res.json({ code: 0, msg: '头像上传成功，正在审核中', data: { pendingAvatar: avatar } })
}))

module.exports = router