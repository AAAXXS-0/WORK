const aiAudit = require('../../ai-audit/service')
const CommentModel = require('../../model/comment')
const logger = require('../../common/logger')
const { BusinessException } = require('../../common/exception')
const { COMMENT_STATUS, AUDIT_TYPE, AUDIT_RESULT, AI_RESULT_MAP } = require('../../common/constants')
const { ErrorCode } = require('../../common/errorCode')

// AI审核调度
const aiAuditDispatch = async (commentId, content) => {
  try {
    logger.info(`开始AI审核：评论ID=${commentId}`)
    // 调用AI审核接口
    const result = await aiAudit.audit(content, [])
    
    // 映射AI审核结果
    const auditResult = AI_RESULT_MAP[result.status] || AUDIT_RESULT.UNCERTAIN
    
    // 更新AI审核结果
    await CommentModel.updateAiResult(commentId, auditResult)

    // 根据AI结果更新评论状态
    let status
    if (result.status === '合规') {
      status = COMMENT_STATUS.NORMAL
    } else if (result.status === '违规') {
      status = COMMENT_STATUS.REJECTED
    } else {
      status = COMMENT_STATUS.WAIT_AUDIT
    }
    await CommentModel.updateStatus(commentId, status, 0, result.reason || '')
    
    logger.info(`AI审核完成：评论ID=${commentId}，结果=${result.status}`)
    return { status, reason: result.reason }
  } catch (err) {
    logger.error(`AI审核调度失败：评论ID=${commentId}，错误=${err.message}`)
    // AI审核失败，转人工审核
    await CommentModel.updateStatus(commentId, COMMENT_STATUS.WAIT_AUDIT, 0, 'AI审核接口异常')
    throw err
  }
}

// 人工审核处理
const manualAudit = async (commentId, act, auditUserId, rejectReason = '') => {
  if (!['pass', 'reject'].includes(act)) {
    throw new BusinessException(ErrorCode.AUDIT_ACTION_INVALID)
  }
  const status = act === 'pass' ? COMMENT_STATUS.NORMAL : COMMENT_STATUS.REJECTED
  const auditResult = act === 'pass' ? AUDIT_RESULT.PASS : AUDIT_RESULT.REJECT
  
  await CommentModel.updateStatus(commentId, status, auditUserId, rejectReason)
  logger.info(`人工审核完成：评论ID=${commentId}，操作=${act}，审核人ID=${auditUserId}`)
  return { success: true }
}

// 获取待审核评论列表
const getPendingAuditComments = async (pageNum, pageSize) => {
  return await CommentModel.getPendingAuditComments(pageNum, pageSize)
}

// 根据状态获取评论列表
const getCommentsByStatus = async (status, pageNum, pageSize) => {
  return await CommentModel.getCommentsByStatus(status, pageNum, pageSize)
}

// 获取所有评论列表
const getAllComments = async (pageNum, pageSize) => {
  return await CommentModel.getAllComments(pageNum, pageSize)
}

module.exports = {
  aiAuditDispatch,
  manualAudit,
  getPendingAuditComments,
  getCommentsByStatus,
  getAllComments
}
