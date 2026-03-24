const authUtil = require('../../common/auth')
const logger = require('../../common/logger')
const { BusinessException, AuthException, PermissionException } = require('../../common/exception')
const { ErrorCode } = require('../../common/errorCode')

// 登录校验中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    throw new AuthException('未登录，请先登录')
  }
  // 验证token（实际从Redis/数据库验证）
  const user = authUtil.verifyToken(token)
  if (!user) {
    throw new AuthException('Token无效或已过期')
  }
  // 将用户信息挂载到req
  req.user = user
  next()
}

// 管理员权限校验
const adminAuthMiddleware = (req, res, next) => {
  if (req.user.role !== 1) {
    throw new PermissionException('无管理员权限')
  }
  next()
}

module.exports = {
  authMiddleware,
  adminAuthMiddleware
}