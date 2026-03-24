const mysql = require('./dao/mysql')

// 查询数据库中的评论数据
const checkComments = async () => {
  try {
    console.log('开始查询评论数据...\n')
    
    // 1. 查询所有评论
    const allCommentsSql = 'SELECT * FROM comment'
    const allComments = await mysql.execute(allCommentsSql)
    console.log(`1. 数据库中总共有 ${allComments.length} 条评论记录`)
    if (allComments.length > 0) {
      console.log('   评论详情:')
      allComments.forEach((comment, index) => {
        console.log(`   [${index + 1}] ID: ${comment.id}, 帖子ID: ${comment.post_id}, 用户ID: ${comment.user_id}, 父评论ID: ${comment.parent_id}, 状态: ${comment.status}, 内容: ${comment.content.substring(0, 50)}...`)
      })
    }
    
    // 2. 查询特定帖子的评论（假设帖子ID为1）
    const postId = 1
    const postCommentsSql = 'SELECT * FROM comment WHERE post_id = ? ORDER BY create_time ASC'
    const postComments = await mysql.execute(postCommentsSql, [postId])
    console.log(`\n2. 帖子ID ${postId} 的评论数量: ${postComments.length}`)
    if (postComments.length > 0) {
      console.log('   评论详情:')
      postComments.forEach((comment, index) => {
        console.log(`   [${index + 1}] ID: ${comment.id}, 用户ID: ${comment.user_id}, 父评论ID: ${comment.parent_id}, 状态: ${comment.status}, 内容: ${comment.content.substring(0, 50)}...`)
      })
    }
    
    // 3. 查询特定用户的评论（假设用户ID为1）
    const userId = 1
    const userCommentsSql = 'SELECT * FROM comment WHERE user_id = ? ORDER BY create_time DESC'
    const userComments = await mysql.execute(userCommentsSql, [userId])
    console.log(`\n3. 用户ID ${userId} 的评论数量: ${userComments.length}`)
    if (userComments.length > 0) {
      console.log('   评论详情:')
      userComments.forEach((comment, index) => {
        console.log(`   [${index + 1}] ID: ${comment.id}, 帖子ID: ${comment.post_id}, 父评论ID: ${comment.parent_id}, 状态: ${comment.status}, 内容: ${comment.content.substring(0, 50)}...`)
      })
    }
    
    // 4. 查询一级评论（parent_id = 0）
    const topLevelCommentsSql = 'SELECT * FROM comment WHERE parent_id = 0'
    const topLevelComments = await mysql.execute(topLevelCommentsSql)
    console.log(`\n4. 一级评论数量（parent_id = 0）: ${topLevelComments.length}`)
    
    // 5. 查询回复评论（parent_id > 0）
    const replyCommentsSql = 'SELECT * FROM comment WHERE parent_id > 0'
    const replyComments = await mysql.execute(replyCommentsSql)
    console.log(`5. 回复评论数量（parent_id > 0）: ${replyComments.length}`)
    
    // 6. 检查comment模型的findByPostId方法返回格式
    const CommentModel = require('./model/comment')
    const modelResult = await CommentModel.findByPostId(postId)
    console.log(`\n6. CommentModel.findByPostId(${postId}) 返回结果:`)
    console.log('   返回类型:', typeof modelResult)
    console.log('   是否为数组:', Array.isArray(modelResult))
    console.log('   返回结果:', JSON.stringify(modelResult, null, 2))
    
    // 7. 检查commentService的getCommentsByPostId方法返回格式
    const commentService = require('./service/comment-service')
    const serviceResult = await commentService.getCommentsByPostId(postId)
    console.log(`\n7. commentService.getCommentsByPostId(${postId}) 返回结果:`)
    console.log('   返回类型:', typeof serviceResult)
    console.log('   返回结果:', JSON.stringify(serviceResult, null, 2))
    
    process.exit(0)
  } catch (error) {
    console.error('查询失败:', error)
    process.exit(1)
  }
}

checkComments()
