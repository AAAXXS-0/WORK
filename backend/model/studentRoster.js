const mysql = require('../dao/mysql')

// 学生花名册模型
class StudentRosterModel {
  // 根据学号查询学生
  static async findByStudentId(studentId) {
    const sql = 'SELECT * FROM student_roster WHERE student_id = ?'
    const rows = await mysql.execute(sql, [studentId])
    return rows[0]
  }

  // 根据学号和验证码查询学生
  static async findByStudentIdAndCode(studentId, verifyCode) {
    const sql = 'SELECT * FROM student_roster WHERE student_id = ? AND verify_code = ?'
    const rows = await mysql.execute(sql, [studentId, verifyCode])
    return rows[0]
  }

  // 更新注册状态
  static async updateRegistered(studentId) {
    const sql = 'UPDATE student_roster SET is_registered = 1 WHERE student_id = ?'
    await mysql.execute(sql, [studentId])
  }

  // 创建学生记录（管理员导入用）
  static async create(student) {
    const sql = `
      INSERT INTO student_roster (name, student_id, verify_code)
      VALUES (?, ?, ?)
    `
    const result = await mysql.execute(sql, [student.name, student.studentId, student.verifyCode])
    return result.insertId
  }

  // 批量创建学生记录
  static async batchCreate(students) {
    if (!students || students.length === 0) {
      return 0
    }
    
    // 构建占位符：(?,?,?), (?,?,?), ...
    const placeholders = students.map(() => '(?, ?, ?)').join(', ')
    // 将所有值扁平化为一维数组
    const params = students.flatMap(s => [s.name, s.studentId, s.verifyCode])
    
    const sql = `
      INSERT INTO student_roster (name, student_id, verify_code)
      VALUES ${placeholders}
    `
    
    const result = await mysql.execute(sql, params)
    return result.affectedRows
  }

  // 获取花名册列表
  static async list(key, pageNum, pageSize) {
    let sql = 'SELECT * FROM student_roster WHERE 1=1'
    const params = []
    
    // 确保分页参数是数字类型
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    
    if (key) {
      sql += ' AND (student_id LIKE ? OR name LIKE ?)'
      params.push(`%${key}%`, `%${key}%`)
    }
    // 使用字符串拼接，避免参数化查询的类型问题
    sql += ' ORDER BY create_time DESC LIMIT ' + offset + ', ' + size
    
    const rows = await mysql.execute(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM student_roster WHERE 1=1'
    const countParams = []
    if (key) {
      countSql += ' AND (student_id LIKE ? OR name LIKE ?)'
      countParams.push(`%${key}%`, `%${key}%`)
    }
    const countRows = await mysql.execute(countSql, countParams)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }
}

module.exports = StudentRosterModel