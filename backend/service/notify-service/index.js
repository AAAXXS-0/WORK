const logger = require('../../common/logger')

// 发送站内通知
const sendNotification = async (userId, title, content) => {
  // 模拟发送通知（实际可对接WebSocket/短信/邮件）
  logger.info(`发送通知给用户${userId}：${title} - ${content}`)
  return { success: true }
}

// 记录操作日志
const logOperation = async (operator, type, content) => {
  const logContent = `操作人：${operator}，操作类型：${type}，内容：${content}`
  logger.info(`操作日志：${logContent}`)
  // 写入数据库日志表
  return { success: true }
}

module.exports = {
  sendNotification,
  logOperation
}