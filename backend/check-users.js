const mysql = require('./dao/mysql');

(async () => {
  try {
    // 查询用户列表
    const users = await mysql.execute('SELECT id, username, student_id FROM user');
    console.log('\n=== 用户列表 ===');
    users.forEach((u, i) => {
      console.log(`[${i+1}] ID: ${u.id}, 用户名: ${u.username}, 学号: ${u.student_id}`);
    });

    // 查询post表结构
    const postSchema = await mysql.execute('DESCRIBE post');
    console.log('\n=== Post表结构 ===');
    postSchema.forEach((col, i) => {
      console.log(`[${i+1}] 字段名: ${col.Field}, 类型: ${col.Type}, 允许NULL: ${col.Null}, 键: ${col.Key}`);
    });

    // 查询帖子列表（使用正确的字段名）
    const posts = await mysql.execute('SELECT id, user_id, content, status FROM post');
    console.log('\n=== 帖子列表 ===');
    posts.forEach((p, i) => {
      const contentPreview = p.content ? p.content.substring(0, 30) + '...' : '(空)';
      console.log(`[${i+1}] ID: ${p.id}, 用户ID: ${p.user_id}, 内容: ${contentPreview}, 状态: ${p.status}`);
    });

    // 统计每个用户的帖子数量
    const postCounts = await mysql.execute(`
      SELECT user_id, COUNT(*) as count 
      FROM post 
      GROUP BY user_id
    `);
    console.log('\n=== 用户帖子统计 ===');
    postCounts.forEach((c, i) => {
      console.log(`[${i+1}] 用户ID: ${c.user_id}, 帖子数量: ${c.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
})();
