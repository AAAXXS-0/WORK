module.exports = {
    // 服务器配置
    server: {
      port: 3000,
      host: 'localhost'
    },
    // MySQL配置
    mysql: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'web_databases_wall',
      charset: 'utf8mb4' // ✅ 强制指定 utf8mb4 编码
    },
    // Redis配置
    redis: {
      host: 'localhost',
      port: 6379,
      password: '',
      db: 0
    },
    // OSS配置（阿里云）
    oss: {
      accessKeyId: 'your-accessKeyId',
      accessKeySecret: 'your-accessKeySecret',
      bucket: 'campus-wall',
      region: 'oss-cn-hangzhou'
    },
    // AI审核配置
    ai: {
      // 百度AI配置
      baidu: {
        apiKey: 'your-apiKey',
        secretKey: 'your-secretKey'
      },
      // 腾讯云AI配置
      tencent: {
        secretId: 'your-secretId',
        secretKey: 'your-secretKey',
        region: 'ap-guangzhou'
      },
      // 审核严格度：low/medium/high
      level: 'medium',
      // 超时时间（毫秒）
      timeout: 3000
    },
    // 限流配置
    limit: {
      // 每分钟请求数
      max: 60,
      // 过期时间（秒）
      expire: 60
    },
    jwt: {
      secret: 'your-jwt-secret-key', // 随便写一个复杂字符串当密钥
      expiresIn: '7d' // 7天过期，和 auth.js 里保持一致
    }
  }