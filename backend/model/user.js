const mysql = require('../dao/mysql')

// 用户模型
class UserModel {
  // 根据学号查询用户
  static async findByStudentId(studentId) {
    const sql = 'SELECT * FROM user WHERE student_id = ?'
    const rows = await mysql.execute(sql, [studentId])
    return rows[0]
  }

  // 根据ID查询用户
  static async findById(id) {
    const sql = 'SELECT * FROM user WHERE id = ?'
    const rows = await mysql.execute(sql, [id])
    return rows[0]
  }

  // 创建用户
  static async create(user) {
    const sql = `
      INSERT INTO user (student_id, username, password)
      VALUES (?, ?, ?)
    `
    const result = await mysql.execute(sql, [user.studentId, user.username, user.password])
    return result.insertId
  }

  // 更新用户状态
  static async updateStatus(id, status) {
    const sql = 'UPDATE user SET status = ? WHERE id = ?'
    await mysql.execute(sql, [status, id])
  }

  // 获取用户列表
  static async list(key, pageNum, pageSize) {
    let sql = 'SELECT * FROM user WHERE 1=1'
    const params = []
    if (key) {
      sql += ' AND (student_id LIKE ? OR username LIKE ?)'
      params.push(`%${key}%`, `%${key}%`)
    }
    // 过滤掉管理员账号
    sql += ' AND (role IS NULL OR role != 1)'
    // 确保分页参数是数字类型
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    // 使用字符串拼接，避免参数化查询的类型问题
    sql += ' LIMIT ' + offset + ', ' + size
    
    const rows = await mysql.execute(sql, params)
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM user WHERE 1=1' + (key ? ' AND (student_id LIKE ? OR username LIKE ?)' : '') + ' AND (role IS NULL OR role != 1)'
    const countParams = key ? [`%${key}%`, `%${key}%`] : []
    const countRows = await mysql.execute(countSql, countParams)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 更新用户头像
  static async updateAvatar(userId, avatarUrl) {
    const sql = 'UPDATE user SET avatar = ? WHERE id = ?'
    await mysql.execute(sql, [avatarUrl, userId])
  }

  // 更新待审核头像
  static async updatePendingAvatar(userId, pendingAvatarUrl) {
    const sql = 'UPDATE user SET pending_avatar = ?, avatar_status = 1 WHERE id = ?'
    await mysql.execute(sql, [pendingAvatarUrl, userId])
  }

  // 审核通过头像
  static async approveAvatar(userId) {
    const sql = 'UPDATE user SET avatar = pending_avatar, pending_avatar = \'\', avatar_status = 2 WHERE id = ?'
    await mysql.execute(sql, [userId])
  }

  // 更新头像状态
  static async updateAvatarStatus(userId, status) {
    const sql = 'UPDATE user SET avatar_status = ? WHERE id = ?'
    await mysql.execute(sql, [status, userId])
  }

  // 更新头像审核信息
  static async updateAvatarAuditInfo(userId, status, auditUserId = null, rejectReason = '') {
    const sql = `
      UPDATE user 
      SET avatar_status = ?, avatar_audit_user_id = ?, avatar_reject_reason = ?
      WHERE id = ?
    `
    await mysql.execute(sql, [status, auditUserId, rejectReason, userId])
  }

  // 获取待审核的头像列表
  static async getPendingAuditAvatars(pageNum = 1, pageSize = 10) {
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    
    const sql = `
      SELECT 
        id,
        student_id,
        username,
        avatar,
        pending_avatar,
        avatar_status,
        avatar_audit_user_id,
        avatar_reject_reason
      FROM user
      WHERE avatar_status = 1
      ORDER BY id DESC
      LIMIT ${offset}, ${size}
    `
    const rows = await mysql.execute(sql)
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM user WHERE avatar_status = 1'
    const countRows = await mysql.execute(countSql)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 根据头像状态获取用户列表（用于管理员）
  static async getUsersByAvatarStatus(status, pageNum = 1, pageSize = 10) {
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    
    const sql = `
      SELECT 
        id,
        student_id,
        username,
        avatar,
        pending_avatar,
        avatar_status,
        avatar_audit_user_id,
        avatar_reject_reason
      FROM user
      WHERE avatar_status = ?
      ORDER BY id DESC
      LIMIT ${offset}, ${size}
    `
    const rows = await mysql.execute(sql, [status])
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM user WHERE avatar_status = ?'
    const countRows = await mysql.execute(countSql, [status])
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 统计活跃用户数（最近7天内有发帖或评论的用户）
  static async countActiveUsers() {
    const sql = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM user u
      WHERE u.status = 1
      AND (
        EXISTS (
          SELECT 1 FROM post p 
          WHERE p.user_id = u.id 
          AND p.create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        )
        OR EXISTS (
          SELECT 1 FROM comment c 
          WHERE c.user_id = u.id 
          AND c.create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        )
      )
    `
    const rows = await mysql.execute(sql)
    return rows[0]
  }
}

module.exports = UserModel