const mysql = require('../dao/mysql')

// 浏览历史模型
class ViewHistoryModel {
  // 添加浏览记录
  static async add(userId, postId) {
    // 先检查是否已存在该浏览记录
    const existing = await this.findByUserAndPost(userId, postId)
    if (existing) {
      // 如果已存在，更新浏览时间
      const sql = `
        UPDATE view_history 
        SET view_time = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND post_id = ?
      `
      await mysql.execute(sql, [userId, postId])
      return existing.id
    } else {
      // 如果不存在，插入新记录
      const sql = `
        INSERT INTO view_history (user_id, post_id)
        VALUES (?, ?)
      `
      const result = await mysql.execute(sql, [userId, postId])
      
      // 限制浏览记录数量，最多保留50条
      await this.limitHistoryCount(userId, 50)
      
      return result.insertId
    }
  }

  // 限制用户浏览记录数量
  static async limitHistoryCount(userId, maxCount = 50) {
    // 检查当前记录数量
    const countSql = `
      SELECT COUNT(*) as count 
      FROM view_history 
      WHERE user_id = ?
    `
    const countRows = await mysql.execute(countSql, [userId])
    const currentCount = countRows[0].count
    
    // 如果超过最大数量，删除最旧的记录
    if (currentCount > maxCount) {
      const deleteCount = currentCount - maxCount
      const deleteSql = `
        DELETE FROM view_history 
        WHERE user_id = ? 
        ORDER BY view_time ASC 
        LIMIT ?
      `
      await mysql.execute(deleteSql, [userId, deleteCount])
    }
  }

  // 根据用户ID和帖子ID查询浏览记录
  static async findByUserAndPost(userId, postId) {
    const sql = `
      SELECT * FROM view_history 
      WHERE user_id = ? AND post_id = ?
    `
    const rows = await mysql.execute(sql, [userId, postId])
    return rows[0]
  }

  // 获取用户的浏览历史列表
  static async getUserHistory(userId, pageNum, pageSize) {
    const sql = `
      SELECT vh.*, p.content, p.images, p.status, u.username, u.student_id
      FROM view_history vh
      LEFT JOIN post p ON vh.post_id = p.id
      LEFT JOIN user u ON p.user_id = u.id
      WHERE vh.user_id = ?
      ORDER BY vh.view_time DESC
      LIMIT ?, ?
    `
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    
    // 使用字符串拼接，避免参数化查询的类型问题
    const finalSql = sql.replace('LIMIT ?, ?', `LIMIT ${offset}, ${size}`)
    const rows = await mysql.execute(finalSql, [userId])
    
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM view_history 
      WHERE user_id = ?
    `
    const countRows = await mysql.execute(countSql, [userId])
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 删除浏览记录
  static async delete(userId, postId) {
    const sql = `
      DELETE FROM view_history 
      WHERE user_id = ? AND post_id = ?
    `
    await mysql.execute(sql, [userId, postId])
  }

  // 清空用户所有浏览历史
  static async clearAll(userId) {
    const sql = `
      DELETE FROM view_history 
      WHERE user_id = ?
    `
    await mysql.execute(sql, [userId])
  }
}

module.exports = ViewHistoryModel
