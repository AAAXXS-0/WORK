const axios = require('axios')
const config = require('../../common/config')
const logger = require('../../common/logger')

// 获取百度AI AccessToken
const getAccessToken = async () => {
  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.ai.baidu.apiKey}&client_secret=${config.ai.baidu.secretKey}`
  const res = await axios.post(url)
  return res.data.access_token
}

// 文本审核
const textAudit = async (content) => {
  try {
    const token = await getAccessToken()
    const url = `https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined?access_token=${token}`
    const res = await axios.post(url, { text: content }, { timeout: config.ai.timeout })
    
    const result = res.data
    if (result.conclusionType === 1) {
      // 合规
      return { status: '合规', confidence: 100 }
    } else if (result.conclusionType === 2) {
      // 违规
      return { status: '违规', confidence: 100, reason: result.conclusion }
    } else {
      // 存疑
      return { status: '存疑', confidence: 80, reason: result.conclusion }
    }
  } catch (err) {
    logger.error(`百度AI文本审核失败：${err.message}`)
    throw err
  }
}

// 图片审核
const imageAudit = async (imageUrl) => {
  try {
    const token = await getAccessToken()
    const url = `https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=${token}`
    const res = await axios.post(url, { imgUrl: imageUrl }, { timeout: config.ai.timeout })
    
    const result = res.data
    if (result.conclusionType === 1) {
      return { status: '合规', confidence: 100 }
    } else if (result.conclusionType === 2) {
      return { status: '违规', confidence: 100, reason: result.conclusion }
    } else {
      return { status: '存疑', confidence: 80, reason: result.conclusion }
    }
  } catch (err) {
    logger.error(`百度AI图片审核失败：${err.message}`)
    throw err
  }
}

module.exports = {
  textAudit,
  imageAudit
}