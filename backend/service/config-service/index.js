const SensitiveWordModel = require('../../model/sensitive-word')
const SystemConfigModel = require('../../model/system-config')
const logger = require('../../common/logger')
const { BusinessException } = require('../../common/exception')
const { ErrorCode } = require('../../common/errorCode')

// 配置服务
class ConfigService {
  // 获取敏感词列表
  static async getSensitiveWordList(status, pageNum, pageSize) {
    try {
      const result = await SensitiveWordModel.list(status, pageNum, pageSize)
      return result
    } catch (error) {
      logger.error('获取敏感词列表失败:', error)
      throw new BusinessException(ErrorCode.SYSTEM_ERROR, '获取敏感词列表失败')
    }
  }

  // 添加敏感词
  static async addSensitiveWord(word) {
    if (!word || word.trim() === '') {
      throw new BusinessException(ErrorCode.PARAM_EMPTY, '敏感词不能为空')
    }

    try {
      const id = await SensitiveWordModel.create(word.trim())
      logger.info(`添加敏感词成功: ${word}`)
      return { id, word: word.trim() }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BusinessException(ErrorCode.BUSINESS_ERROR, '该敏感词已存在')
      }
      logger.error('添加敏感词失败:', error)
      throw new BusinessException(ErrorCode.SYSTEM_ERROR, '添加敏感词失败')
    }
  }

  // 批量添加敏感词
  static async batchAddSensitiveWords(words) {
    if (!words || words.length === 0) {
      throw new BusinessException(ErrorCode.PARAM_EMPTY, '敏感词列表不能为空')
    }

    // 过滤空词
    const validWords = words.filter(w => w && w.trim() !== '').map(w => w.trim())
    if (validWords.length === 0) {
      throw new BusinessException(ErrorCode.PARAM_EMPTY, '没有有效的敏感词')
    }

    try {
      const count = await SensitiveWordModel.batchCreate(validWords)
      logger.info(`批量添加敏感词成功: ${count}条`)
      return { count }
    } catch (error) {
      logger.error('批量添加敏感词失败:', error)
      throw new BusinessException(ErrorCode.SYSTEM_ERROR, '批量添加敏感词失败')
    }
  }

  // 删除敏感词
  static async deleteSensitiveWord(id) {
    if (!id) {
      throw new BusinessException(ErrorCode.PARAM_EMPTY, '敏感词ID不能为空')
    }

    try {
      await SensitiveWordModel.delete(id)
      logger.info(`删除敏感词成功: ID=${id}`)
      return {
        success: true,
        message: '删除成功'
      }
    } catch (error) {
      logger.error('删除敏感词失败:', error)
      throw new BusinessException(ErrorCode.SYSTEM_ERROR, '删除敏感词失败')
    }
  }

  // 批量删除敏感词
  static async batchDeleteSensitiveWords(ids) {
    if (!ids || ids.length === 0) {
      throw new BusinessException(ErrorCode.PARAM_EMPTY, '敏感词ID列表不能为空')
    }

    try {
      const count = await SensitiveWordModel.batchDelete(ids)
      logger.info(`批量删除敏感词成功: ${count}条`)
      return {
        success: true,
        data: { count }
      }
    } catch (error) {
      logger.error('批量删除敏感词失败:', error)
      throw new BusinessException(ErrorCode.SYSTEM_ERROR, '批量删除敏感词失败')
    }
  }

  // 更新敏感词状态
  static async updateSensitiveWordStatus(id, status) {
    if (!id) {
      throw new BusinessException(ErrorCode.PARAM_EMPTY, '敏感词ID不能为空')
    }
    if (status !== 0 && status !== 1) {
      throw new BusinessException(ErrorCode.PARAM_ERROR, '状态值错误')
    }

    try {
      await SensitiveWordModel.updateStatus(id, status)
      logger.info(`更新敏感词状态成功: ID=${id}, status=${status}`)
      return {
        success: true,
        message: '更新成功'
      }
    } catch (error) {
      logger.error('更新敏感词状态失败:', error)
      throw new BusinessException(ErrorCode.SYSTEM_ERROR, '更新敏感词状态失败')
    }
  }

  // 获取AI审核配置
  static async getAiConfig() {
    try {
      const config = await SystemConfigModel.getAiConfig()
      return {
        success: true,
        data: config
      }
    } catch (error) {
      logger.error('获取AI审核配置失败:', error)
      throw new BusinessException(ErrorCode.SYSTEM_ERROR, '获取AI审核配置失败')
    }
  }

  // 设置AI审核配置
  static async setAiConfig(config) {
    if (!config) {
      throw new BusinessException(ErrorCode.PARAM_EMPTY, '配置不能为空')
    }

    // 验证配置参数
    if (config.level && !['low', 'medium', 'high'].includes(config.level)) {
      throw new BusinessException(ErrorCode.PARAM_ERROR, '审核严格度值错误')
    }
    if (config.timeout !== undefined && (isNaN(config.timeout) || config.timeout < 0)) {
      throw new BusinessException(ErrorCode.PARAM_ERROR, '超时时间值错误')
    }

    try {
      await SystemConfigModel.setAiConfig(config)
      logger.info('设置AI审核配置成功:', config)
      return {
        success: true,
        message: '保存成功'
      }
    } catch (error) {
      logger.error('设置AI审核配置失败:', error)
      throw new BusinessException(ErrorCode.SYSTEM_ERROR, '设置AI审核配置失败')
    }
  }

  // 检查内容是否包含敏感词
  static async checkSensitiveWord(content) {
    if (!content) {
      return { hasSensitive: false, word: null }
    }

    try {
      const result = await SensitiveWordModel.checkContent(content)
      return {
        success: true,
        data: result
      }
    } catch (error) {
      logger.error('检查敏感词失败:', error)
      throw new BusinessException(ErrorCode.SYSTEM_ERROR, '检查敏感词失败')
    }
  }
}

module.exports = ConfigService
