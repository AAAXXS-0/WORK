const OSS = require('ali-oss')
const config = require('../../common/config')
const logger = require('../../common/logger')

// 创建OSS客户端
const client = new OSS({
  region: config.oss.region,
  accessKeyId: config.oss.accessKeyId,
  accessKeySecret: config.oss.accessKeySecret,
  bucket: config.oss.bucket
})

// 上传文件（支持文件路径或内存buffer）
const upload = async (filePathOrBuffer, fileName) => {
  try {
    // 生成唯一文件名
    const uniqueName = `${Date.now()}-${fileName}`
    
    // 判断是文件路径还是buffer
    if (Buffer.isBuffer(filePathOrBuffer)) {
      // 从内存buffer上传
      const result = await client.put(uniqueName, filePathOrBuffer)
      logger.info(`文件上传成功（buffer）：${result.url}`)
      return result.url
    } else {
      // 从文件路径上传
      const result = await client.put(uniqueName, filePathOrBuffer)
      logger.info(`文件上传成功（path）：${result.url}`)
      return result.url
    }
  } catch (err) {
    logger.error(`文件上传失败：${err.message}`)
    throw err
  }
}

// 删除文件
const remove = async (fileName) => {
  try {
    await client.delete(fileName)
    logger.info(`文件删除成功：${fileName}`)
  } catch (err) {
    logger.error(`文件删除失败：${err.message}`)
    throw err
  }
}

module.exports = {
  upload,
  remove
}