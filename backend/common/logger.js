const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')

// 日志目录
const logDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 日志级别
const LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
}

// 写入日志
const writeLog = (level, message) => {
  const date = dayjs().format('YYYY-MM-DD')
  const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const logPath = path.join(logDir, `${date}.log`)
  const logContent = `[${time}] [${level}] ${message}\n`
  
  // 追加写入日志文件
  fs.appendFile(logPath, logContent, (err) => {
    if (err) console.error('写入日志失败：', err)
  })
  
  // 控制台输出
  console.log(logContent.trim())
}

module.exports = {
  info: (message) => writeLog(LEVELS.INFO, message),
  warn: (message) => writeLog(LEVELS.WARN, message),
  error: (message) => writeLog(LEVELS.ERROR, message),
  debug: (message) => writeLog(LEVELS.DEBUG, message)
}