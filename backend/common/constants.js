/**
 * 系统常量定义
 * 统一管理状态码、类型码等枚举值
 */

// ==================== 用户状态 ====================
const USER_STATUS = {
  BANNED: 0,      // 封禁
  ACTIVE: 1       // 正常
}

const USER_STATUS_TEXT = {
  [USER_STATUS.BANNED]: '封禁',
  [USER_STATUS.ACTIVE]: '正常'
}

// ==================== 帖子状态 ====================
const POST_STATUS = {
  DRAFT: 0,           // 草稿
  AI_AUDITING: 1,     // AI审核中
  WAIT_AUDIT: 2,      // 待人工审核
  PUBLISHED: 3,       // 已发布
  REJECTED: 4,        // 已驳回
  DELETED: 5          // 已删除
}

const POST_STATUS_TEXT = {
  [POST_STATUS.DRAFT]: '草稿',
  [POST_STATUS.AI_AUDITING]: 'AI审核中',
  [POST_STATUS.WAIT_AUDIT]: '待人工审核',
  [POST_STATUS.PUBLISHED]: '已发布',
  [POST_STATUS.REJECTED]: '已驳回',
  [POST_STATUS.DELETED]: '已删除'
}

// ==================== 审核类型 ====================
const AUDIT_TYPE = {
  AI: 1,       // AI审核
  MANUAL: 2    // 人工审核
}

const AUDIT_TYPE_TEXT = {
  [AUDIT_TYPE.AI]: 'AI审核',
  [AUDIT_TYPE.MANUAL]: '人工审核'
}

// ==================== 审核结果 ====================
const AUDIT_RESULT = {
  PASS: 1,       // 通过
  REJECT: 2,     // 驳回
  COMPLIANT: 3,  // 合规（AI审核专用）
  VIOLATION: 4,  // 违规（AI审核专用）
  UNCERTAIN: 5   // 不确定（需人工复审）
}

const AUDIT_RESULT_TEXT = {
  [AUDIT_RESULT.PASS]: '通过',
  [AUDIT_RESULT.REJECT]: '驳回',
  [AUDIT_RESULT.COMPLIANT]: '合规',
  [AUDIT_RESULT.VIOLATION]: '违规',
  [AUDIT_RESULT.UNCERTAIN]: '不确定'
}

// ==================== AI审核结果映射 ====================
// AI审核服务返回的结果映射到系统审核结果
const AI_RESULT_MAP = {
  '合规': AUDIT_RESULT.COMPLIANT,
  '违规': AUDIT_RESULT.VIOLATION,
  '不确定': AUDIT_RESULT.UNCERTAIN
}

// ==================== 评论状态 ====================
const COMMENT_STATUS = {
  DELETED: 0,        // 已删除
  NORMAL: 1,         // 正常
  AI_AUDITING: 2,    // AI审核中
  WAIT_AUDIT: 3,     // 待人工审核
  REJECTED: 4        // 已驳回
}

const COMMENT_STATUS_TEXT = {
  [COMMENT_STATUS.DELETED]: '已删除',
  [COMMENT_STATUS.NORMAL]: '正常',
  [COMMENT_STATUS.AI_AUDITING]: 'AI审核中',
  [COMMENT_STATUS.WAIT_AUDIT]: '待人工审核',
  [COMMENT_STATUS.REJECTED]: '已驳回'
}

// ==================== 头像状态 ====================
const AVATAR_STATUS = {
  NOT_UPLOADED: 0,    // 未上传
  AUDITING: 1,        // 审核中
  APPROVED: 2,        // 已通过
  REJECTED: 3         // 已驳回
}

const AVATAR_STATUS_TEXT = {
  [AVATAR_STATUS.NOT_UPLOADED]: '未上传',
  [AVATAR_STATUS.AUDITING]: '审核中',
  [AVATAR_STATUS.APPROVED]: '已通过',
  [AVATAR_STATUS.REJECTED]: '已驳回'
}

// ==================== 通知类型 ====================
const NOTIFY_TYPE = {
  SYSTEM: 1,      // 系统通知
  AUDIT: 2,       // 审核结果
  COMMENT: 3,     // 评论通知
  LIKE: 4         // 点赞通知
}

const NOTIFY_TYPE_TEXT = {
  [NOTIFY_TYPE.SYSTEM]: '系统通知',
  [NOTIFY_TYPE.AUDIT]: '审核结果',
  [NOTIFY_TYPE.COMMENT]: '评论通知',
  [NOTIFY_TYPE.LIKE]: '点赞通知'
}

// ==================== 通知状态 ====================
const NOTIFY_STATUS = {
  UNREAD: 0,   // 未读
  READ: 1      // 已读
}

const NOTIFY_STATUS_TEXT = {
  [NOTIFY_STATUS.UNREAD]: '未读',
  [NOTIFY_STATUS.READ]: '已读'
}

// ==================== 用户角色 ====================
const USER_ROLE = {
  USER: 0,       // 普通用户
  ADMIN: 1       // 管理员
}

const USER_ROLE_TEXT = {
  [USER_ROLE.USER]: '普通用户',
  [USER_ROLE.ADMIN]: '管理员'
}

// ==================== 辅助函数 ====================

/**
 * 获取用户状态文本
 */
const getUserStatusText = (status) => {
  return USER_STATUS_TEXT[status] || '未知'
}

/**
 * 获取帖子状态文本
 */
const getPostStatusText = (status) => {
  return POST_STATUS_TEXT[status] || '未知'
}

/**
 * 获取审核类型文本
 */
const getAuditTypeText = (type) => {
  return AUDIT_TYPE_TEXT[type] || '未知'
}

/**
 * 获取审核结果文本
 */
const getAuditResultText = (result) => {
  return AUDIT_RESULT_TEXT[result] || '未知'
}

/**
 * 获取评论状态文本
 */
const getCommentStatusText = (status) => {
  return COMMENT_STATUS_TEXT[status] || '未知'
}

/**
 * 获取头像状态文本
 */
const getAvatarStatusText = (status) => {
  return AVATAR_STATUS_TEXT[status] || '未知'
}

/**
 * 获取通知类型文本
 */
const getNotifyTypeText = (type) => {
  return NOTIFY_TYPE_TEXT[type] || '未知'
}

/**
 * 获取通知状态文本
 */
const getNotifyStatusText = (status) => {
  return NOTIFY_STATUS_TEXT[status] || '未知'
}

/**
 * 获取用户角色文本
 */
const getUserRoleText = (role) => {
  return USER_ROLE_TEXT[role] || '未知'
}

module.exports = {
  // 状态码
  USER_STATUS,
  POST_STATUS,
  AUDIT_TYPE,
  AUDIT_RESULT,
  COMMENT_STATUS,
  AVATAR_STATUS,
  NOTIFY_TYPE,
  NOTIFY_STATUS,
  USER_ROLE,
  
  // 状态文本
  USER_STATUS_TEXT,
  POST_STATUS_TEXT,
  AUDIT_TYPE_TEXT,
  AUDIT_RESULT_TEXT,
  COMMENT_STATUS_TEXT,
  AVATAR_STATUS_TEXT,
  NOTIFY_TYPE_TEXT,
  NOTIFY_STATUS_TEXT,
  USER_ROLE_TEXT,
  
  // 映射
  AI_RESULT_MAP,
  
  // 辅助函数
  getUserStatusText,
  getPostStatusText,
  getAuditTypeText,
  getAuditResultText,
  getCommentStatusText,
  getAvatarStatusText,
  getNotifyTypeText,
  getNotifyStatusText,
  getUserRoleText
}