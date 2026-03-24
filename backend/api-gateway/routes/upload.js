const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const logger = require('../../common/logger')
const { BusinessException } = require('../../common/exception')
const { ErrorCode } = require('../../common/errorCode')

// 确保uploads目录存在
const uploadDir = path.join(__dirname, '../../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  logger.info(`创建上传目录：${uploadDir}`)
}

// 确保avatars目录存在（专门存放头像）
const avatarDir = path.join(__dirname, '../../../uploads/avatars')
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true })
  logger.info(`创建头像上传目录：${avatarDir}`)
}

// 配置multer本地存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳-随机数-原始文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

// 配置multer头像存储
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳-随机数-原始文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制10MB
  }
})

// 头像上传
const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制10MB
  }
})

// 图片上传（帖子图片）
router.post('/img', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file
    if (!file) {
      throw new BusinessException(ErrorCode.UPLOAD_FILE_EMPTY)
    }
    
    // 返回本地访问URL
    const url = `/uploads/${file.filename}`
    logger.info(`文件上传成功：${file.originalname} -> ${file.filename}`)
    
    res.json({ code: 0, msg: '上传成功', data: { url } })
  } catch (err) {
    next(err)
  }
})

// 头像上传
router.post('/avatar', uploadAvatar.single('file'), async (req, res, next) => {
  try {
    const file = req.file
    if (!file) {
      throw new BusinessException(ErrorCode.UPLOAD_FILE_EMPTY)
    }
    
    // 返回本地访问URL
    const url = `/uploads/avatars/${file.filename}`
    logger.info(`头像上传成功：${file.originalname} -> ${file.filename}`)
    
    res.json({ code: 0, msg: '上传成功', data: { url } })
  } catch (err) {
    next(err)
  }
})

module.exports = router