const jwt = require('jsonwebtoken');
const config = require('./common/config');
const { POST_STATUS_TEXT } = require('./common/constants');

// 模拟从localStorage或cookie中获取token
// 这里需要你提供实际的token
const token = process.argv[2]; // 从命令行参数获取token

if (!token) {
  console.log('\n=== 使用说明 ===');
  console.log('请提供JWT token作为参数：');
  console.log('  node check-token.js <your-jwt-token>');
  console.log('\n=== 如何获取token ===');
  console.log('1. 打开浏览器开发者工具（F12）');
  console.log('2. 切换到 Application 或 Storage 标签');
  console.log('3. 在 Local Storage 中找到 campus-wall-token 字段');
  console.log('4. 复制token值并粘贴到命令行中\n');
  process.exit(0);
}

// 主函数 - 使用async/await
async function main() {
  try {
    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret);

    console.log('\n=== Token解析结果 ===');
    console.log('用户ID:', decoded.id);
    console.log('用户角色:', decoded.role === 1 ? '管理员' : '普通用户');
    console.log('Token签发时间:', new Date(decoded.iat * 1000).toLocaleString('zh-CN'));
    console.log('Token过期时间:', new Date(decoded.exp * 1000).toLocaleString('zh-CN'));

    // 根据用户ID查询数据库
    const mysql = require('./dao/mysql');
    const users = await mysql.execute('SELECT id, username, student_id, avatar FROM user WHERE id = ?', [decoded.id]);

    if (users.length > 0) {
      const user = users[0];
      console.log('\n=== 用户信息 ===');
      console.log('用户ID:', user.id);
      console.log('用户名:', user.username);
      console.log('学号:', user.student_id);
      console.log('头像:', user.avatar || '未设置');

      // 查询该用户的帖子数量
      const posts = await mysql.execute('SELECT COUNT(*) as count FROM post WHERE user_id = ?', [decoded.id]);
      console.log('\n=== 帖子统计 ===');
      console.log('帖子数量:', posts[0].count);

      // 查询该用户的帖子列表
      const postList = await mysql.execute('SELECT id, content, status, create_time FROM post WHERE user_id = ? ORDER BY create_time DESC LIMIT 5', [decoded.id]);
      if (postList.length > 0) {
        console.log('\n=== 最近5条帖子 ===');
        postList.forEach((post, index) => {
          const statusText = POST_STATUS_TEXT[post.status] || `[未知状态: ${post.status}]`;
          console.log(`${index + 1}. [${statusText}] ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`);
          console.log(`   创建时间: ${new Date(post.create_time).toLocaleString('zh-CN')}`);
        });
      }
    } else {
      console.log('\n❌ 未找到该用户！');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Token验证失败:', error.message);
    if (error.name === 'TokenExpiredError') {
      console.error('错误详情: Token已过期');
    } else if (error.name === 'JsonWebTokenError') {
      console.error('错误详情: Token格式无效');
    }
    process.exit(1);
  }
}

// 执行主函数
main();
