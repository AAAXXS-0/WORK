const mysql = require('./dao/mysql');

(async () => {
  try {
    // 模拟用户ID为2的查询（张三）
    const userId = 2;
    console.log(`\n=== 模拟查询用户ID ${userId} 的帖子 ===\n`);

    // 执行和PostModel.findByUserId相同的查询
    const sql = 'SELECT * FROM post WHERE user_id = ? ORDER BY create_time DESC';
    const rows = await mysql.execute(sql, [userId]);

    console.log(`查询到的帖子数量: ${rows.length}`);
    console.log('\n帖子详情:');
    rows.forEach((p, i) => {
      console.log(`\n[${i+1}] 帖子ID: ${p.id}`);
      console.log(`    用户ID: ${p.user_id}`);
      console.log(`    内容: ${p.content.substring(0, 50)}...`);
      console.log(`    状态: ${p.status}`);
      console.log(`    创建时间: ${p.create_time}`);
      console.log(`    图片: ${p.images ? '有' : '无'}`);
    });

    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM post WHERE user_id = ?';
    const countRows = await mysql.execute(countSql, [userId]);

    console.log(`\n总数: ${countRows[0].total}`);

    // 模拟post-service的格式化逻辑
    console.log('\n=== 模拟post-service格式化后的数据 ===\n');
    const formattedList = rows.map(post => ({
      id: post.id,
      content: post.content,
      images: post.images ? JSON.parse(post.images) : [],
      status: post.status,
      aiResult: post.ai_result,
      rejectReason: post.reject_reason,
      createTime: post.create_time
    }));

    console.log('格式化后的帖子列表:');
    formattedList.forEach((p, i) => {
      console.log(`[${i+1}] ID: ${p.id}, 内容: ${p.content.substring(0, 30)}..., 状态: ${p.status}, 图片数量: ${p.images.length}`);
    });

    const returnData = {
      list: formattedList,
      total: countRows[0].total
    };

    console.log('\n最终返回给前端的数据:');
    console.log(JSON.stringify(returnData, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
})();
