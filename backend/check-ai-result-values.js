const mysql = require('./dao/mysql')

async function checkAiResult() {
  try {
    console.log('========== 检查 post 表的 ai_result 字段 ==========')
    
    // 查询所有帖子的 ai_result 字段
    const posts = await mysql.execute('SELECT id, ai_result, status FROM post ORDER BY id DESC LIMIT 10')
    console.log('\n最近10条帖子的 ai_result 字段：')
    posts.forEach(post => {
      console.log(`ID: ${post.id}, ai_result: "${post.ai_result}" (类型: ${typeof post.ai_result}), status: ${post.status}`)
    })
    
    // 统计 ai_result 字段的分布
    const stats = await mysql.execute(`
      SELECT 
        ai_result,
        COUNT(*) as count,
        COUNT(DISTINCT id) as distinct_ids
      FROM post
      GROUP BY ai_result
      ORDER BY ai_result
    `)
    console.log('\nai_result 字段统计：')
    stats.forEach(stat => {
      console.log(`值: "${stat.ai_result}" (类型: ${typeof stat.ai_result}), 数量: ${stat.count}`)
    })
    
    console.log('\n========== 检查 comment 表的 ai_result 字段 ==========')
    
    // 查询所有评论的 ai_result 字段
    const comments = await mysql.execute('SELECT id, ai_result, status FROM comment ORDER BY id DESC LIMIT 10')
    console.log('\n最近10条评论的 ai_result 字段：')
    comments.forEach(comment => {
      console.log(`ID: ${comment.id}, ai_result: "${comment.ai_result}" (类型: ${typeof comment.ai_result}), status: ${comment.status}`)
    })
    
    // 统计 ai_result 字段的分布
    const commentStats = await mysql.execute(`
      SELECT 
        ai_result,
        COUNT(*) as count,
        COUNT(DISTINCT id) as distinct_ids
      FROM comment
      GROUP BY ai_result
      ORDER BY ai_result
    `)
    console.log('\ncomment 表 ai_result 字段统计：')
    commentStats.forEach(stat => {
      console.log(`值: "${stat.ai_result}" (类型: ${typeof stat.ai_result}), 数量: ${stat.count}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('错误:', error)
    process.exit(1)
  }
}

checkAiResult()
