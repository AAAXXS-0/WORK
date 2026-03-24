const mysql = require('./dao/mysql')

// 查询数据库中的帖子数据
const checkPosts = async () => {
  try {
    console.log('开始查询帖子数据...\n')
    
    // 1. 查询所有帖子
    const allPostsSql = 'SELECT * FROM post'
    const allPosts = await mysql.execute(allPostsSql)
    console.log(`1. 数据库中总共有 ${allPosts.length} 条帖子记录`)
    if (allPosts.length > 0) {
      console.log('   帖子详情:')
      allPosts.forEach((post, index) => {
        console.log(`   [${index + 1}] ID: ${post.id}, 用户ID: ${post.user_id}, 状态: ${post.status}, 内容: ${post.content.substring(0, 50)}...`)
      })
    }
    
    // 2. 查询用户ID为790087的帖子
    const userId = 790087
    const userPostsSql = 'SELECT * FROM post WHERE user_id = ?'
    const userPosts = await mysql.execute(userPostsSql, [userId])
    console.log(`\n2. 用户ID ${userId} 的帖子数量: ${userPosts.length}`)
    if (userPosts.length > 0) {
      console.log('   帖子详情:')
      userPosts.forEach((post, index) => {
        console.log(`   [${index + 1}] ID: ${post.id}, 状态: ${post.status}, 内容: ${post.content.substring(0, 50)}...`)
      })
    }
    
    // 3. 检查post模型的findByUserId方法返回格式
    const PostModel = require('./model/post')
    const result = await PostModel.findByUserId(userId)
    console.log(`\n3. PostModel.findByUserId(${userId}) 返回结果:`)
    console.log('   返回类型:', typeof result)
    console.log('   是否为数组:', Array.isArray(result))
    console.log('   返回结果:', JSON.stringify(result, null, 2))
    
    // 4. 检查postService的getUserPosts方法返回格式
    const postService = require('./service/post-service')
    const serviceResult = await postService.getUserPosts(userId)
    console.log(`\n4. postService.getUserPosts(${userId}) 返回结果:`)
    console.log('   返回类型:', typeof serviceResult)
    console.log('   是否包含list属性:', serviceResult && 'list' in serviceResult)
    console.log('   是否包含total属性:', serviceResult && 'total' in serviceResult)
    console.log('   返回结果:', JSON.stringify(serviceResult, null, 2))
    
    process.exit(0)
  } catch (error) {
    console.error('查询失败:', error)
    process.exit(1)
  }
}

checkPosts()
