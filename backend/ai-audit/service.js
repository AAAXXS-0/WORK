const baiduAi = require('./client/baidu')
const tencentAi = require('./client/tencent')
const config = require('../common/config')
const logger = require('../common/logger')
const { BusinessException } = require('../common/exception')
const SensitiveWordModel = require('../model/sensitive-word')

// 本地敏感词校验
const checkLocalSensitiveWord = async (content) => {
  try {
    // 从数据库获取敏感词列表
    const sensitiveWords = await SensitiveWordModel.getAll()
    for (const word of sensitiveWords) {
      if (content.includes(word)) {
        return { status: '违规', reason: `包含敏感词：${word}` }
      }
    }
    return { status: '合规' }
  } catch (error) {
    logger.error('获取敏感词列表失败:', error)
    // 如果获取失败，返回合规，避免影响正常流程
    return { status: '合规' }
  }
}

// AI审核主函数
const audit = async (content, images = []) => {
  try {
    // 1. 本地敏感词校验
    const localCheck = await checkLocalSensitiveWord(content)
    if (localCheck.status === '违规') {
      logger.info(`本地敏感词校验违规：${localCheck.reason}`)
      return localCheck
    }

    // 2. AI文本审核
    let aiResult
    if (config.ai.provider === 'baidu') {
      aiResult = await baiduAi.textAudit(content)
    } else {
      aiResult = await tencentAi.textAudit(content)
    }

    // 3. 如果配置了图片审核，且有图片，则进行图片审核
    if (config.ai.checkImage && images.length > 0) {
      for (const img of images) {
        let imgResult
        if (config.ai.provider === 'baidu') {
          imgResult = await baiduAi.imageAudit(img)
        } else {
          imgResult = await tencentAi.imageAudit(img)
        }
        // 图片违规则直接返回违规
        if (imgResult.status === '违规') {
          return imgResult
        }
        // 图片存疑则返回存疑
        if (imgResult.status === '存疑') {
          aiResult.status = '存疑'
          aiResult.reason = `${aiResult.reason || ''}，图片存疑`
        }
      }
    }

    // 4. 根据审核严格度调整结果
    if (config.ai.level === 'high' && aiResult.confidence < 90) {
      aiResult.status = '存疑'
    }

    logger.info(`AI审核完成，结果：${aiResult.status}`)
    return aiResult
  } catch (err) {
    logger.error(`AI审核失败：${err.message}`)
    // AI接口异常，返回存疑，转人工审核
    return { status: '存疑', reason: 'AI审核接口异常' }
  }
}

module.exports = {
  audit
}