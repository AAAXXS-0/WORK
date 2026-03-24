const mysql = require('../dao/mysql')

// 评论模型
class CommentModel {
  // 创建评论
  static async create(postId, userId, content, parentId = 0) {
    const sql = `
      INSERT INTO comment (post_id, user_id, content, parent_id, status)
      VALUES (?, ?, ?, ?, 2)
    `
    const result = await mysql.execute(sql, [postId, userId, content, parentId])
    return result.insertId
  }

  // 根据ID查询评论
  static async findById(id) {
    const sql = 'SELECT * FROM comment WHERE id = ?'
    const rows = await mysql.execute(sql, [id])
    return rows[0]
  }

  // 根据帖子ID获取评论列表
  static async findByPostId(postId) {
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.student_id,
        u.avatar
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.status = 1
      ORDER BY c.create_time ASC
    `
    return await mysql.execute(sql, [postId])
  }

  // 根据用户ID获取评论列表
  static async findByUserId(userId, pageNum = 1, pageSize = 10, status = null) {
    // 确保分页参数是数字类型
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    
    let whereClause = 'WHERE c.user_id = ?'
    const params = [userId]
    
    // 如果指定了状态，添加状态筛选
    if (status !== null && status !== undefined) {
      whereClause += ' AND c.status = ?'
      params.push(status)
    }
    
    const sql = `
      SELECT 
        c.id,
        c.post_id as postId,
        c.user_id as userId,
        c.content,
        c.parent_id as parentId,
        c.status,
        c.create_time as createTime,
        p.content as postTitle,
        p.status as postStatus
      FROM comment c
      LEFT JOIN post p ON c.post_id = p.id
      ${whereClause}
      ORDER BY c.create_time DESC
      LIMIT ${offset}, ${size}
    `
    const rows = await mysql.execute(sql, params)
    
    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM comment c ${whereClause}`
    const countRows = await mysql.execute(countSql, params)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 删除评论
  static async delete(id) {
    const sql = 'UPDATE comment SET status = 0 WHERE id = ?'
    await mysql.execute(sql, [id])
  }

  // 批量删除评论
  static async batchDelete(ids) {
    const sql = 'UPDATE comment SET status = 0 WHERE id IN (?)'
    await mysql.execute(sql, [ids])
  }

  // 更新评论状态
  static async updateStatus(id, status, auditUserId = null, rejectReason = '') {
    const sql = `
      UPDATE comment 
      SET status = ?, audit_user_id = ?, reject_reason = ?
      WHERE id = ?
    `
    await mysql.execute(sql, [status, auditUserId, rejectReason, id])
  }

  // 更新AI审核结果
  static async updateAiResult(id, aiResult) {
    const sql = 'UPDATE comment SET ai_result = ? WHERE id = ?'
    await mysql.execute(sql, [aiResult, id])
  }

  // 获取待审核的评论列表
  static async getPendingAuditComments(pageNum = 1, pageSize = 10) {
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.student_id,
        p.content as postContent
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id
      LEFT JOIN post p ON c.post_id = p.id
      WHERE c.status = 3
      ORDER BY c.create_time DESC
      LIMIT ${offset}, ${size}
    `
    const rows = await mysql.execute(sql)
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM comment WHERE status = 3'
    const countRows = await mysql.execute(countSql)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 根据状态获取评论列表（用于管理员）
  static async getCommentsByStatus(status, pageNum = 1, pageSize = 10) {
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.student_id,
        p.content as postContent
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id
      LEFT JOIN post p ON c.post_id = p.id
      WHERE c.status = ?
      ORDER BY c.create_time DESC
      LIMIT ${offset}, ${size}
    `
    const rows = await mysql.execute(sql, [status])
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM comment WHERE status = ?'
    const countRows = await mysql.execute(countSql, [status])
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 获取所有评论列表（用于管理员）
  static async getAllComments(pageNum = 1, pageSize = 10) {
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.student_id,
        p.content as postContent
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id
      LEFT JOIN post p ON c.post_id = p.id
      ORDER BY c.create_time DESC
      LIMIT ${offset}, ${size}
    `
    const rows = await mysql.execute(sql)
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM comment'
    const countRows = await mysql.execute(countSql)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }
}

module.exports = CommentModel
