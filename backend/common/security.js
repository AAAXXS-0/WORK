const xss = require('xss')
const crypto = require('crypto')

// XSS过滤
const filterXss = (content) => {
  if (!content) return ''
  return xss(content)
}

// SQL注入过滤
const filterSql = (content) => {
  if (!content) return ''
  // 简单过滤SQL关键字
  const sqlKeywords = /select|insert|update|delete|drop|truncate|exec|union|join|where/i
  return content.replace(sqlKeywords, '')
}

// 数据脱敏（手机号/学号）
const desensitize = (value, type) => {
  if (!value) return ''
  switch (type) {
    // 学号脱敏：前2位+后2位，中间用*代替
    case 'studentId':
      return value.replace(/(\d{2})\d+(\d{2})/, '$1****$2')
    // 手机号脱敏：138****1234
    case 'phone':
      return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    default:
      return value
  }
}

// 密码加密
const encryptPassword = (password) => {
  const salt = 'campus-wall-salt'
  return crypto.createHash('md5')
    .update(password + salt)
    .digest('hex')
}

module.exports = {
  filterXss,
  filterSql,
  desensitize,
  encryptPassword
}