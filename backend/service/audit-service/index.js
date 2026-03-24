const aiAudit = require('../../ai-audit/service')
const PostModel = require('../../model/post')
const logger = require('../../common/logger')
const { BusinessException } = require('../../common/exception')
const { POST_STATUS, AUDIT_TYPE, AUDIT_RESULT, AI_RESULT_MAP } = require('../../common/constants')
const { ErrorCode } = require('../../common/errorCode')

// AI审核调度
const aiAuditDispatch = async (postId, content, images) => {
  try {
    logger.info(`开始AI审核：帖子ID=${postId}`)
    // 调用AI审核接口
    const result = await aiAudit.audit(content, images)
    
    // 映射AI审核结果
    const auditResult = AI_RESULT_MAP[result.status] || AUDIT_RESULT.UNCERTAIN
    
    // 更新AI审核结果
    await PostModel.updateAiResult(postId, auditResult)
    
    // 添加AI审核日志
    await PostModel.addAuditLog({
      postId,
      type: AUDIT_TYPE.AI,
      result: auditResult,
      operatorId: 0
    })

    // 根据AI结果更新帖子状态
    let status
    if (result.status === '合规') {
      status = POST_STATUS.PUBLISHED
    } else if (result.status === '违规') {
      status = POST_STATUS.REJECTED
    } else {
      status = POST_STATUS.WAIT_AUDIT
    }
    await PostModel.updateStatus(postId, status, 0, result.reason || '')
    
    logger.info(`AI审核完成：帖子ID=${postId}，结果=${result.status}`)
    return { status, reason: result.reason }
  } catch (err) {
    logger.error(`AI审核调度失败：帖子ID=${postId}，错误=${err.message}`)
    // AI审核失败，转人工审核
    await PostModel.updateStatus(postId, POST_STATUS.WAIT_AUDIT, 0, 'AI审核接口异常')
    throw err
  }
}

// 人工审核处理
const manualAudit = async (postId, act, auditUserId, rejectReason = '') => {
  if (!['pass', 'reject'].includes(act)) {
    throw new BusinessException(ErrorCode.AUDIT_ACTION_INVALID)
  }
  const status = act === 'pass' ? POST_STATUS.PUBLISHED : POST_STATUS.REJECTED
  const auditResult = act === 'pass' ? AUDIT_RESULT.PASS : AUDIT_RESULT.REJECT
  
  // 添加人工审核日志
  await PostModel.addAuditLog({
    postId,
    type: AUDIT_TYPE.MANUAL,
    result: auditResult,
    operatorId: auditUserId
  })
  
  await PostModel.updateStatus(postId, status, auditUserId, rejectReason)
  logger.info(`人工审核完成：帖子ID=${postId}，操作=${act}，审核人ID=${auditUserId}`)
  return { success: true }
}

module.exports = {
  aiAuditDispatch,
  manualAudit
}