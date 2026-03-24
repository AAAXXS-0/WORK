const mysql = require('../dao/mysql')
const { POST_STATUS, AUDIT_TYPE, AUDIT_RESULT } = require('../common/constants')

// 帖子模型
class PostModel {
  // 创建帖子
  static async create(post) {
    const sql = `
      INSERT INTO post (user_id, content, images, status, ai_result)
      VALUES (?, ?, ?, ?, ?)
    `
    const result = await mysql.execute(sql, [
      post.userId,
      post.content,
      post.images ? JSON.stringify(post.images) : '',
      post.status,
      post.aiResult
    ])
    return result.insertId
  }

  // 更新帖子状态
  static async updateStatus(id, status, auditUserId, rejectReason = '') {
    const sql = `
      UPDATE post 
      SET status = ?, audit_user_id = ?, reject_reason = ?
      WHERE id = ?
    `
    await mysql.execute(sql, [status, auditUserId, rejectReason, id])
  }

  // 更新AI审核结果
  static async updateAiResult(id, aiResult) {
    const sql = 'UPDATE post SET ai_result = ? WHERE id = ?'
    await mysql.execute(sql, [aiResult, id])
  }

  // 更新帖子内容
  static async updateContent(id, content, images) {
    const sql = `
      UPDATE post 
      SET content = ?, images = ?, status = ?, reject_reason = ''
      WHERE id = ?
    `
    await mysql.execute(sql, [content, images, POST_STATUS.AI_AUDITING, id])
  }

  // 根据用户ID查询帖子
  static async findByUserId(userId, status) {
    let sql = 'SELECT * FROM post WHERE user_id = ?'
    const params = [userId]
    
    if (status !== undefined && status !== null) {
      sql += ' AND status = ?'
      params.push(status)
    }
    
    sql += ' ORDER BY create_time DESC'
    
    const rows = await mysql.execute(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM post WHERE user_id = ?'
    const countParams = [userId]
    
    if (status !== undefined && status !== null) {
      countSql += ' AND status = ?'
      countParams.push(status)
    }
    
    const countRows = await mysql.execute(countSql, countParams)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 根据ID查询帖子
  static async findById(id) {
    const sql = `
      SELECT p.*, u.username, u.student_id, u.avatar
      FROM post p
      LEFT JOIN user u ON p.user_id = u.id
      WHERE p.id = ?
    `
    const rows = await mysql.execute(sql, [id])
    return rows[0]
  }

  // 获取待人工审核的帖子
  static async findWaitAudit() {
    const sql = `
      SELECT 
        p.*,
        u.username,
        u.student_id
      FROM post p
      LEFT JOIN user u ON p.user_id = u.id
      WHERE p.status = ?
      ORDER BY p.create_time ASC
    `
    return await mysql.execute(sql, [POST_STATUS.WAIT_AUDIT])
  }

  // 获取审核日志
  static async getAuditLog(params) {
    let sql = `
      SELECT al.*, p.content, u.username as operator_name, u.student_id as operator_student_id
      FROM audit_log al
      LEFT JOIN post p ON al.post_id = p.id
      LEFT JOIN user u ON al.operator_id = u.id
      WHERE 1=1
    `
    const paramsArr = []
    if (params.postId) {
      sql += ' AND al.post_id = ?'
      paramsArr.push(params.postId)
    }
    if (params.type) {
      sql += ' AND al.type = ?'
      paramsArr.push(params.type)
    }
    if (params.result) {
      sql += ' AND al.result = ?'
      paramsArr.push(params.result)
    }
    // 确保分页参数是数字类型
    const pageNum = parseInt(params.pageNum) || 1
    const pageSize = parseInt(params.pageSize) || 10
    const offset = (pageNum - 1) * pageSize
    sql += ' ORDER BY al.create_time DESC LIMIT ' + offset + ', ' + pageSize
    
    const rows = await mysql.execute(sql, paramsArr)
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM audit_log 
      WHERE 1=1
    ` + (params.postId ? ' AND post_id = ?' : '') + 
      (params.type ? ' AND type = ?' : '') + 
      (params.result ? ' AND result = ?' : '')
    const countParams = []
    if (params.postId) countParams.push(params.postId)
    if (params.type) countParams.push(params.type)
    if (params.result) countParams.push(params.result)
    const countRows = await mysql.execute(countSql, countParams)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 添加审核日志
  static async addAuditLog(log) {
    const sql = `
      INSERT INTO audit_log (post_id, type, result, operator_id)
      VALUES (?, ?, ?, ?)
    `
    await mysql.execute(sql, [log.postId, log.type, log.result, log.operatorId])
  }

  // 获取帖子列表（管理员）
  static async list(status, pageNum, pageSize) {
    let sql = `
      SELECT p.*, u.student_id, u.username 
      FROM post p
      LEFT JOIN user u ON p.user_id = u.id
      WHERE 1=1
    `
    const params = []
    if (status !== undefined && status !== '') {
      sql += ' AND p.status = ?'
      params.push(status)
    }
    // 确保分页参数是数字类型
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    // 使用字符串拼接，避免参数化查询的类型问题
    sql += ' ORDER BY p.create_time DESC LIMIT ' + offset + ', ' + size
    
    const rows = await mysql.execute(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM post WHERE 1=1'
    const countParams = []
    if (status !== undefined && status !== '') {
      countSql += ' AND status = ?'
      countParams.push(status)
    }
    const countRows = await mysql.execute(countSql, countParams)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 获取已发布的帖子列表（首页使用，支持搜索和分页）
  static async getPublishedPosts(keyword, pageNum, pageSize) {
    let sql = `
      SELECT p.*, u.student_id, u.username, u.avatar
      FROM post p
      LEFT JOIN user u ON p.user_id = u.id
      WHERE p.status = 3
    `
    const params = []
    
    // 如果有搜索关键词，添加搜索条件
    if (keyword && keyword.trim()) {
      sql += ' AND (p.content LIKE ? OR u.username LIKE ? OR u.student_id LIKE ?)'
      const searchTerm = `%${keyword.trim()}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    // 确保分页参数是数字类型
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    // 使用字符串拼接，避免参数化查询的类型问题
    sql += ' ORDER BY p.create_time DESC LIMIT ' + offset + ', ' + size
    
    const rows = await mysql.execute(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM post WHERE status = 3'
    const countParams = []
    
    if (keyword && keyword.trim()) {
      countSql += ' AND (content LIKE ? OR username LIKE ? OR student_id LIKE ?)'
      const searchTerm = `%${keyword.trim()}%`
      countParams.push(searchTerm, searchTerm, searchTerm)
    }
    
    const countRows = await mysql.execute(countSql, countParams)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 统计指定状态的帖子数
  static async countByStatus(statusList) {
    const placeholders = statusList.map(() => '?').join(',')
    const sql = `SELECT COUNT(*) as total FROM post WHERE status IN (${placeholders})`
    const rows = await mysql.execute(sql, statusList)
    return rows[0]
  }

  // 统计今日发帖数
  static async countTodayPosts() {
    const sql = `
      SELECT COUNT(*) as total 
      FROM post 
      WHERE DATE(create_time) = CURDATE()
    `
    const rows = await mysql.execute(sql)
    return rows[0]
  }

  // 统计AI驳回的帖子数（状态为已驳回且audit_user_id为空）
  static async countAiRejected() {
    const sql = `
      SELECT COUNT(*) as total 
      FROM post 
      WHERE status = 4 AND (audit_user_id IS NULL OR audit_user_id = 0)
    `
    const rows = await mysql.execute(sql)
    return rows[0]
  }
}

module.exports = PostModel