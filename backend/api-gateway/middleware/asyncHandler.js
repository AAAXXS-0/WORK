/**
 * 异步错误处理中间件
 * 用于包装 Express 异步路由处理器，自动捕获异步错误
 * 使用方式：router.get('/path', asyncHandler(async (req, res) => { ... }))
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = { asyncHandler }
