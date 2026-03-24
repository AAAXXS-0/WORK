const logger = require('./logger')
const { ErrorCode, getErrorByCode } = require('./errorCode')

/**
 * 业务异常类
 * 支持错误码和自定义消息
 */
class BusinessException extends Error {
  /**
   * @param {number|string} codeOrKey 错误码或错误key
   * @param {string} customMsg 自定义错误消息（可选）
   */
  constructor(codeOrKey, customMsg = null) {
    let errorInfo
    
    if (typeof codeOrKey === 'string') {
      // 传入的是错误key
      errorInfo = getErrorByCode(ErrorCode[codeOrKey]?.code) || ErrorCode.SYSTEM_ERROR
      super(customMsg || errorInfo.msg)
      this.code = errorInfo.code
      this.httpStatus = errorInfo.httpStatus
    } else if (typeof codeOrKey === 'object') {
      // 传入的是错误对象 { code, msg, httpStatus }
      super(customMsg || codeOrKey.msg)
      this.code = codeOrKey.code
      this.httpStatus = codeOrKey.httpStatus || 500
    } else {
      // 传入的是数字错误码
      super(customMsg || '服务器内部错误')
      this.code = codeOrKey || 70001
      this.httpStatus = 500
    }
    
    this.name = 'BusinessException'
  }
}

/**
 * 参数异常类（快捷创建参数错误）
 */
class ParamException extends BusinessException {
  constructor(msg = '参数错误') {
    super(ErrorCode.PARAM_INVALID, msg)
    this.name = 'ParamException'
  }
}

/**
 * 认证异常类（快捷创建认证错误）
 */
class AuthException extends BusinessException {
  constructor(msg = '认证失败') {
    super(ErrorCode.AUTH_NOT_LOGIN, msg)
    this.name = 'AuthException'
  }
}

/**
 * 权限异常类（快捷创建权限错误）
 */
class PermissionException extends BusinessException {
  constructor(msg = '无操作权限') {
    super(ErrorCode.AUTH_NO_PERMISSION, msg)
    this.name = 'PermissionException'
  }
}

/**
 * 全局异常处理中间件
 */
const exceptionHandler = (err, req, res, next) => {
  // 记录错误日志
  const errorInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    }
  }
  
  // 判断错误类型
  if (err instanceof BusinessException) {
    // 业务异常，记录warn级别
    logger.warn(`业务异常: [${err.code}] ${err.message}`, errorInfo)
    
    res.status(err.httpStatus || 400).json({
      code: err.code,
      msg: err.message,
      data: null
    })
  } else if (err.name === 'UnauthorizedError') {
    // JWT验证失败
    logger.warn(`JWT验证失败: ${err.message}`, errorInfo)
    
    res.status(401).json({
      code: 21002,
      msg: 'Token无效或已过期',
      data: null
    })
  } else if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    // JSON解析错误
    logger.warn(`请求体解析错误: ${err.message}`, errorInfo)
    
    res.status(400).json({
      code: 10002,
      msg: '请求体格式错误',
      data: null
    })
  } else {
    // 未知异常，记录error级别
    logger.error(`系统异常: ${err.message}`, errorInfo)
    
    // 生产环境不暴露详细错误信息
    const isDev = process.env.NODE_ENV !== 'production'
    res.status(500).json({
      code: 70001,
      msg: isDev ? err.message : '系统繁忙，请稍后重试',
      data: null
    })
  }
}

/**
 * 404处理中间件
 */
const notFoundHandler = (req, res, next) => {
  const error = new BusinessException(ErrorCode.PARAM_INVALID, `接口不存在: ${req.method} ${req.originalUrl}`)
  error.httpStatus = 404
  next(error)
}

/**
 * 异步路由包装器，自动捕获异步错误
 * @param {Function} fn 异步路由处理函数
 * @returns {Function} 包装后的路由处理函数
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = {
  BusinessException,
  ParamException,
  AuthException,
  PermissionException,
  exceptionHandler,
  notFoundHandler,
  asyncHandler
}