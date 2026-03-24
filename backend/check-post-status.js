const mysql = require('./dao/mysql');

async function checkPostStatus() {
  try {
    console.log('\n=== 检查post表的status字段 ===\n');
    
    // 查询所有帖子的status值
    const posts = await mysql.execute('SELECT id, content, status, create_time FROM post ORDER BY create_time DESC');
    
    console.log(`总帖子数: ${posts.length}\n`);
    
    // 统计各个状态的数量
    const statusCount = {};
    posts.forEach(post => {
      const status = post.status;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    console.log('=== 状态统计 ===');
    Object.keys(statusCount).sort((a, b) => a - b).forEach(status => {
      console.log(`状态 ${status}: ${statusCount[status]} 条`);
    });
    
    console.log('\n=== 所有帖子详情 ===');
    const statusMap = { 0: '待审核', 1: '已发布', 2: '已拒绝' };
    
    posts.forEach((post, index) => {
      const statusText = statusMap[post.status] || `[未知状态: ${post.status}]`;
      console.log(`${index + 1}. ID: ${post.id}`);
      console.log(`   内容: ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`);
      console.log(`   状态: ${post.status} (${statusText})`);
      console.log(`   创建时间: ${new Date(post.create_time).toLocaleString('zh-CN')}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error.message);
    process.exit(1);
  }
}

checkPostStatus();
