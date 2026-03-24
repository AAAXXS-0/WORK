const mysql = require('../dao/mysql')

// 敏感词模型
class SensitiveWordModel {
  // 获取所有启用的敏感词
  static async getAll() {
    const sql = 'SELECT word FROM sensitive_word WHERE status = 1 ORDER BY id'
    const rows = await mysql.execute(sql)
    return rows.map(row => row.word)
  }

  // 获取敏感词列表（带分页和状态）
  static async list(status, pageNum, pageSize) {
    let sql = 'SELECT * FROM sensitive_word WHERE 1=1'
    const params = []
    if (status !== undefined) {
      sql += ' AND status = ?'
      params.push(status)
    }
    sql += ' ORDER BY id DESC'
    
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    sql += ' LIMIT ' + offset + ', ' + size
    
    const rows = await mysql.execute(sql, params)
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM sensitive_word WHERE 1=1' + (status !== undefined ? ' AND status = ?' : '')
    const countParams = status !== undefined ? [status] : []
    const countRows = await mysql.execute(countSql, countParams)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 添加敏感词
  static async create(word) {
    const sql = 'INSERT INTO sensitive_word (word) VALUES (?)'
    const result = await mysql.execute(sql, [word])
    return result.insertId
  }

  // 批量添加敏感词
  static async batchCreate(words) {
    if (!words || words.length === 0) return 0
    
    const values = words.map(() => '(?)').join(',')
    const sql = `INSERT INTO sensitive_word (word) VALUES ${values}`
    const result = await mysql.execute(sql, words)
    return result.affectedRows
  }

  // 删除敏感词
  static async delete(id) {
    const sql = 'DELETE FROM sensitive_word WHERE id = ?'
    await mysql.execute(sql, [id])
  }

  // 批量删除敏感词
  static async batchDelete(ids) {
    if (!ids || ids.length === 0) return 0
    
    const placeholders = ids.map(() => '?').join(',')
    const sql = `DELETE FROM sensitive_word WHERE id IN (${placeholders})`
    const result = await mysql.execute(sql, ids)
    return result.affectedRows
  }

  // 更新敏感词状态
  static async updateStatus(id, status) {
    const sql = 'UPDATE sensitive_word SET status = ? WHERE id = ?'
    await mysql.execute(sql, [status, id])
  }

  // 根据内容检查是否包含敏感词
  static async checkContent(content) {
    const words = await this.getAll()
    for (const word of words) {
      if (content.includes(word)) {
        return {
          hasSensitive: true,
          word: word
        }
      }
    }
    return {
      hasSensitive: false,
      word: null
    }
  }
}

module.exports = SensitiveWordModel
