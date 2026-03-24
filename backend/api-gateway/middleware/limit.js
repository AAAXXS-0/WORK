const redis = require('../../dao/redis')
const config = require('../../common/config')
const { BusinessException } = require('../../common/exception')

// 接口限流中间件
const limitMiddleware = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress
  const key = `limit:${ip}`
  
  // 自增计数
  const count = await redis.incr(key)
  // 设置过期时间
  if (count === 1) {
    await redis.expire(key, config.limit.expire)
  }
  
  // 判断是否超过限制
  if (count > config.limit.max) {
    throw new BusinessException(429, '请求过于频繁，请稍后再试')
  }
  
  next()
}

module.exports = limitMiddleware