const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const config = require('./common/config')
const logger = require('./common/logger')
const { exceptionHandler } = require('./common/exception')
const limitMiddleware = require('./api-gateway/middleware/limit')

// 全局中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// 静态文件服务 - uploads目录（指向项目根目录的uploads）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 限流中间件
app.use(limitMiddleware)

// 路由注册
app.use('/api/auth', require('./api-gateway/routes/auth'))
app.use('/api/post', require('./api-gateway/routes/post'))
app.use('/api/admin', require('./api-gateway/routes/admin'))
app.use('/api/comment', require('./api-gateway/routes/comment'))
app.use('/api/upload', require('./api-gateway/routes/upload'))
app.use('/api/view-history', require('./api-gateway/routes/viewHistory'))

// 全局异常处理
app.use(exceptionHandler)

// 启动服务
app.listen(config.server.port, config.server.host, () => {
  logger.info(`校园墙后端服务启动成功：http://${config.server.host}:${config.server.port}`)
})