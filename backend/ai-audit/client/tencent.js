const tencentcloud = require('tencentcloud-sdk-nodejs')
const config = require('../../common/config')
const logger = require('../../common/logger')

// 初始化腾讯云客户端
const TmsClient = tencentcloud.tms.v20200713.Client
const clientConfig = {
  credential: {
    secretId: config.ai.tencent.secretId,
    secretKey: config.ai.tencent.secretKey,
  },
  region: config.ai.tencent.region,
  profile: {
    httpProfile: {
      timeout: config.ai.timeout / 1000, // 秒
    },
  },
}
const client = new TmsClient(clientConfig)

// 文本审核
const textAudit = async (content) => {
  try {
    const params = {
      Content: Buffer.from(content).toString('base64'),
    }
    const result = await client.TextModeration(params)
    
    if (result.Suggestion === 'Pass') {
      return { status: '合规', confidence: result.Score }
    } else if (result.Suggestion === 'Block') {
      return { status: '违规', confidence: result.Score, reason: result.Label }
    } else {
      return { status: '存疑', confidence: result.Score, reason: result.Label }
    }
  } catch (err) {
    logger.error(`腾讯云文本审核失败：${err.message}`)
    throw err
  }
}

// 图片审核
const imageAudit = async (imageUrl) => {
  try {
    const ImsClient = tencentcloud.ims.v20201229.Client
    const imsClient = new ImsClient(clientConfig)
    const params = {
      FileUrl: imageUrl,
    }
    const result = await imsClient.ImageModeration(params)
    
    if (result.Suggestion === 'Pass') {
      return { status: '合规', confidence: result.Score }
    } else if (result.Suggestion === 'Block') {
      return { status: '违规', confidence: result.Score, reason: result.Label }
    } else {
      return { status: '存疑', confidence: result.Score, reason: result.Label }
    }
  } catch (err) {
    logger.error(`腾讯云图片审核失败：${err.message}`)
    throw err
  }
}

module.exports = {
  textAudit,
  imageAudit
}