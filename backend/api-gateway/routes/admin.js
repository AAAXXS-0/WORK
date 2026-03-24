const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');
const postService = require('../../service/post-service');
const auditService = require('../../service/audit-service');
const commentAuditService = require('../../service/comment-audit-service');
const avatarAuditService = require('../../service/avatar-audit-service');
const userService = require('../../service/user-service');
const configService = require('../../service/config-service');
const dashboardService = require('../../service/dashboard-service');
const PostModel = require('../../model/post');
const CommentModel = require('../../model/comment');
const StudentRosterModel = require('../../model/studentRoster');
const logger = require('../../common/logger');
const { BusinessException } = require('../../common/exception');
const { ErrorCode } = require('../../common/errorCode');

// 配置multer内存存储（不需要物理目录）
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 管理员鉴权
router.use(authMiddleware, adminAuthMiddleware);

// ============ 仪表盘统计接口 ============

// 获取仪表盘统计数据
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardData();
    res.json({ code: 0, data: stats });
  } catch (err) { next(err); }
});

// ============ 审核管理接口 ============

// 待审核列表
router.get('/audit/list', async (req, res, next) => {
  try {
    const posts = await postService.getWaitAuditPosts();
    res.json({ code: 0, data: posts });
  } catch (err) { next(err); }
});

// 人工审核
router.post('/audit/do', async (req, res, next) => {
  try {
    const { id, act, reason } = req.body;
    await auditService.manualAudit(id, act, req.user.id, reason);
    res.json({ code: 0, msg: '审核完成' });
  } catch (err) { next(err); }
});

// 审核日志
router.get('/audit/log', async (req, res, next) => {
  try {
    const logs = await PostModel.getAuditLog(req.query);
    res.json({ code: 0, data: logs });
  } catch (err) { next(err); }
});

// 用户管理
router.get('/user/list', async (req, res, next) => {
  try {
    const users = await userService.getUserList(req.query);
    res.json({ code: 0, data: users });
  } catch (err) { next(err); }
});

// 封禁/解封用户
router.post('/user/manage', async (req, res, next) => {
  try {
    await userService.userManage(req.body);
    res.json({ code: 0, msg: '操作成功' });
  } catch (err) { next(err); }
});

// 导入学生花名册（Excel）
router.post('/roster/import', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new BusinessException(ErrorCode.UPLOAD_FILE_EMPTY);
    }

    // 读取Excel文件（从内存buffer读取）
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // 验证Excel格式
    const students = [];
    for (const row of data) {
      // 检查必需的列
      if (!row['姓名'] || !row['学号'] || !row['统一验证码']) {
        throw new BusinessException(ErrorCode.ROSTER_FORMAT_ERROR);
      }
      students.push({
        name: row['姓名'],
        studentId: String(row['学号']),
        verifyCode: String(row['统一验证码'])
      });
    }

    // 批量插入数据库
    const result = await StudentRosterModel.batchCreate(students);
    logger.info(`导入学生花名册成功，共导入${result}条记录`);

    res.json({ code: 0, msg: '导入成功', data: { count: result } });
  } catch (err) {
    next(err);
  }
});

// 获取学生花名册列表
router.get('/roster/list', async (req, res, next) => {
  try {
    const { key, pageNum = 1, pageSize = 10 } = req.query;
    const result = await StudentRosterModel.list(key, parseInt(pageNum), parseInt(pageSize));
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

// 获取所有帖子列表（管理员）
router.get('/post/list', async (req, res, next) => {
  try {
    const { status, pageNum = 1, pageSize = 10 } = req.query;
    const posts = await PostModel.list(status, parseInt(pageNum), parseInt(pageSize));
    res.json({ code: 0, data: posts });
  } catch (err) { next(err); }
});

// 帖子管理（删除/恢复）
router.post('/post/manage', async (req, res, next) => {
  try {
    const { id, action } = req.body;
    if (action === 'delete') {
      await PostModel.updateStatus(id, 5, req.user.id, '管理员删除');
    } else if (action === 'restore') {
      await PostModel.updateStatus(id, 3, req.user.id, '管理员恢复');
    }
    logger.info(`帖子管理：ID=${id}，操作=${action}，操作人=${req.user.id}`);
    res.json({ code: 0, msg: '操作成功' });
  } catch (err) { next(err); }
});

// ============ 配置管理相关接口 ============

// 获取敏感词列表
router.get('/config/sensitive/list', async (req, res, next) => {
  try {
    const { status, pageNum = 1, pageSize = 10 } = req.query;
    const result = await configService.getSensitiveWordList(
      status !== undefined ? parseInt(status) : undefined,
      parseInt(pageNum),
      parseInt(pageSize)
    );
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

// 添加敏感词
router.post('/config/sensitive/add', async (req, res, next) => {
  try {
    const { word } = req.body;
    const result = await configService.addSensitiveWord(word);
    res.json({ code: 0, data: result, msg: '添加成功' });
  } catch (err) { next(err); }
});

// 批量添加敏感词
router.post('/config/sensitive/batch-add', async (req, res, next) => {
  try {
    const { words } = req.body;
    const result = await configService.batchAddSensitiveWords(words);
    res.json({ code: 0, data: result, msg: '批量添加成功' });
  } catch (err) { next(err); }
});

// 删除敏感词
router.delete('/config/sensitive/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await configService.deleteSensitiveWord(parseInt(id));
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) { next(err); }
});

// 批量删除敏感词
router.post('/config/sensitive/batch-delete', async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await configService.batchDeleteSensitiveWords(ids);
    res.json({ code: 0, data: result, msg: '批量删除成功' });
  } catch (err) { next(err); }
});

// 更新敏感词状态
router.put('/config/sensitive/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await configService.updateSensitiveWordStatus(parseInt(id), parseInt(status));
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) { next(err); }
});

// 获取AI审核配置
router.get('/config/ai', async (req, res, next) => {
  try {
    const result = await configService.getAiConfig();
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

// 设置AI审核配置
router.post('/config/ai', async (req, res, next) => {
  try {
    const config = req.body;
    await configService.setAiConfig(config);
    res.json({ code: 0, msg: '保存成功' });
  } catch (err) { next(err); }
});

// ============ 评论审核相关接口 ============

// 获取待审核评论列表
router.get('/comment-audit/list', async (req, res, next) => {
  try {
    const { pageNum = 1, pageSize = 10 } = req.query;
    const result = await commentAuditService.getPendingAuditComments(parseInt(pageNum), parseInt(pageSize));
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

// 评论人工审核
router.post('/comment-audit/do', async (req, res, next) => {
  try {
    const { id, act, reason } = req.body;
    await commentAuditService.manualAudit(id, act, req.user.id, reason);
    res.json({ code: 0, msg: '审核完成' });
  } catch (err) { next(err); }
});

// 根据状态获取评论列表（用于评论管理）
router.get('/comment/list', async (req, res, next) => {
  try {
    const { status, pageNum = 1, pageSize = 10 } = req.query;
    const result = await commentAuditService.getCommentsByStatus(
      status !== undefined ? parseInt(status) : undefined,
      parseInt(pageNum),
      parseInt(pageSize)
    );
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

// 评论管理（删除/恢复）
router.post('/comment/manage', async (req, res, next) => {
  try {
    const { id, action } = req.body;
    if (action === 'delete') {
      await CommentModel.updateStatus(id, 0, req.user.id, '管理员删除');
    } else if (action === 'restore') {
      await CommentModel.updateStatus(id, 1, req.user.id, '管理员恢复');
    }
    logger.info(`评论管理：ID=${id}，操作=${action}，操作人=${req.user.id}`);
    res.json({ code: 0, msg: '操作成功' });
  } catch (err) { next(err); }
});

// ============ 头像审核相关接口 ============

// 获取待审核头像列表
router.get('/avatar-audit/list', async (req, res, next) => {
  try {
    const { pageNum = 1, pageSize = 10 } = req.query;
    const result = await avatarAuditService.getPendingAuditAvatars(parseInt(pageNum), parseInt(pageSize));
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

// 头像人工审核
router.post('/avatar-audit/do', async (req, res, next) => {
  try {
    const { id, act, reason } = req.body;
    await avatarAuditService.manualAudit(id, act, req.user.id, reason);
    res.json({ code: 0, msg: '审核完成' });
  } catch (err) { next(err); }
});

// 根据状态获取头像列表
router.get('/avatar/list', async (req, res, next) => {
  try {
    const { status, pageNum = 1, pageSize = 10 } = req.query;
    const result = await avatarAuditService.getAvatarsByStatus(
      status !== undefined ? parseInt(status) : undefined,
      parseInt(pageNum),
      parseInt(pageSize)
    );
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

module.exports = router;