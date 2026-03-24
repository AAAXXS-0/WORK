const PostModel = require('../../model/post')
const UserModel = require('../../model/user')
const logger = require('../../common/logger')

// 获取仪表盘统计数据
const getDashboardData = async () => {
  try {
    // 1. 待审核帖子数（AI审核中 + 待人工审核）
    const waitAuditResult = await PostModel.countByStatus([1, 2])
    const waitAuditCount = waitAuditResult.total

    // 2. 今日发帖数
    const todayPostResult = await PostModel.countTodayPosts()
    const todayPostCount = todayPostResult.total

    // 3. AI驳回数（状态为已驳回且audit_user_id为空，表示AI审核驳回）
    const aiRejectResult = await PostModel.countAiRejected()
    const aiRejectCount = aiRejectResult.total

    // 4. 活跃用户数（最近7天内有发帖或评论的用户）
    const activeUserResult = await UserModel.countActiveUsers()
    const activeUserCount = activeUserResult.total

    logger.info('获取仪表盘数据成功')

    return {
      waitAuditCount,
      todayPostCount,
      aiRejectCount,
      activeUserCount
    }
  } catch (err) {
    logger.error('获取仪表盘数据失败:', err)
    throw err
  }
}

module.exports = {
  getDashboardData
}
