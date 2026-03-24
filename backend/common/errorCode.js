/**
 * 统一错误码定义
 * 格式：B[模块][类型][序号]
 * 模块：1-通用，2-用户，3-帖子，4-评论，5-上传，6-审核，7-系统
 * 类型：0-参数错误，1-认证错误，2-权限错误，3-业务错误，4-数据错误
 */

const ErrorCode = {
  // ========== 通用错误 1xxxx ==========
  PARAM_EMPTY: { code: 10001, msg: '参数不能为空', httpStatus: 400 },
  PARAM_INVALID: { code: 10002, msg: '参数格式不正确', httpStatus: 400 },
  PARAM_MISSING: { code: 10003, msg: '缺少必要参数', httpStatus: 400 },
  
  // ========== 用户模块 2xxxx ==========
  USER_NOT_FOUND: { code: 20001, msg: '用户不存在', httpStatus: 404 },
  USER_PASSWORD_ERROR: { code: 20002, msg: '密码错误', httpStatus: 401 },
  USER_BANNED: { code: 20003, msg: '账号已被封禁', httpStatus: 403 },
  USER_ALREADY_EXISTS: { code: 20004, msg: '用户已存在', httpStatus: 400 },
  USER_AUTH_FAILED: { code: 20005, msg: '校园认证失败', httpStatus: 400 },
  USER_STUDENT_ID_EMPTY: { code: 20006, msg: '学号不能为空', httpStatus: 400 },
  USER_CARD_ID_EMPTY: { code: 20007, msg: '一卡通号不能为空', httpStatus: 400 },
  
  // ========== 注册错误 22xxx ==========
  REGISTER_STUDENT_NOT_FOUND: { code: 22001, msg: '学号不存在，请确认后重试', httpStatus: 400 },
  REGISTER_VERIFY_CODE_ERROR: { code: 22002, msg: '验证码错误', httpStatus: 400 },
  REGISTER_ALREADY_DONE: { code: 22003, msg: '该学号已完成注册，请直接登录', httpStatus: 400 },
  REGISTER_PASSWORD_NOT_MATCH: { code: 22004, msg: '两次密码输入不一致', httpStatus: 400 },
  REGISTER_PASSWORD_EMPTY: { code: 22005, msg: '密码不能为空', httpStatus: 400 },
  REGISTER_PASSWORD_TOO_SHORT: { code: 22006, msg: '密码长度不能少于6位', httpStatus: 400 },
  
  // ========== 花名册错误 23xxx ==========
  ROSTER_FORMAT_ERROR: { code: 23001, msg: 'Excel格式错误，必须包含"姓名"、"学号"、"统一验证码"三列', httpStatus: 400 },
  
  // ========== 认证错误 21xxx ==========
  AUTH_NOT_LOGIN: { code: 21001, msg: '未登录，请先登录', httpStatus: 401 },
  AUTH_TOKEN_INVALID: { code: 21002, msg: 'Token无效或已过期', httpStatus: 401 },
  AUTH_TOKEN_EXPIRED: { code: 21003, msg: '登录已过期，请重新登录', httpStatus: 401 },
  AUTH_NO_PERMISSION: { code: 21004, msg: '无操作权限', httpStatus: 403 },
  AUTH_ADMIN_REQUIRED: { code: 21005, msg: '需要管理员权限', httpStatus: 403 },
  
  // ========== 帖子模块 3xxxx ==========
  POST_NOT_FOUND: { code: 30001, msg: '帖子不存在', httpStatus: 404 },
  POST_CONTENT_EMPTY: { code: 30002, msg: '帖子内容不能为空', httpStatus: 400 },
  POST_CONTENT_TOO_LONG: { code: 30003, msg: '帖子内容过长', httpStatus: 400 },
  POST_ALREADY_DELETED: { code: 30004, msg: '帖子已被删除', httpStatus: 400 },
  POST_NO_PERMISSION: { code: 30005, msg: '无权操作此帖子', httpStatus: 403 },
  
  // ========== 评论模块 4xxxx ==========
  COMMENT_NOT_FOUND: { code: 40001, msg: '评论不存在', httpStatus: 404 },
  COMMENT_CONTENT_EMPTY: { code: 40002, msg: '评论内容不能为空', httpStatus: 400 },
  COMMENT_CONTENT_TOO_LONG: { code: 40003, msg: '评论内容过长', httpStatus: 400 },
  
  // ========== 上传模块 5xxxx ==========
  UPLOAD_FILE_EMPTY: { code: 50001, msg: '上传文件不能为空', httpStatus: 400 },
  UPLOAD_FILE_TOO_LARGE: { code: 50002, msg: '文件大小超过限制', httpStatus: 400 },
  UPLOAD_FILE_TYPE_ERROR: { code: 50003, msg: '文件类型不支持', httpStatus: 400 },
  UPLOAD_FAILED: { code: 50004, msg: '文件上传失败', httpStatus: 500 },
  
  // ========== 审核模块 6xxxx ==========
  AUDIT_ACTION_INVALID: { code: 60001, msg: '审核操作无效，只能是pass或reject', httpStatus: 400 },
  AUDIT_POST_NOT_WAITING: { code: 60002, msg: '帖子不在待审核状态', httpStatus: 400 },
  AUDIT_REASON_REQUIRED: { code: 60003, msg: '驳回原因不能为空', httpStatus: 400 },
  
  // ========== 系统错误 7xxxx ==========
  SYSTEM_ERROR: { code: 70001, msg: '系统繁忙，请稍后重试', httpStatus: 500 },
  SYSTEM_DB_ERROR: { code: 70002, msg: '数据库操作失败', httpStatus: 500 },
  SYSTEM_REDIS_ERROR: { code: 70003, msg: '缓存服务异常', httpStatus: 500 },
  SYSTEM_AI_ERROR: { code: 70004, msg: 'AI审核服务异常', httpStatus: 500 },
  SYSTEM_OSS_ERROR: { code: 70005, msg: '文件存储服务异常', httpStatus: 500 },
  SYSTEM_RATE_LIMIT: { code: 70006, msg: '请求过于频繁，请稍后重试', httpStatus: 429 }
}

/**
 * 根据错误码获取错误信息
 * @param {number} code 错误码
 * @returns {object} 错误信息对象
 */
const getErrorByCode = (code) => {
  for (const key in ErrorCode) {
    if (ErrorCode[key].code === code) {
      return ErrorCode[key]
    }
  }
  return ErrorCode.SYSTEM_ERROR
}

/**
 * 根据错误key获取错误信息
 * @param {string} key 错误key
 * @param {string} customMsg 自定义错误信息（可选）
 * @returns {object} 错误信息对象
 */
const getError = (key, customMsg = null) => {
  const error = ErrorCode[key]
  if (!error) {
    return ErrorCode.SYSTEM_ERROR
  }
  return {
    code: error.code,
    msg: customMsg || error.msg,
    httpStatus: error.httpStatus
  }
}

module.exports = {
  ErrorCode,
  getErrorByCode,
  getError
}