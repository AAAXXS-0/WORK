const mysql = require('mysql2/promise')
const config = require('../../common/config')
const logger = require('../../common/logger')

// 创建连接池
const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// 执行SQL
const execute = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (err) {
    logger.error(`SQL执行失败：${sql}，参数：${JSON.stringify(params)}，错误：${err.message}`)
    throw err
  }
}

module.exports = {
  execute,
  pool
}