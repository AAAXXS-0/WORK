const mysql = require('../dao/mysql')

// 系统配置模型
class SystemConfigModel {
  // 根据配置键获取配置值
  static async getByKey(key) {
    const sql = 'SELECT * FROM system_config WHERE config_key = ?'
    const rows = await mysql.execute(sql, [key])
    if (rows.length === 0) return null
    
    const config = rows[0]
    return this.parseValue(config.config_value, config.config_type)
  }

  // 获取所有配置
  static async getAll() {
    const sql = 'SELECT * FROM system_config ORDER BY id'
    const rows = await mysql.execute(sql)
    const result = {}
    rows.forEach(row => {
      result[row.config_key] = this.parseValue(row.config_value, row.config_type)
    })
    return result
  }

  // 获取配置列表（带分页）
  static async list(pageNum, pageSize) {
    const sql = 'SELECT * FROM system_config ORDER BY id'
    const page = parseInt(pageNum) || 1
    const size = parseInt(pageSize) || 10
    const offset = (page - 1) * size
    const sqlWithPage = sql + ' LIMIT ' + offset + ', ' + size
    
    const rows = await mysql.execute(sqlWithPage)
    
    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM system_config'
    const countRows = await mysql.execute(countSql)
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }

  // 设置配置值
  static async set(key, value, type = 'string') {
    const stringValue = this.stringifyValue(value, type)
    
    // 检查配置是否存在
    const sql = 'SELECT id FROM system_config WHERE config_key = ?'
    const rows = await mysql.execute(sql, [key])
    
    if (rows.length > 0) {
      // 更新
      const updateSql = 'UPDATE system_config SET config_value = ?, config_type = ? WHERE config_key = ?'
      await mysql.execute(updateSql, [stringValue, type, key])
    } else {
      // 插入
      const insertSql = 'INSERT INTO system_config (config_key, config_value, config_type) VALUES (?, ?, ?)'
      await mysql.execute(insertSql, [key, stringValue, type])
    }
  }

  // 批量设置配置
  static async batchSet(configs) {
    if (!configs || Object.keys(configs).length === 0) return
    
    for (const [key, value] of Object.entries(configs)) {
      let type = 'string'
      if (typeof value === 'number') {
        type = 'number'
      } else if (typeof value === 'boolean') {
        type = 'boolean'
      } else if (typeof value === 'object') {
        type = 'json'
      }
      await this.set(key, value, type)
    }
  }

  // 删除配置
  static async delete(key) {
    const sql = 'DELETE FROM system_config WHERE config_key = ?'
    await mysql.execute(sql, [key])
  }

  // 解析配置值
  static parseValue(value, type) {
    if (value === null || value === undefined) return null
    
    switch (type) {
      case 'number':
        return parseFloat(value)
      case 'boolean':
        return value === 'true' || value === true || value === 1
      case 'json':
        try {
          return JSON.parse(value)
        } catch (e) {
          console.error('解析JSON配置失败:', e)
          return null
        }
      case 'string':
      default:
        return String(value)
    }
  }

  // 序列化配置值
  static stringifyValue(value, type) {
    switch (type) {
      case 'number':
        return String(value)
      case 'boolean':
        return value ? 'true' : 'false'
      case 'json':
        return JSON.stringify(value)
      case 'string':
      default:
        return String(value)
    }
  }

  // 获取AI审核配置
  static async getAiConfig() {
    const configs = await this.getAll()
    return {
      level: configs.ai_audit_level || 'medium',
      checkImage: configs.ai_check_image !== false,
      timeoutToManual: configs.ai_timeout_to_manual !== false,
      timeout: configs.ai_timeout || 3000
    }
  }

  // 设置AI审核配置
  static async setAiConfig(config) {
    const configs = {
      ai_audit_level: config.level || 'medium',
      ai_check_image: config.checkImage !== false,
      ai_timeout_to_manual: config.timeoutToManual !== false,
      ai_timeout: config.timeout || 3000
    }
    await this.batchSet(configs)
  }
}

module.exports = SystemConfigModel
