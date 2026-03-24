const mysql = require('./dao/mysql');

async function checkTables() {
  try {
    const postRows = await mysql.execute('DESCRIBE post');
    console.log('post表结构:', JSON.stringify(postRows, null, 2));
    
    const commentRows = await mysql.execute('DESCRIBE comment');
    console.log('comment表结构:', JSON.stringify(commentRows, null, 2));
    
    const userRows = await mysql.execute('DESCRIBE user');
    console.log('user表结构:', JSON.stringify(userRows, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

checkTables();
