const mysql = require('../dao/mysql')

// 点赞模型
class LikeModel {
  // 点赞帖子
  static async likePost(postId, userId) {
    const sql = `
      INSERT INTO \`like\` (post_id, user_id)
      VALUES (?, ?)
    `
    await mysql.execute(sql, [postId, userId])
  }

  // 取消点赞
  static async unlikePost(postId, userId) {
    const sql = `
      DELETE FROM \`like\`
      WHERE post_id = ? AND user_id = ?
    `
    await mysql.execute(sql, [postId, userId])
  }

  // 检查用户是否已点赞
  static async checkLiked(postId, userId) {
    const sql = `
      SELECT id FROM \`like\`
      WHERE post_id = ? AND user_id = ?
    `
    const rows = await mysql.execute(sql, [postId, userId])
    return rows.length > 0
  }

  // 获取帖子的点赞数
  static async getLikeCount(postId) {
    const sql = `
      SELECT COUNT(*) as count FROM \`like\`
      WHERE post_id = ?
    `
    const rows = await mysql.execute(sql, [postId])
    return rows[0].count
  }

  // 获取用户点赞的帖子列表
  static async getUserLikedPosts(userId, pageNum = 1, pageSize = 10) {
    const offset = (pageNum - 1) * pageSize
    const sql = `
      SELECT p.*, u.username, u.student_id, u.avatar
      FROM \`like\` l
      INNER JOIN post p ON l.post_id = p.id
      LEFT JOIN user u ON p.user_id = u.id
      WHERE l.user_id = ?
      ORDER BY l.create_time DESC
      LIMIT ?, ?
    `
    const rows = await mysql.execute(sql, [userId, offset, pageSize])
    
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total FROM \`like\`
      WHERE user_id = ?
    `
    const countRows = await mysql.execute(countSql, [userId])
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }
}

module.exports = LikeModel
