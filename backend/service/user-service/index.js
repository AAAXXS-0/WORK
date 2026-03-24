const UserModel = require('../../model/user')
const StudentRosterModel = require('../../model/studentRoster')
const logger = require('../../common/logger')
const { BusinessException } = require('../../common/exception')
const { encryptPassword } = require('../../common/security')
const authUtil = require('../../common/auth')
const { USER_STATUS, getUserStatusText } = require('../../common/constants')
const { ErrorCode } = require('../../common/errorCode')

// 校园身份认证
const studentAuth = async (data) => {
  const { studentId, cardId } = data
  // 模拟校园认证（实际对接学校认证接口）
  if (!studentId) {
    throw new BusinessException(ErrorCode.USER_STUDENT_ID_EMPTY)
  }
  if (!cardId) {
    throw new BusinessException(ErrorCode.USER_CARD_ID_EMPTY)
  }
  // 检查用户是否已存在
  let user = await UserModel.findByStudentId(studentId)
  if (!user) {
    // 创建新用户
    const userId = await UserModel.create({
      studentId,
      username: `学生${studentId.slice(-4)}`,
      password: encryptPassword('123456') // 默认密码
    })
    user = await UserModel.findById(userId)
    logger.info(`校园认证成功，创建新用户：${studentId}`)
  }
  return {
    id: user.id,
    studentId: user.student_id,
    username: user.username
  }
}

// 用户登录
const login = async (data) => {
  const { studentId, password } = data
  const user = await UserModel.findByStudentId(studentId)
  if (!user) {
    throw new BusinessException(ErrorCode.USER_NOT_FOUND)
  }
  if (user.password !== encryptPassword(password)) {
    throw new BusinessException(ErrorCode.USER_PASSWORD_ERROR)
  }
  if (user.status === USER_STATUS.BANNED) {
    throw new BusinessException(ErrorCode.USER_BANNED)
  }
  logger.info(`用户登录成功：${studentId}`)
  return {
    token: authUtil.generateToken(user),
    user: {
      id: user.id,
      studentId: user.student_id,
      username: user.username,
      role: user.role || 0 // 返回用户角色：0-普通用户，1-管理员
    }
  }
}

// 获取用户列表
const getUserList = async (params) => {
  const { key, pageNum = 1, pageSize = 10 } = params
  return await UserModel.list(key, pageNum, pageSize)
}

// 管理用户（封禁/解封）
const userManage = async (data) => {
  const { id, status } = data
  await UserModel.updateStatus(id, status)
  logger.info(`用户状态更新：ID=${id}，状态=${getUserStatusText(status)}`)
  return { success: true }
}

// 学生注册 - 验证学号和验证码
const verifyStudent = async (data) => {
  const { studentId, verifyCode } = data
  
  // 查询花名册
  const student = await StudentRosterModel.findByStudentIdAndCode(studentId, verifyCode)
  if (!student) {
    // 检查学号是否存在
    const existStudent = await StudentRosterModel.findByStudentId(studentId)
    if (!existStudent) {
      throw new BusinessException(ErrorCode.REGISTER_STUDENT_NOT_FOUND)
    }
    throw new BusinessException(ErrorCode.REGISTER_VERIFY_CODE_ERROR)
  }
  
  // 检查是否已注册
  if (student.is_registered === 1) {
    throw new BusinessException(ErrorCode.REGISTER_ALREADY_DONE)
  }
  
  return {
    studentId: student.student_id,
    name: student.name
  }
}

// 学生注册 - 设置密码并完成注册
const register = async (data) => {
  const { studentId, verifyCode, password, confirmPassword } = data
  
  // 验证密码
  if (!password) {
    throw new BusinessException(ErrorCode.REGISTER_PASSWORD_EMPTY)
  }
  if (password.length < 6) {
    throw new BusinessException(ErrorCode.REGISTER_PASSWORD_TOO_SHORT)
  }
  if (password !== confirmPassword) {
    throw new BusinessException(ErrorCode.REGISTER_PASSWORD_NOT_MATCH)
  }
  
  // 再次验证学号和验证码
  const student = await StudentRosterModel.findByStudentIdAndCode(studentId, verifyCode)
  if (!student) {
    throw new BusinessException(ErrorCode.REGISTER_VERIFY_CODE_ERROR)
  }
  if (student.is_registered === 1) {
    throw new BusinessException(ErrorCode.REGISTER_ALREADY_DONE)
  }
  
  // 检查用户是否已存在（防止重复注册）
  const existUser = await UserModel.findByStudentId(studentId)
  if (existUser) {
    throw new BusinessException(ErrorCode.REGISTER_ALREADY_DONE)
  }
  
  // 创建用户
  await UserModel.create({
    studentId,
    username: student.name,
    password: encryptPassword(password)
  })
  
  // 更新花名册注册状态
  await StudentRosterModel.updateRegistered(studentId)
  
  logger.info(`学生注册成功：${studentId}，姓名：${student.name}`)
  return { success: true, message: '注册成功' }
}

// 获取用户信息
const getUserInfo = async (userId) => {
  const user = await UserModel.findById(userId)
  if (!user) {
    throw new BusinessException(ErrorCode.USER_NOT_FOUND)
  }
  return {
    id: user.id,
    studentId: user.student_id,
    username: user.username,
    avatar: user.avatar || '',
    pendingAvatar: user.pending_avatar || '',
    avatarStatus: user.avatar_status || 0,
    avatarRejectReason: user.avatar_reject_reason || '',
    status: user.status,
    role: user.role || 0,
    createTime: user.create_time
  }
}

// 更新用户头像
const updateAvatar = async (userId, avatarUrl) => {
  if (!avatarUrl) {
    throw new BusinessException(ErrorCode.PARAM_ERROR, '头像URL不能为空')
  }
  await UserModel.updateAvatar(userId, avatarUrl)
  logger.info(`用户头像更新成功：用户ID=${userId}，头像URL=${avatarUrl}`)
  return { success: true, avatar: avatarUrl }
}

// 更新待审核头像
const updatePendingAvatar = async (userId, pendingAvatarUrl) => {
  if (!pendingAvatarUrl) {
    throw new BusinessException(ErrorCode.PARAM_ERROR, '头像URL不能为空')
  }
  await UserModel.updatePendingAvatar(userId, pendingAvatarUrl)
  logger.info(`用户待审核头像更新成功：用户ID=${userId}，待审核头像URL=${pendingAvatarUrl}`)
  return { success: true, pendingAvatar: pendingAvatarUrl }
}

module.exports = {
  studentAuth,
  login,
  getUserList,
  userManage,
  verifyStudent,
  register,
  getUserInfo,
  updateAvatar,
  updatePendingAvatar
}