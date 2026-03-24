const aiAudit = require('../../ai-audit/service')
const UserModel = require('../../model/user')
const logger = require('../../common/logger')
const { BusinessException } = require('../../common/exception')
const { AVATAR_STATUS, AUDIT_TYPE, AUDIT_RESULT, AI_RESULT_MAP } = require('../../common/constants')
const { ErrorCode } = require('../../common/errorCode')

// AI审核调度
const aiAuditDispatch = async (userId, avatarUrl) => {
  try {
    logger.info(`开始AI审核：用户ID=${userId}`)
    // 调用AI审核接口（传入图片URL）
    const result = await aiAudit.audit('', [avatarUrl])
    
    // 根据AI结果更新头像状态
    let status
    if (result.status === '合规') {
      status = AVATAR_STATUS.APPROVED
    } else if (result.status === '违规') {
      status = AVATAR_STATUS.REJECTED
    } else {
      status = AVATAR_STATUS.AUDITING
    }
    
    // 审核通过：更新正式头像，清空待审核头像
    if (status === AVATAR_STATUS.APPROVED) {
      await UserModel.approveAvatar(userId)
    }
    
    // 审核未通过：只更新状态和原因，保持待审核头像不变
    await UserModel.updateAvatarAuditInfo(userId, status, null, result.reason || '')
    
    logger.info(`AI审核完成：用户ID=${userId}，结果=${result.status}`)
    return { status, reason: result.reason }
  } catch (err) {
    logger.error(`AI审核调度失败：用户ID=${userId}，错误=${err.message}`)
    // AI审核失败，转人工审核
    await UserModel.updateAvatarAuditInfo(userId, AVATAR_STATUS.AUDITING, null, 'AI审核接口异常')
    throw err
  }
}

// 人工审核处理
const manualAudit = async (userId, act, auditUserId, rejectReason = '') => {
  if (!['pass', 'reject'].includes(act)) {
    throw new BusinessException(ErrorCode.AUDIT_ACTION_INVALID)
  }
  const status = act === 'pass' ? AVATAR_STATUS.APPROVED : AVATAR_STATUS.REJECTED
  const auditResult = act === 'pass' ? AUDIT_RESULT.PASS : AUDIT_RESULT.REJECT
  
  // 审核通过：更新正式头像，清空待审核头像
  if (act === 'pass') {
    await UserModel.approveAvatar(userId)
  }
  
  // 审核未通过：只更新状态和原因，保持待审核头像不变
  await UserModel.updateAvatarAuditInfo(userId, status, auditUserId, rejectReason)
  logger.info(`头像审核完成：用户ID=${userId}，操作=${act}，审核人ID=${auditUserId}`)
  return { success: true }
}

// 获取待审核头像列表
const getPendingAuditAvatars = async (pageNum, pageSize) => {
  return await UserModel.getPendingAuditAvatars(pageNum, pageSize)
}

// 根据状态获取头像列表
const getAvatarsByStatus = async (status, pageNum, pageSize) => {
  return await UserModel.getUsersByAvatarStatus(status, pageNum, pageSize)
}

module.exports = {
  aiAuditDispatch,
  manualAudit,
  getPendingAuditAvatars,
  getAvatarsByStatus
}
