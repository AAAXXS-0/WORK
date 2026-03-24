const mysql = require('./dao/mysql');

(async () => {
  try {
    const users = await mysql.execute('SELECT id, username, student_id, role FROM user');
    console.log('用户列表:');
    users.forEach((u, i) => {
      console.log(`[${i+1}] ID: ${u.id}, 用户名: ${u.username}, 学号: ${u.student_id}, 角色: ${u.role}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
})();
