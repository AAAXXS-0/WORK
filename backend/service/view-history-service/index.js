const ViewHistoryModel = require('../../model/viewHistory')
const { BusinessException } = require('../../common/exception')
const ErrorCode = require('../../common/errorCode')
const logger = require('../../common/logger')

// 添加浏览记录
const addViewHistory = async (userId, postId) => {
  if (!userId || !postId) {
    throw new BusinessException(ErrorCode.PARAM_ERROR, '用户ID和帖子ID不能为空')
  }
  
  const historyId = await ViewHistoryModel.add(userId, postId)
  logger.info(`浏览记录添加成功：ID=${historyId}，用户ID=${userId}，帖子ID=${postId}`)
  return { id: historyId }
}

// 获取用户浏览历史列表
const getUserViewHistory = async (userId, pageNum = 1, pageSize = 10) => {
  if (!userId) {
    throw new BusinessException(ErrorCode.PARAM_ERROR, '用户ID不能为空')
  }
  
  const result = await ViewHistoryModel.getUserHistory(userId, pageNum, pageSize)
  return {
    list: result.list.map(history => ({
      id: history.id,
      postId: history.post_id,
      content: history.content,
      postImages: history.images ? JSON.parse(history.images) : [],
      postStatus: history.status,
      username: history.username,
      studentId: history.student_id,
      viewTime: history.view_time
    })),
    total: result.total
  }
}

// 删除浏览记录
const deleteViewHistory = async (userId, postId) => {
  if (!userId || !postId) {
    throw new BusinessException(ErrorCode.PARAM_ERROR, '用户ID和帖子ID不能为空')
  }
  
  await ViewHistoryModel.delete(userId, postId)
  logger.info(`浏览记录删除成功：用户ID=${userId}，帖子ID=${postId}`)
}

// 清空用户所有浏览历史
const clearViewHistory = async (userId) => {
  if (!userId) {
    throw new BusinessException(ErrorCode.PARAM_ERROR, '用户ID不能为空')
  }
  
  await ViewHistoryModel.clearAll(userId)
  logger.info(`用户浏览历史清空成功：用户ID=${userId}`)
}

module.exports = {
  addViewHistory,
  getUserViewHistory,
  deleteViewHistory,
  clearViewHistory
}
