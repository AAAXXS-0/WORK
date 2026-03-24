const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const postService = require('../../service/post-service');
const auditService = require('../../service/audit-service');
const viewHistoryService = require('../../service/view-history-service');

// 发帖
router.post('/publish', authMiddleware, async (req, res, next) => {
  try {
    const { content, images } = req.body;
    const { postId } = await postService.createPost({ userId: req.user.id, content, images });
    // 触发AI审核
    await auditService.aiAuditDispatch(postId, content, images);
    res.json({ code: 0, msg: '发帖成功，审核中', data: { postId } });
  } catch (err) { next(err); }
});

// 我的帖子
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    console.log('[后端] 获取我的帖子 - 用户ID:', req.user.id, '状态:', req.query.status);
    const status = req.query.status ? parseInt(req.query.status) : undefined;
    const posts = await postService.getUserPosts(req.user.id, status);
    console.log('[后端] postService.getUserPosts 返回结果:', JSON.stringify(posts, null, 2));
    console.log('[后端] 返回给前端的数据:', { code: 0, data: posts });
    res.json({ code: 0, data: posts });
  } catch (err) { next(err); }
});

// 更新帖子
router.put('/update', authMiddleware, async (req, res, next) => {
  try {
    const { postId, content, images } = req.body;
    const { postId: updatedPostId } = await postService.updatePost(postId, req.user.id, content, images);
    res.json({ code: 0, msg: '帖子更新成功，重新审核中', data: { postId: updatedPostId } });
  } catch (err) { next(err); }
});

// 帖子详情
router.get('/:id', async (req, res, next) => {
  try {
    const post = await postService.getPostDetail(Number(req.params.id));
    
    // 如果用户已登录，记录浏览历史
    if (req.user && req.user.id) {
      try {
        await viewHistoryService.addViewHistory(req.user.id, Number(req.params.id));
      } catch (err) {
        // 浏览记录添加失败不影响帖子详情的返回
        console.error('添加浏览记录失败:', err);
      }
    }
    
    res.json({ code: 0, data: post });
  } catch (err) { next(err); }
});

// 获取已发布的帖子列表（首页使用，支持搜索和分页）
router.get('/list/published', async (req, res, next) => {
  try {
    const { keyword, pageNum, pageSize } = req.query;
    const result = await postService.getPublishedPosts(keyword, pageNum, pageSize);
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

// 点赞/取消点赞帖子
router.post('/like', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.body;
    const result = await postService.likePost(postId, req.user.id);
    res.json({ code: 0, msg: result.liked ? '点赞成功' : '取消点赞成功', data: result });
  } catch (err) { next(err); }
});

// 获取帖子点赞数
router.get('/like/count', async (req, res, next) => {
  try {
    const { postId } = req.query;
    const result = await postService.getLikeCount(postId);
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

// 获取用户点赞的帖子列表
router.get('/like/my', authMiddleware, async (req, res, next) => {
  try {
    const { pageNum, pageSize } = req.query;
    const result = await postService.getUserLikedPosts(req.user.id, pageNum, pageSize);
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

module.exports = router;