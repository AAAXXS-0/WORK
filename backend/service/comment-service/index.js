const CommentModel = require('../../model/comment')
const { BusinessException } = require('../../common/exception')
const ErrorCode = require('../../common/errorCode')
const logger = require('../../common/logger')

// 创建评论
const createComment = async (postId, userId, content, parentId = 0) => {
  if (!content || content.trim() === '') {
    throw new BusinessException(ErrorCode.PARAM_ERROR, '评论内容不能为空')
  }
  
  const commentId = await CommentModel.create(postId, userId, content.trim(), parentId)
  logger.info(`评论创建成功：ID=${commentId}，用户ID=${userId}，帖子ID=${postId}`)
  return { id: commentId }
}

// 获取帖子评论列表
const getPostComments = async (postId) => {
  const comments = await CommentModel.findByPostId(postId)
  return comments.map(comment => ({
    id: comment.id,
    postId: comment.post_id,
    userId: comment.user_id,
    username: comment.username,
    studentId: comment.student_id,
    avatar: comment.avatar || '',
    content: comment.content,
    parentId: comment.parent_id,
    createTime: comment.create_time
  }))
}

// 获取用户评论列表
const getUserComments = async (userId, pageNum = 1, pageSize = 10, status = null) => {
  const result = await CommentModel.findByUserId(userId, pageNum, pageSize, status)
  return {
    list: result.list.map(comment => ({
      id: comment.id,
      postId: comment.postId,
      postTitle: comment.postTitle,
      postStatus: comment.postStatus,
      content: comment.content,
      parentId: comment.parentId,
      status: comment.status,
      createTime: comment.createTime
    })),
    total: result.total
  }
}

// 删除评论
const deleteComment = async (id, userId) => {
  const comment = await CommentModel.findById(id)
  if (!comment) {
    throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND)
  }
  
  // 只能删除自己的评论
  if (comment.user_id !== userId) {
    throw new BusinessException(ErrorCode.PERMISSION_DENIED)
  }
  
  await CommentModel.delete(id)
  logger.info(`评论删除成功：ID=${id}，用户ID=${userId}`)
}

module.exports = {
  createComment,
  getPostComments,
  getUserComments,
  deleteComment
}
