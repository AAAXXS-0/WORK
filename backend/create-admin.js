const mysql = require('./dao/mysql')
const { encryptPassword } = require('./common/security')

// 创建管理员账户
const createAdmin = async () => {
  try {
    const adminData = {
      studentId: 'admin001',
      username: '系统管理员',
      password: encryptPassword('admin123'),
      role: 1  // 1 表示管理员
    }
    
    // 检查管理员是否已存在
    const checkSql = 'SELECT * FROM user WHERE student_id = ?'
    const existingUser = await mysql.execute(checkSql, [adminData.studentId])
    
    if (existingUser.length > 0) {
      console.log('管理员账户已存在，跳过创建')
      console.log('管理员信息：', {
        学号: adminData.studentId,
        用户名: adminData.username,
        密码: 'admin123',
        角色: '管理员'
      })
      return
    }
    
    // 创建管理员账户
    const sql = `
      INSERT INTO user (student_id, username, password, role)
      VALUES (?, ?, ?, ?)
    `
    const result = await mysql.execute(sql, [
      adminData.studentId,
      adminData.username,
      adminData.password,
      adminData.role
    ])
    
    console.log('管理员账户创建成功！')
    console.log('=================================')
    console.log('管理员登录信息：')
    console.log('学号:', adminData.studentId)
    console.log('用户名:', adminData.username)
    console.log('密码: admin123')
    console.log('角色: 管理员')
    console.log('=================================')
    console.log('请妥善保管登录信息！')
    
    process.exit(0)
  } catch (error) {
    console.error('创建管理员账户失败:', error.message)
    process.exit(1)
  }
}

createAdmin()
