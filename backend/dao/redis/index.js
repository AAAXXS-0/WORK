// const redis = require('redis');
// const config = require('../../common/config');
// const logger = require('../../common/logger');

// // 创建客户端（新版 Redis 客户端写法）
// const client = redis.createClient({
//   url: `redis://${config.redis.host}:${config.redis.port}`,
//   password: config.redis.password,
//   database: config.redis.db
// });

// // 监听错误
// client.on('error', (err) => {
//   logger.error(`Redis连接错误：${err.message}`);
// });

// // 连接成功
// client.on('connect', () => {
//   logger.info('Redis连接成功');
// });

// // 连接客户端
// client.connect();

// module.exports = {
//   get: (key) => client.get(key),
//   set: (key, value, ttl) => client.set(key, value, { EX: ttl }),
//   del: (key) => client.del(key),
//   lpush: (key, value) => client.lPush(key, value),
//   rpop: (key) => client.rPop(key),
//   incr: (key) => client.incr(key),
//   expire: (key, ttl) => client.expire(key, ttl)
// };
// 完全空实现，不连接 Redis，避免报错
module.exports = {
  get: async () => null,
  set: async () => {},
  del: async () => {},
  lpush: async () => {},
  rpop: async () => null,
  incr: async () => 1,
  expire: async () => {}
};