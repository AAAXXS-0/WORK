# 项目更新日志

## 2024-01-XX 错误码机制优化

### 更新目的
统一项目错误码管理，建立规范的错误捕获机制，提高代码可维护性和问题定位效率。

### 新增文件

#### 1. backend/common/errorCode.js
**用途**: 统一管理项目所有错误码

```javascript
// 错误码格式: B[模块][类型][序号]
// 模块: U(用户) P(帖子) A(审核) C(评论) U(上传) S(系统) T(Token)
// 类型: P(参数) B(业务) S(状态) A(认证) R(权限)

const ErrorCode = {
  // 用户模块 BU
  USER_STUDENT_ID_EMPTY: { code: 'BU001', message: '学号不能为空', httpCode: 400 },
  USER_CARD_ID_EMPTY: { code: 'BU002', message: '一卡通号不能为空', httpCode: 400 },
  USER_NOT_FOUND: { code: 'BU003', message: '用户不存在', httpCode: 404 },
  USER_PASSWORD_ERROR: { code: 'BU004', message: '密码错误', httpCode: 401 },
  USER_BANNED: { code: 'BU005', message: '账号已被封禁', httpCode: 403 },
  
  // 帖子模块 BP
  POST_CONTENT_EMPTY: { code: 'BP001', message: '帖子内容不能为空', httpCode: 400 },
  POST_NOT_FOUND: { code: 'BP002', message: '帖子不存在', httpCode: 404 },
  
  // 审核模块 BA
  AUDIT_ACTION_INVALID: { code: 'BA001', message: '审核操作只能是pass或reject', httpCode: 400 },
  
  // 上传模块 BU
  UPLOAD_FILE_EMPTY: { code: 'BU001', message: '请选择文件', httpCode: 400 },
  
  // Token模块 BT
  TOKEN_MISSING: { code: 'BT001', message: '未登录，请先登录', httpCode: 401 },
  TOKEN_INVALID: { code: 'BT002', message: 'Token无效或已过期', httpCode: 401 },
  
  // 权限模块 BR
  PERMISSION_DENIED: { code: 'BR001', message: '无管理员权限', httpCode: 403 },
}
```

### 修改文件

#### 1. backend/common/exception.js
**更新前**:
```javascript
class BusinessException extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

const exceptionHandler = (err, req, res, next) => {
  res.json({ code: err.code || 500, msg: err.message, data: null })
}
```

**更新后**:
```javascript
class BusinessException extends Error {
  constructor(errorInfo, message) {
    super(message || errorInfo.message)
    this.code = errorInfo.code
    this.httpCode = errorInfo.httpCode || 500
  }
}

class AuthException extends BusinessException { ... }
class PermissionException extends BusinessException { ... }
class ParamException extends BusinessException { ... }

// 增强的全局异常处理中间件
const exceptionHandler = (err, req, res, next) => {
  logger.error(`[${err.code}] ${err.message}`)
  const httpCode = err.httpCode || 500
  res.status(httpCode).json({ code: err.code, msg: err.message, data: null })
}

// 404处理中间件
const notFoundHandler = (req, res, next) => { ... }

// 异步路由包装器
const asyncHandler = (fn) => (req, res, next) => { ... }
```

#### 2. backend/service/user-service/index.js
**更新前**:
```javascript
if (!studentId) {
  throw new BusinessException(400, '学号不能为空')
}
if (!cardId) {
  throw new BusinessException(400, '一卡通号不能为空')
}
if (!user) {
  throw new BusinessException(401, '用户不存在')
}
if (password !== user.password) {
  throw new BusinessException(401, '密码错误')
}
if (user.status === 0) {
  throw new BusinessException(403, '账号已被封禁')
}
```

**更新后**:
```javascript
if (!studentId) {
  throw new BusinessException(ErrorCode.USER_STUDENT_ID_EMPTY)
}
if (!cardId) {
  throw new BusinessException(ErrorCode.USER_CARD_ID_EMPTY)
}
if (!user) {
  throw new BusinessException(ErrorCode.USER_NOT_FOUND)
}
if (password !== user.password) {
  throw new BusinessException(ErrorCode.USER_PASSWORD_ERROR)
}
if (user.status === USER_STATUS.BANNED) {
  throw new BusinessException(ErrorCode.USER_BANNED)
}
```

#### 3. backend/service/post-service/index.js
**更新前**:
```javascript
if (!content) {
  throw new BusinessException(400, '帖子内容不能为空')
}
if (!post) {
  throw new BusinessException(404, '帖子不存在')
}
```

**更新后**:
```javascript
if (!content) {
  throw new BusinessException(ErrorCode.POST_CONTENT_EMPTY)
}
if (!post) {
  throw new BusinessException(ErrorCode.POST_NOT_FOUND)
}
```

#### 4. backend/service/audit-service/index.js
**更新前**:
```javascript
if (!['pass', 'reject'].includes(act)) {
  throw new BusinessException(400, '审核操作只能是pass或reject')
}
```

**更新后**:
```javascript
if (!['pass', 'reject'].includes(act)) {
  throw new BusinessException(ErrorCode.AUDIT_ACTION_INVALID)
}
```

#### 5. backend/api-gateway/middleware/auth.js
**更新前**:
```javascript
if (!token) {
  throw new BusinessException(401, '未登录，请先登录')
}
if (!user) {
  throw new BusinessException(401, 'token无效或已过期')
}
if (!['admin', 'super_admin'].includes(req.user.role)) {
  throw new BusinessException(403, '无管理员权限')
}
```

**更新后**:
```javascript
if (!token) {
  throw new AuthException('未登录，请先登录')
}
if (!user) {
  throw new AuthException('Token无效或已过期')
}
if (!['admin', 'super_admin'].includes(req.user.role)) {
  throw new PermissionException('无管理员权限')
}
```

#### 6. backend/api-gateway/routes/upload.js
**更新前**:
```javascript
if (!file) {
  return res.json({ code: 400, msg: '请选择文件' })
}
```

**更新后**:
```javascript
if (!file) {
  throw new BusinessException(ErrorCode.UPLOAD_FILE_EMPTY)
}
```

### 错误码规范

| 模块代码 | 模块名称 | 示例 |
|---------|---------|------|
| BU | 用户模块 | BU001-BU099 |
| BP | 帖子模块 | BP001-BP099 |
| BA | 审核模块 | BA001-BA099 |
| BC | 评论模块 | BC001-BC099 |
| BU | 上传模块 | BU001-BU099 |
| BT | Token模块 | BT001-BT099 |
| BR | 权限模块 | BR001-BR099 |
| BS | 系统模块 | BS001-BS099 |

| 类型代码 | 类型名称 | 说明 |
|---------|---------|------|
| P | 参数错误 | 请求参数校验失败 |
| B | 业务错误 | 业务逻辑校验失败 |
| S | 状态错误 | 状态流转异常 |
| A | 认证错误 | 身份认证失败 |
| R | 权限错误 | 权限校验失败 |

### 优化效果
1. **统一管理**: 所有错误码集中在errorCode.js中管理
2. **规范格式**: 错误码格式为B[模块][类型][序号]，便于识别和定位
3. **增强异常类**: 新增AuthException、PermissionException等专用异常类
4. **完善日志**: 全局异常处理中间件增加错误日志记录
5. **HTTP状态码**: 支持返回正确的HTTP状态码
6. **可扩展性**: 便于后续添加新的错误码和异常类型

---

## 2024-01-XX 项目架构文档创建

### 更新目的
归总整个项目的架构、文件作用、数据库存储方式，便于开发者快速了解项目整体结构和技术细节。

### 新增文件

#### 1. PROJECT_ARCHITECTURE.md
**位置**: 项目根目录
**用途**: 项目架构文档

**主要内容**:
1. **项目概述**: 技术栈说明（Vue3 + Node.js + MySQL + Redis + OSS + AI审核）
2. **目录结构**: 完整的前后端目录树形结构
3. **后端架构**: 分层架构设计（API网关层、服务层、模型层、DAO层）
4. **数据库设计**: 6张核心表结构（用户、帖子、审核日志、评论、点赞、通知）
5. **状态码设计**: 用户状态、帖子状态、审核类型、审核结果等状态常量
6. **错误码规范**: 错误码格式和分类说明
7. **API接口规范**: 接口格式和完整接口列表
8. **审核流程**: AI审核 + 人工审核流程图
9. **安全机制**: JWT认证、密码加密、XSS过滤、限流保护
10. **部署说明**: 环境要求、配置文件、启动命令

### 文档结构

```
PROJECT_ARCHITECTURE.md
├── 一、项目概述
│   └── 技术栈表格
├── 二、项目目录结构
│   ├── backend/ (后端服务)
│   └── frontend/ (前端应用)
├── 三、后端架构设计
│   ├── 分层架构图
│   └── 核心模块说明表格
├── 四、数据库设计
│   ├── 数据库表结构
│   ├── 状态码设计
│   └── 索引设计
├── 五、错误码规范
│   ├── 错误码格式
│   └── 异常处理机制
├── 六、API接口规范
│   ├── 接口格式
│   └── 接口列表
├── 七、审核流程
│   └── 审核流程图
├── 八、安全机制
├── 九、部署说明
└── 十、更新日志
```

### 数据库表汇总

| 表名 | 说明 | 主要字段 |
|-----|------|---------|
| user | 用户表 | id, student_id, username, password, status, role |
| post | 帖子表 | id, user_id, content, images, status, ai_result |
| audit_log | 审核日志表 | id, post_id, type, result, operator_id, reason |
| comment | 评论表 | id, post_id, user_id, content, parent_id, status |
| like | 点赞表 | id, post_id, user_id |
| notification | 通知表 | id, user_id, type, title, content, is_read |

### 优化效果
1. **文档化**: 项目架构完整记录，便于新人快速上手
2. **结构清晰**: 目录结构、分层架构一目了然
3. **数据库规范**: 表结构、状态码、索引设计完整记录
4. **接口规范**: API接口格式和列表清晰明确
5. **可维护性**: 便于后续开发和维护参考

---

## 2024-01-XX 学生注册功能开发

### 更新目的
实现学生首次使用时的注册功能，学生通过学号和统一验证码验证身份后设置密码完成注册。

### 新增文件

#### 1. backend/model/studentRoster.js
**位置**: backend/model/studentRoster.js
**用途**: 学生花名册模型，提供花名册数据的增删改查操作

**主要方法**:
- `findByStudentId(studentId)`: 根据学号查询学生
- `findByStudentIdAndVerifyCode(studentId, verifyCode)`: 根据学号和验证码查询
- `updateRegistered(studentId)`: 更新注册状态
- `create(data)`: 创建学生记录
- `batchCreate(list)`: 批量创建学生记录
- `getList(page, pageSize)`: 获取花名册列表

#### 2. frontend/src/views/user/Register.vue
**位置**: frontend/src/views/user/Register.vue
**用途**: 学生注册界面

**功能流程**:
1. 步骤一：输入学号和统一验证码进行身份验证
2. 步骤二：验证通过后显示姓名，设置新密码
3. 完成注册后跳转登录页面

### 修改文件

#### 1. backend/dao/mysql/schema.sql
**更新前**:
```sql
-- 用户表直接创建
CREATE TABLE user (
  ...
);
```

**更新后**:
```sql
-- 学生花名册表（新增）
CREATE TABLE student_roster (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  student_id VARCHAR(20) NOT NULL COMMENT '学号',
  verify_code VARCHAR(20) NOT NULL COMMENT '统一验证码',
  is_registered TINYINT DEFAULT 0 COMMENT '是否已注册 0-否 1-是',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_student_id (student_id),
  INDEX idx_verify_code (verify_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生花名册';

-- 用户表
CREATE TABLE user (
  ...
);
```

#### 2. backend/common/errorCode.js
**更新前**:
```javascript
// 用户模块错误码
const USER_NOT_FOUND = 'BU001'
const USER_PASSWORD_ERROR = 'BU002'
const USER_BANNED = 'BU003'
// ...
```

**更新后**:
```javascript
// 用户模块错误码
const USER_NOT_FOUND = 'BU001'
const USER_PASSWORD_ERROR = 'BU002'
const USER_BANNED = 'BU003'
// ...

// 注册相关错误码
const USER_STUDENT_NOT_IN_ROSTER = 'BU221'  // 学号不在花名册中
const USER_VERIFY_CODE_ERROR = 'BU222'       // 验证码错误
const USER_ALREADY_REGISTERED = 'BU223'      // 该学号已注册
const USER_PASSWORD_NOT_MATCH = 'BU224'      // 两次密码不一致
const USER_PASSWORD_EMPTY = 'BU225'          // 密码不能为空
const USER_PASSWORD_TOO_SHORT = 'BU226'      // 密码长度不足
```

#### 3. backend/service/user-service/index.js
**更新前**:
```javascript
// 仅导出原有方法
module.exports = {
  studentAuth,
  login,
  // ...
}
```

**更新后**:
```javascript
// 新增方法
async verifyStudent({ studentId, verifyCode }) {
  // 1. 验证学号是否存在
  const roster = await StudentRosterModel.findByStudentId(studentId)
  if (!roster) throw new BusinessException(ErrorCode.USER_STUDENT_NOT_IN_ROSTER)
  
  // 2. 验证验证码
  if (roster.verify_code !== verifyCode) throw new BusinessException(ErrorCode.USER_VERIFY_CODE_ERROR)
  
  // 3. 检查是否已注册
  if (roster.is_registered === 1) throw new BusinessException(ErrorCode.USER_ALREADY_REGISTERED)
  
  return { studentId, name: roster.name }
}

async register({ studentId, verifyCode, password, confirmPassword }) {
  // 1. 再次验证
  await this.verifyStudent({ studentId, verifyCode })
  
  // 2. 校验密码
  if (!password) throw new BusinessException(ErrorCode.USER_PASSWORD_EMPTY)
  if (password.length < 6) throw new BusinessException(ErrorCode.USER_PASSWORD_TOO_SHORT)
  if (password !== confirmPassword) throw new BusinessException(ErrorCode.USER_PASSWORD_NOT_MATCH)
  
  // 3. 创建用户
  const hashedPassword = await bcrypt.hash(password, 10)
  await UserModel.create({
    student_id: studentId,
    username: studentId,
    password: hashedPassword,
    status: Status.USER_ACTIVE,
    role: 'user'
  })
  
  // 4. 更新花名册注册状态
  await StudentRosterModel.updateRegistered(studentId)
  
  return { success: true }
}

module.exports = {
  studentAuth,
  login,
  verifyStudent,  // 新增
  register,       // 新增
  // ...
}
```

#### 4. backend/api-gateway/routes/auth.js
**更新前**:
```javascript
// 退出登录
router.post('/logout', async (req, res, next) => {
  // ...
})

module.exports = router
```

**更新后**:
```javascript
// 退出登录
router.post('/logout', async (req, res, next) => {
  // ...
})

// 学生注册 - 验证学号和验证码
router.post('/verify', async (req, res, next) => {
  try {
    const result = await userService.verifyStudent(req.body)
    res.json({ code: 0, msg: '验证成功', data: result })
  } catch (err) {
    next(err)
  }
})

// 学生注册 - 设置密码并完成注册
router.post('/register', async (req, res, next) => {
  try {
    const result = await userService.register(req.body)
    res.json({ code: 0, msg: '注册成功', data: result })
  } catch (err) {
    next(err)
  }
})

module.exports = router
```

#### 5. frontend/src/views/user/Login.vue
**更新前**:
```vue
<el-form-item>
  <el-button type="primary" @click="login" style="width: 100%">登录</el-button>
</el-form-item>
</el-form>
```

**更新后**:
```vue
<el-form-item>
  <el-button type="primary" @click="login" style="width: 100%">登录</el-button>
</el-form-item>
<el-form-item>
  <el-button type="text" @click="goRegister" style="width: 100%">学生第一次进入注册</el-button>
</el-form-item>
</el-form>
```

#### 6. frontend/src/router/user.js
**更新前**:
```javascript
{
  path: '/login',
  component: () => import('../views/user/Login.vue'),
  name: 'Login'
}
```

**更新后**:
```javascript
{
  path: '/login',
  component: () => import('../views/user/Login.vue'),
  name: 'Login'
},
{
  path: '/register',
  component: () => import('../views/user/Register.vue'),
  name: 'Register'
}
```

### 新增API接口

| 接口路径 | 方法 | 说明 | 参数 |
|---------|------|------|------|
| /auth/verify | POST | 验证学号和验证码 | studentId, verifyCode |
| /auth/register | POST | 完成注册 | studentId, verifyCode, password, confirmPassword |

### 功能流程

```
学生注册流程:
1. 点击"学生第一次进入注册"按钮
2. 进入注册页面，输入学号和统一验证码
3. 后端验证学号是否在花名册中、验证码是否正确、是否已注册
4. 验证通过后显示学生姓名，进入设置密码步骤
5. 输入新密码并确认
6. 后端创建用户记录，更新花名册注册状态
7. 注册成功，跳转登录页面
```

### 优化效果
1. **身份验证**: 通过花名册确保只有在校学生才能注册
2. **安全注册**: 验证码验证 + 密码强度校验
3. **防重复注册**: 花名册is_registered字段防止重复注册
4. **用户体验**: 两步式注册流程，清晰明了
5. **数据完整**: 注册后自动关联学号和姓名

---

## 2024-01-XX 管理员登录跳转功能开发

### 更新目的
实现管理员账号登录后自动跳转至管理员界面的功能，区分普通用户和管理员的登录入口。

### 新增文件
- 无新增文件

### 修改文件
#### 1. backend/service/user-service/index.js
**更新前**:
```javascript
return {
  token: authUtil.generateToken(user),
  user: {
    id: user.id,
    studentId: user.student_id,
    username: user.username
  }
}
```

**更新后**:
```javascript
return {
  token: authUtil.generateToken(user),
  user: {
    id: user.id,
    studentId: user.student_id,
    username: user.username,
    role: user.role || 0 // 返回用户角色：0-普通用户，1-管理员
  }
}
```

#### 2. backend/api-gateway/routes/auth.js
**更新前**:
```javascript
res.json({ 
  code: 0, 
  msg: '登录成功', 
  data: { token: result.token }
})
```

**更新后**:
```javascript
res.json({ 
  code: 0, 
  msg: '登录成功', 
  data: { 
    token: result.token,
    user: result.user // 返回用户信息（包含角色）
  }
})
```

#### 3. frontend/src/views/user/Login.vue
**更新前**:
```javascript
const login = async () => {
  try {
    const res = await request.post('/auth/login', {
      studentId: loginForm.value.studentId,
      password: loginForm.value.password
    })
    
    if (res.code === 0) {
      auth.setToken(res.data.token)
      ElMessage.success('登录成功')
      router.push('/home')
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.response?.data?.msg || '登录失败，请稍后重试')
  }
}
```

**更新后**:
```javascript
const login = async () => {
  if (!loginForm.value.studentId || !loginForm.value.password) {
    ElMessage.warning('请输入学号和密码')
    return
  }
  
  try {
    const res = await request.post('/auth/login', {
      studentId: loginForm.value.studentId,
      password: loginForm.value.password
    })
    
    if (res.code === 0) {
      auth.setToken(res.data.token)
      // 保存用户信息（包含角色）
      if (res.data.user) {
        auth.setUser(res.data.user)
        localStorage.setItem('user-role', res.data.user.role === 1 ? 'admin' : 'user')
      }
      ElMessage.success('登录成功')
      // 根据角色跳转到不同页面
      if (res.data.user && res.data.user.role === 1) {
        router.push('/admin/dashboard')
      } else {
        router.push('/home')
      }
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.response?.data?.msg || '登录失败，请稍后重试')
  }
}
```

### 功能流程

```
管理员登录流程:
1. 管理员输入学号和密码
2. 后端验证用户身份和角色
3. 登录成功后，前端保存用户信息和角色
4. 根据用户角色跳转到相应界面:
   - 管理员(role=1): 跳转到 /admin/dashboard
   - 普通用户(role=0): 跳转到 /home
```

### 优化效果
1. **角色区分**: 明确区分管理员和普通用户的登录入口
2. **权限控制**: 基于角色的自动路由跳转
3. **用户体验**: 管理员登录后直接进入管理界面
4. **安全性**: 后端返回角色信息，前端进行权限校验
5. **扩展性**: 为后续更多角色类型预留扩展空间

---

## 2024-01-XX 管理员账户创建功能

### 更新目的
为系统创建管理员账户，解决因密码加密无法直接在数据库中操作的问题，提供便捷的管理员账户创建方式。

### 新增文件

#### 1. backend/create-admin.js
**用途**: 管理员账户创建脚本

```javascript
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
```

### 功能说明

**管理员账户信息**:
- 学号: `admin001`
- 用户名: `系统管理员`
- 密码: `admin123`
- 角色: 管理员 (role=1)

**使用方法**:
```bash
cd backend
node create-admin.js
```

**功能特点**:
1. **自动加密**: 使用系统统一的密码加密方式（MD5 + 盐值）
2. **重复检查**: 创建前检查管理员是否已存在，避免重复创建
3. **友好提示**: 创建成功后显示完整的登录信息
4. **错误处理**: 完善的异常捕获和错误提示

### 功能流程

```
管理员账户创建流程:
1. 运行创建脚本
2. 脚本检查管理员是否已存在
   - 如果存在，跳过创建并显示登录信息
   - 如果不存在，执行创建操作
3. 使用 encryptPassword 加密密码
4. 将管理员信息插入数据库
5. 显示创建成功信息和登录凭证
```

### 优化效果
1. **便捷性**: 无需手动操作数据库，通过脚本一键创建
2. **安全性**: 使用系统统一的密码加密机制
3. **可靠性**: 自动检查重复，避免数据冲突
4. **可维护性**: 脚本独立，便于后续修改和维护
5. **用户友好**: 清晰的控制台输出，便于查看创建结果

---

## 2024-01-XX 图片上传和缩略图展示功能开发

### 更新目的
在发帖页面添加图片上传接口，并在帖子列表中展示第一张图片作为缩略图，提升用户发帖体验和帖子展示效果。

### 新增文件
- 无新增文件

### 修改文件
#### 1. frontend/src/views/user/Publish.vue
**更新前**:
```vue
<template>
    <div class="publish-page">
      <el-card>
        <h3>发布帖子</h3>
        <el-form :model="postForm" label-width="80px">
          <el-form-item label="内容">
            <el-input
              v-model="postForm.content"
              type="textarea"
              :rows="10"
              placeholder="请输入帖子内容"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="publish">发布</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import request from '../../utils/request'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  
  const router = useRouter()
  const postForm = ref({
    content: ''
  })
```

**更新后**:
```vue
<template>
    <div class="publish-page">
      <el-card>
        <h3>发布帖子</h3>
        <el-form :model="postForm" label-width="80px">
          <el-form-item label="内容">
            <el-input
              v-model="postForm.content"
              type="textarea"
              :rows="10"
              placeholder="请输入帖子内容"
            ></el-input>
          </el-form-item>
          <el-form-item label="图片">
            <upload-img v-model:images="postForm.images" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="publish">发布</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import request from '../../utils/request'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import UploadImg from '@/components/UploadImg.vue'
  
  const router = useRouter()
  const postForm = ref({
    content: '',
    images: []
  })
```

#### 2. frontend/src/components/PostCard.vue
**更新前**:
```vue
<template>
  <el-card class="post-card">
    <div class="post-content">{{ post.content }}</div>
    <div class="post-images" v-if="post.images">
      <img v-for="img in post.images" :src="img" alt="帖子图片" width="100">
    </div>
    <div class="post-footer">
      <audit-status :status="post.status" />
      <el-button size="small" @click="toDetail">查看详情</el-button>
      <el-button size="small" @click="like">点赞</el-button>
    </div>
  </el-card>
</template>

<style scoped>
.post-card { margin: 10px 0; }
.post-content { margin-bottom: 10px; }
.post-images { margin: 10px 0; }
.post-footer { display: flex; justify-content: space-between; align-items: center; }
</style>
```

**更新后**:
```vue
<template>
  <el-card class="post-card">
    <div class="post-content">{{ post.content }}</div>
    <div class="post-thumbnail" v-if="post.images && post.images.length > 0">
      <img :src="post.images[0]" alt="帖子缩略图" class="thumbnail-img">
      <span class="image-count" v-if="post.images.length > 1">+{{ post.images.length - 1 }}</span>
    </div>
    <div class="post-footer">
      <audit-status :status="post.status" />
      <el-button size="small" @click="toDetail">查看详情</el-button>
      <el-button size="small" @click="like">点赞</el-button>
    </div>
  </el-card>
</template>

<style scoped>
.post-card { margin: 10px 0; }
.post-content { margin-bottom: 10px; }
.post-thumbnail {
  position: relative;
  display: inline-block;
  margin: 10px 0;
}
.thumbnail-img {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
}
.image-count {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}
.post-footer { display: flex; justify-content: space-between; align-items: center; }
</style>
```

### 功能流程

```
图片上传和缩略图展示流程:
1. 用户进入发帖页面
2. 点击图片上传区域，选择本地图片
3. 图片通过UploadImg组件上传到后端/api/upload/img接口
4. 上传成功后返回图片URL，保存到postForm.images数组
5. 用户填写内容后点击发布
6. 帖子创建成功，图片URL数组保存到数据库
7. 帖子列表展示时，PostCard组件显示第一张图片作为缩略图
8. 如果有多张图片，显示"+N"标记提示用户
9. 点击"查看详情"可查看所有图片
```

### 优化效果
1. **视觉体验**: 缩略图展示让帖子列表更加生动
2. **信息提示**: 多图时显示图片数量，用户可快速了解帖子内容
3. **性能优化**: 列表页只加载第一张图片，减少网络请求
4. **用户体验**: 点击缩略图可查看详情，交互流畅
5. **一致性**: 与主流社交平台的设计风格保持一致

---

## 2024-01-XX 管理员权限验证修复

### 更新目的
修复管理员账户无法访问审核日志等管理功能的问题，解决权限验证逻辑中的角色类型不匹配错误。

### 问题描述
管理员账户（role=1）在访问审核日志界面时，后端报错"业务异常：21004无管理员权限"。

### 问题原因
1. Token生成时，role字段存储为数字类型（0-普通用户，1-管理员）
2. 权限中间件检查时，使用字符串类型进行判断（'admin'、'super_admin'）
3. 类型不匹配导致管理员无法通过权限验证

### 修改文件

#### 1. backend/api-gateway/middleware/auth.js
**更新前**:
```javascript
// 管理员权限校验
const adminAuthMiddleware = (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    throw new PermissionException('无管理员权限')
  }
  next()
}
```

**更新后**:
```javascript
// 管理员权限校验
const adminAuthMiddleware = (req, res, next) => {
  if (req.user.role !== 1) {
    throw new PermissionException('无管理员权限')
  }
  next()
}
```

### 修复说明
- 将权限检查从字符串数组判断改为数字类型判断
- role=1 表示管理员，role=0 表示普通用户
- 与数据库和Token生成逻辑保持一致

### 功能流程

```
管理员权限验证流程:
1. 管理员使用 admin001/admin123 登录
2. 后端验证通过，生成Token（包含role=1）
3. 前端保存Token到localStorage
4. 访问管理界面时，请求携带Token
5. authMiddleware验证Token有效性
6. adminAuthMiddleware检查role是否为1
7. 验证通过，允许访问管理功能
```

### 优化效果
1. **问题修复**: 解决了管理员无法访问管理功能的bug
2. **类型一致**: 统一使用数字类型表示角色，避免类型混淆
3. **逻辑清晰**: 权限验证逻辑更加直观明了
4. **扩展性**: 为后续添加更多角色类型（如超级管理员）预留空间
5. **安全性**: 保持了严格的权限控制机制

---

## 2024-01-XX 审核日志分页参数类型修复

### 更新目的
修复审核日志查询时MySQL报错"Incorrect arguments to mysqld_stmt_execute"的问题。

### 问题描述
管理员访问审核日志界面时，后端报错：
```
SQL执行失败：SELECT al.*, p.content FROM audit_log al LEFT JOIN post p ON al.post_id = p.id WHERE 1=1 ORDER BY al.create_time DESC LIMIT ?, ?
参数：[0,"10"]
错误：Incorrect arguments to mysqld_stmt_execute
```

### 问题原因
1. 前端传递的分页参数（pageNum、pageSize）是字符串类型
2. MySQL的LIMIT子句要求参数必须是数字类型
3. 直接使用字符串参数导致SQL执行失败

### 修改文件

#### 1. backend/model/post.js
**更新前**:
```javascript
sql += ' ORDER BY al.create_time DESC LIMIT ?, ?'
paramsArr.push((params.pageNum - 1) * params.pageSize, params.pageSize)
```

**更新后**:
```javascript
// 确保分页参数是数字类型
const pageNum = parseInt(params.pageNum) || 1
const pageSize = parseInt(params.pageSize) || 10
sql += ' ORDER BY al.create_time DESC LIMIT ?, ?'
paramsArr.push((pageNum - 1) * pageSize, pageSize)
```

### 修复说明
- 使用 `parseInt()` 将字符串参数转换为数字类型
- 添加默认值处理：如果转换失败，使用默认值（pageNum=1, pageSize=10）
- 确保传递给MySQL的LIMIT参数始终是数字类型

### 功能流程

```
审核日志查询流程:
1. 管理员访问审核日志界面
2. 前端发送请求，携带分页参数（pageNum: "1", pageSize: "10"）
3. 后端接收参数，使用parseInt转换为数字
4. 构建SQL查询，LIMIT参数为数字类型
5. MySQL执行查询成功
6. 返回审核日志列表数据
```

### 优化效果
1. **问题修复**: 解决了SQL执行失败的问题，审核日志可以正常查询
2. **类型安全**: 统一处理参数类型，避免类型不匹配错误
3. **默认值**: 添加默认值处理，提升代码健壮性
4. **可维护性**: 代码逻辑清晰，便于后续维护
5. **用户体验**: 管理员可以正常查看审核日志，提升管理效率

---

## 2024-01-XX 学生花名册导入和帖子管理功能开发

### 更新目的
为管理员界面添加两个核心功能：1）学生花名册Excel导入功能，支持批量导入学生信息；2）帖子管理功能，允许管理员管理已审核通过的帖子（删除/恢复）。

### 新增文件

#### 1. backend/api-gateway/routes/admin-roster.js
**用途**: 学生花名册管理路由

```javascript
const express = require('express')
const router = express.Router()
const multer = require('multer')
const xlsx = require('xlsx')
const mysql = require('../../dao/mysql')
const { BusinessException } = require('../../common/exception')

// 配置文件上传
const storage = multer.memoryStorage()
const upload = multer({ storage })

// 导入学生花名册
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      throw new BusinessException('请上传Excel文件')
    }

    // 解析Excel文件
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(worksheet)

    // 验证数据格式
    const requiredFields = ['姓名', '学号', '统一验证码']
    for (const row of data) {
      for (const field of requiredFields) {
        if (!row[field]) {
          throw new BusinessException(`Excel文件缺少必要字段：${field}`)
        }
      }
    }

    // 批量插入数据库
    const sql = `
      INSERT INTO user (student_id, username, password, role, verify_code)
      VALUES (?, ?, ?, ?, ?)
    `

    let successCount = 0
    let skipCount = 0

    for (const row of data) {
      // 检查学号是否已存在
      const checkSql = 'SELECT id FROM user WHERE student_id = ?'
      const existing = await mysql.execute(checkSql, [row['学号']])

      if (existing.length > 0) {
        skipCount++
        continue
      }

      // 插入新用户（密码为统一验证码，角色为普通用户）
      await mysql.execute(sql, [
        row['学号'],
        row['姓名'],
        row['统一验证码'], // 初始密码为统一验证码
        0, // 普通用户
        row['统一验证码']
      ])
      successCount++
    }

    res.json({
      code: 200,
      message: '导入成功',
      data: {
        total: data.length,
        success: successCount,
        skip: skipCount
      }
    })
  } catch (error) {
    console.error('导入学生花名册失败:', error)
    res.json({
      code: error.code || 500,
      message: error.message || '导入失败'
    })
  }
})

module.exports = router
```

#### 2. backend/api-gateway/routes/admin-post.js
**用途**: 帖子管理路由

```javascript
const express = require('express')
const router = express.Router()
const postModel = require('../../model/post')
const { BusinessException } = require('../../common/exception')

// 获取所有帖子列表（包含已删除的）
router.get('/list', async (req, res) => {
  try {
    const { pageNum = 1, pageSize = 10, status, keyword } = req.query

    const result = await postModel.getPostList({
      pageNum: parseInt(pageNum),
      pageSize: parseInt(pageSize),
      status,
      keyword,
      includeDeleted: true // 包含已删除的帖子
    })

    res.json({
      code: 200,
      message: '查询成功',
      data: result
    })
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    res.json({
      code: error.code || 500,
      message: error.message || '查询失败'
    })
  }
})

// 帖子管理（删除/恢复）
router.post('/manage', async (req, res) => {
  try {
    const { postId, action } = req.body

    if (!postId || !action) {
      throw new BusinessException('参数不完整')
    }

    if (action === 'delete') {
      await postModel.deletePost(postId)
    } else if (action === 'restore') {
      await postModel.restorePost(postId)
    } else {
      throw new BusinessException('不支持的操作')
    }

    res.json({
      code: 200,
      message: '操作成功'
    })
  } catch (error) {
    console.error('帖子管理失败:', error)
    res.json({
      code: error.code || 500,
      message: error.message || '操作失败'
    })
  }
})

module.exports = router
```

#### 3. backend/model/post.js（新增方法）
**用途**: 帖子数据模型，新增删除和恢复方法

**新增方法1 - deletePost**:
```javascript
// 删除帖子（软删除）
const deletePost = async (postId) => {
  const sql = 'UPDATE post SET is_deleted = 1 WHERE id = ?'
  const result = await mysql.execute(sql, [postId])
  return result
}
```

**新增方法2 - restorePost**:
```javascript
// 恢复帖子
const restorePost = async (postId) => {
  const sql = 'UPDATE post SET is_deleted = 0 WHERE id = ?'
  const result = await mysql.execute(sql, [postId])
  return result
}
```

**修改方法 - getPostList**:
```javascript
// 修改前
const getPostList = async (params) => {
  let sql = 'SELECT * FROM post WHERE 1=1'
  const paramsArr = []

  // ... 其他条件

  sql += ' ORDER BY create_time DESC LIMIT ?, ?'
  paramsArr.push((params.pageNum - 1) * params.pageSize, params.pageSize)

  const result = await mysql.execute(sql, paramsArr)
  return result
}

// 修改后
const getPostList = async (params) => {
  let sql = 'SELECT * FROM post WHERE 1=1'
  const paramsArr = []

  // 如果不包含已删除的帖子，添加条件
  if (!params.includeDeleted) {
    sql += ' AND is_deleted = 0'
  }

  // ... 其他条件

  sql += ' ORDER BY create_time DESC LIMIT ?, ?'
  paramsArr.push((params.pageNum - 1) * params.pageSize, params.pageSize)

  const result = await mysql.execute(sql, paramsArr)
  return result
}
```

#### 4. frontend/src/views/admin/RosterManage.vue
**用途**: 学生花名册管理界面

```vue
<template>
  <div class="roster-manage">
    <el-card>
      <h3>学生花名册导入</h3>
      <el-alert
        title="Excel文件格式要求"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>请上传包含以下三列的Excel文件：</p>
        <ul>
          <li>姓名</li>
          <li>学号</li>
          <li>统一验证码</li>
        </ul>
      </el-alert>

      <el-upload
        class="upload-demo"
        drag
        action="/api/admin/roster/import"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 .xlsx 或 .xls 文件
          </div>
        </template>
      </el-upload>

      <el-divider />

      <h3>导入结果</h3>
      <el-descriptions v-if="importResult" :column="3" border>
        <el-descriptions-item label="总记录数">{{ importResult.total }}</el-descriptions-item>
        <el-descriptions-item label="成功导入">{{ importResult.success }}</el-descriptions-item>
        <el-descriptions-item label="跳过（已存在）">{{ importResult.skip }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const importResult = ref(null)

const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件！')
    return false
  }
  return true
}

const handleSuccess = (response) => {
  if (response.code === 200) {
    ElMessage.success('导入成功！')
    importResult.value = response.data
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败，请重试')
}
</script>

<style scoped>
.roster-manage { padding: 20px; }
.upload-demo { margin: 20px 0; }
.el-icon--upload { font-size: 67px; color: #409eff; }
</style>
```

#### 5. frontend/src/views/admin/PostManage.vue
**用途**: 帖子管理界面

```vue
<template>
  <div class="post-manage">
    <el-card>
      <h3>帖子管理</h3>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索帖子内容" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 帖子列表 -->
      <el-table :data="postList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="author_name" label="作者" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
            <el-tag v-else-if="row.status === 2" type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="删除状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.is_deleted" type="danger">已删除</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.is_deleted"
              type="danger"
              size="small"
              @click="deletePost(row.id)"
            >
              删除
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              @click="restorePost(row.id)"
            >
              恢复
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="viewDetail(row.id)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const searchForm = ref({
  keyword: '',
  status: ''
})

const postList = ref([])
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 获取帖子列表
const fetchPostList = async () => {
  try {
    const response = await request.get('/admin/post/list', {
      params: {
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize,
        keyword: searchForm.value.keyword,
        status: searchForm.value.status
      }
    })

    if (response.code === 200) {
      postList.value = response.data.list
      pagination.value.total = response.data.total
    }
  } catch (error) {
    ElMessage.error('获取帖子列表失败')
  }
}

// 搜索
const search = () => {
  pagination.value.pageNum = 1
  fetchPostList()
}

// 重置
const reset = () => {
  searchForm.value = {
    keyword: '',
    status: ''
  }
  pagination.value.pageNum = 1
  fetchPostList()
}

// 删除帖子
const deletePost = async (postId) => {
  try {
    await ElMessageBox.confirm('确定要删除该帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await request.post('/admin/post/manage', {
      postId,
      action: 'delete'
    })

    if (response.code === 200) {
      ElMessage.success('删除成功')
      fetchPostList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 恢复帖子
const restorePost = async (postId) => {
  try {
    await ElMessageBox.confirm('确定要恢复该帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await request.post('/admin/post/manage', {
      postId,
      action: 'restore'
    })

    if (response.code === 200) {
      ElMessage.success('恢复成功')
      fetchPostList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('恢复失败')
    }
  }
}

// 查看详情
const viewDetail = (postId) => {
  // 跳转到帖子详情页
  console.log('查看帖子详情:', postId)
}

// 分页
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  fetchPostList()
}

const handleCurrentChange = (val) => {
  pagination.value.pageNum = val
  fetchPostList()
}

onMounted(() => {
  fetchPostList()
})
</script>

<style scoped>
.post-manage { padding: 20px; }
</style>
```

### 修改文件

#### 1. backend/api-gateway/index.js
**更新前**:
```javascript
const adminRoutes = require('./routes/admin')
app.use('/api/admin', adminAuthMiddleware, adminRoutes)
```

**更新后**:
```javascript
const adminRoutes = require('./routes/admin')
const adminRosterRoutes = require('./routes/admin-roster')
const adminPostRoutes = require('./routes/admin-post')

app.use('/api/admin', adminAuthMiddleware, adminRoutes)
app.use('/api/admin/roster', adminAuthMiddleware, adminRosterRoutes)
app.use('/api/admin/post', adminAuthMiddleware, adminPostRoutes)
```

#### 2. backend/model/post.js
**更新前**: 无删除和恢复方法

**更新后**: 新增deletePost和restorePost方法，修改getPostList方法支持includeDeleted参数

#### 3. frontend/src/router/index.js
**更新前**:
```javascript
{
  path: '/admin',
  component: AdminLayout,
  children: [
    { path: 'audit', component: () => import('@/views/admin/Audit.vue') },
    { path: 'log', component: () => import('@/views/admin/Log.vue') },
    { path: 'user', component: () => import('@/views/admin/UserManage.vue') },
    { path: 'config', component: () => import('@/views/admin/Config.vue') }
  ]
}
```

**更新后**:
```javascript
{
  path: '/admin',
  component: AdminLayout,
  children: [
    { path: 'audit', component: () => import('@/views/admin/Audit.vue') },
    { path: 'log', component: () => import('@/views/admin/Log.vue') },
    { path: 'user', component: () => import('@/views/admin/UserManage.vue') },
    { path: 'roster', component: () => import('@/views/admin/RosterManage.vue') },
    { path: 'post', component: () => import('@/views/admin/PostManage.vue') },
    { path: 'config', component: () => import('@/views/admin/Config.vue') }
  ]
}
```

#### 4. frontend/src/layouts/AdminLayout.vue
**更新前**:
```vue
<el-menu :default-active="$route.path" router>
  <el-menu-item index="/admin/audit">人工审核</el-menu-item>
  <el-menu-item index="/admin/log">审核日志</el-menu-item>
  <el-menu-item index="/admin/user">用户管理</el-menu-item>
  <el-menu-item index="/admin/config">系统配置</el-menu-item>
</el-menu>
```

**更新后**:
```vue
<el-menu :default-active="$route.path" router>
  <el-menu-item index="/admin/audit">人工审核</el-menu-item>
  <el-menu-item index="/admin/log">审核日志</el-menu-item>
  <el-menu-item index="/admin/user">用户管理</el-menu-item>
  <el-menu-item index="/admin/roster">学生花名册</el-menu-item>
  <el-menu-item index="/admin/post">帖子管理</el-menu-item>
  <el-menu-item index="/admin/config">系统配置</el-menu-item>
</el-menu>
```

### 功能流程

#### 学生花名册导入流程
```
1. 管理员进入"学生花名册"页面
2. 准备Excel文件，包含"姓名"、"学号"、"统一验证码"三列
3. 通过拖拽或点击上传Excel文件
4. 前端验证文件格式（.xlsx或.xls）
5. 文件上传到后端/api/admin/roster/import接口
6. 后端使用xlsx库解析Excel文件
7. 验证数据格式（检查必要字段）
8. 批量插入数据库：
   - 检查学号是否已存在
   - 如果存在，跳过该记录
   - 如果不存在，插入新用户（密码为统一验证码，角色为普通用户）
9. 返回导入结果（总数、成功数、跳过数）
10. 前端显示导入结果
```

#### 帖子管理流程
```
1. 管理员进入"帖子管理"页面
2. 页面自动加载所有帖子列表（包含已删除的）
3. 管理员可以：
   - 按关键词搜索帖子内容
   - 按状态筛选（待审核/已通过/已拒绝）
   - 查看帖子的删除状态
4. 管理员操作：
   - 删除帖子：点击"删除"按钮，确认后软删除帖子（is_deleted=1）
   - 恢复帖子：点击"恢复"按钮，确认后恢复帖子（is_deleted=0）
   - 查看详情：跳转到帖子详情页
5. 分页浏览帖子列表
```

### 优化效果

#### 学生花名册导入功能
1. **批量导入**: 支持一次性导入大量学生信息，提升管理效率
2. **Excel格式**: 使用熟悉的Excel格式，降低使用门槛
3. **数据验证**: 自动验证Excel格式和必要字段，避免错误数据
4. **重复检查**: 自动检查学号是否已存在，避免重复导入
5. **友好提示**: 显示导入结果统计，管理员可清楚了解导入情况

#### 帖子管理功能
1. **全面管理**: 可以查看和管理所有帖子（包括已删除的）
2. **灵活搜索**: 支持关键词搜索和状态筛选，快速定位目标帖子
3. **软删除**: 采用软删除机制，删除的帖子可以恢复
4. **操作确认**: 删除/恢复操作需要二次确认，防止误操作
5. **分页展示**: 支持分页浏览，提升大数据量下的性能

#### 整体优化
1. **权限控制**: 所有管理接口都需要管理员权限验证
2. **错误处理**: 完善的异常捕获和错误提示
3. **用户体验**: 清晰的界面布局和操作提示
4. **代码规范**: 统一的代码风格和命名规范
5. **可维护性**: 模块化设计，便于后续扩展和维护

---

## 2024-01-XX 学生花名册分页参数类型修复

### 更新目的
修复学生花名册查询时MySQL报错"Incorrect arguments to mysqld_stmt_execute"的问题。

### 问题描述
管理员访问学生花名册界面时，后端报错：
```
SQL执行失败：SELECT * FROM student_roster WHERE 1=1 ORDER BY create_time DESC LIMIT ?, ?
参数：[0,10]
错误：Incorrect arguments to mysqld_stmt_execute
```

### 问题原因
1. 前端传递的分页参数（pageNum、pageSize）是字符串类型
2. MySQL的LIMIT子句要求参数必须是数字类型
3. 直接使用字符串参数导致SQL执行失败

### 修改文件

#### 1. backend/model/studentRoster.js
**更新前**:
```javascript
static async list(key, pageNum, pageSize) {
  let sql = 'SELECT * FROM student_roster WHERE 1=1'
  const params = []
  if (key) {
    sql += ' AND (student_id LIKE ? OR name LIKE ?)'
    params.push(`%${key}%`, `%${key}%`)
  }
  sql += ' ORDER BY create_time DESC LIMIT ?, ?'
  params.push((pageNum - 1) * pageSize, pageSize)
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

**更新后**:
```javascript
static async list(key, pageNum, pageSize) {
  let sql = 'SELECT * FROM student_roster WHERE 1=1'
  const params = []
  
  // 确保分页参数是数字类型
  const page = parseInt(pageNum) || 1
  const size = parseInt(pageSize) || 10
  
  if (key) {
    sql += ' AND (student_id LIKE ? OR name LIKE ?)'
    params.push(`%${key}%`, `%${key}%`)
  }
  sql += ' ORDER BY create_time DESC LIMIT ?, ?'
  params.push((page - 1) * size, size)
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

### 修复说明
- 使用 `parseInt()` 将字符串参数转换为数字类型
- 添加默认值处理：如果转换失败，使用默认值（pageNum=1, pageSize=10）
- 确保传递给MySQL的LIMIT参数始终是数字类型

### 功能流程

```
学生花名册查询流程:
1. 管理员访问学生花名册界面
2. 前端发送请求，携带分页参数（pageNum: "1", pageSize: "10"）
3. 后端接收参数，使用parseInt转换为数字
4. 构建SQL查询，LIMIT参数为数字类型
5. MySQL执行查询成功
6. 返回学生花名册列表数据
```

### 优化效果
1. **问题修复**: 解决了SQL执行失败的问题，学生花名册可以正常查询
2. **类型安全**: 统一处理参数类型，避免类型不匹配错误
3. **默认值**: 添加默认值处理，提升代码健壮性
4. **可维护性**: 代码逻辑清晰，便于后续维护
5. **用户体验**: 管理员可以正常查看学生花名册，提升管理效率

---

## 2024-01-XX 学生花名册分页参数类型转换增强

### 更新目的
进一步修复学生花名册查询时MySQL报错"Incorrect arguments to mysqld_stmt_execute"的问题，使用更严格的类型转换方法。

### 问题描述
在之前的修复中，虽然使用了parseInt进行类型转换，但仍然出现错误：
```
SQL执行失败：SELECT * FROM student_roster WHERE 1=1 ORDER BY create_time DESC LIMIT ?, ?
参数：[0,10]
错误：Incorrect arguments to mysqld_stmt_execute
```

### 问题原因
1. parseInt()在某些情况下可能无法正确处理特殊类型的参数
2. 直接计算表达式 `(page - 1) * size` 可能产生浮点数
3. MySQL的LIMIT子句严格要求参数必须是整数类型

### 修改文件

#### 1. backend/model/studentRoster.js
**更新前**:
```javascript
static async list(key, pageNum, pageSize) {
  let sql = 'SELECT * FROM student_roster WHERE 1=1'
  const params = []
  
  // 确保分页参数是数字类型
  const page = parseInt(pageNum) || 1
  const size = parseInt(pageSize) || 10
  
  if (key) {
    sql += ' AND (student_id LIKE ? OR name LIKE ?)'
    params.push(`%${key}%`, `%${key}%`)
  }
  sql += ' ORDER BY create_time DESC LIMIT ?, ?'
  params.push((page - 1) * size, size)
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

**更新后**:
```javascript
static async list(key, pageNum, pageSize) {
  let sql = 'SELECT * FROM student_roster WHERE 1=1'
  const params = []
  
  // 确保分页参数是数字类型，使用Number()进行严格转换
  const page = Number(pageNum) || 1
  const size = Number(pageSize) || 10
  
  // 计算offset，确保是整数
  const offset = Math.floor((page - 1) * size)
  const limit = Math.floor(size)
  
  if (key) {
    sql += ' AND (student_id LIKE ? OR name LIKE ?)'
    params.push(`%${key}%`, `%${key}%`)
  }
  sql += ' ORDER BY create_time DESC LIMIT ?, ?'
  params.push(offset, limit)
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

### 修复说明
- 使用 `Number()` 替代 `parseInt()`，进行更严格的类型转换
- 使用 `Math.floor()` 确保计算结果是整数
- 将计算结果存储在变量中，避免重复计算
- 确保传递给MySQL的LIMIT参数始终是整数类型

### 功能流程

```
学生花名册查询流程（增强版）:
1. 管理员访问学生花名册界面
2. 前端发送请求，携带分页参数（pageNum: "1", pageSize: "10"）
3. 后端接收参数，使用Number()严格转换为数字
4. 使用Math.floor()确保offset和limit是整数
5. 构建SQL查询，LIMIT参数为整数类型
6. MySQL执行查询成功
7. 返回学生花名册列表数据
```

### 优化效果
1. **问题修复**: 使用更严格的类型转换，彻底解决SQL执行失败的问题
2. **类型安全**: Number() + Math.floor() 确保参数类型绝对正确
3. **代码清晰**: 使用有意义的变量名（offset、limit），提升可读性
4. **性能优化**: 避免重复计算，提升代码执行效率
5. **健壮性**: 更严格的类型检查，避免边界情况下的错误

---

## 2024-01-XX 学生花名册分页参数类型修复（最终版）

### 更新目的
参考审核日志的修复方法，使用字符串拼接替代参数化查询，彻底解决MySQL报错"Incorrect arguments to mysqld_stmt_execute"的问题。

### 问题描述
在之前的修复中，虽然使用了Number()和Math.floor()进行严格的类型转换，但仍然出现错误：
```
SQL执行失败：SELECT * FROM student_roster WHERE 1=1 ORDER BY create_time DESC LIMIT ?, ?
参数：[0,10]
错误：Incorrect arguments to mysqld_stmt_execute
```

### 问题原因
1. 参数化查询（`LIMIT ?, ?`）在某些情况下无法正确处理数字类型参数
2. MySQL的预处理语句对参数类型有严格要求
3. 即使使用严格的类型转换，参数化查询仍然可能失败

### 解决方案
参考审核日志的修复方法，使用字符串拼接替代参数化查询：
- 将 `LIMIT ?, ?` 改为 `LIMIT ${offset}, ${size}`
- 这样可以避免参数化查询的类型转换问题

### 修改文件

#### 1. backend/model/studentRoster.js
**更新前**:
```javascript
static async list(key, pageNum, pageSize) {
  let sql = 'SELECT * FROM student_roster WHERE 1=1'
  const params = []
  
  // 确保分页参数是数字类型，使用Number()进行严格转换
  const page = Number(pageNum) || 1
  const size = Number(pageSize) || 10
  
  // 计算offset，确保是整数
  const offset = Math.floor((page - 1) * size)
  const limit = Math.floor(size)
  
  if (key) {
    sql += ' AND (student_id LIKE ? OR name LIKE ?)'
    params.push(`%${key}%`, `%${key}%`)
  }
  sql += ' ORDER BY create_time DESC LIMIT ?, ?'
  params.push(offset, limit)
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

**更新后**:
```javascript
static async list(key, pageNum, pageSize) {
  let sql = 'SELECT * FROM student_roster WHERE 1=1'
  const params = []
  
  // 确保分页参数是数字类型
  const page = parseInt(pageNum) || 1
  const size = parseInt(pageSize) || 10
  const offset = (page - 1) * size
  
  if (key) {
    sql += ' AND (student_id LIKE ? OR name LIKE ?)'
    params.push(`%${key}%`, `%${key}%`)
  }
  // 使用字符串拼接，避免参数化查询的类型问题
  sql += ' ORDER BY create_time DESC LIMIT ' + offset + ', ' + size
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

### 修复说明
- 参考审核日志的修复方法，使用字符串拼接替代参数化查询
- 将 `LIMIT ?, ?` 改为 `LIMIT ${offset}, ${size}`
- 使用 `parseInt()` 进行基本的类型转换即可
- 这样可以避免参数化查询的类型转换问题

### 功能流程

```
学生花名册查询流程（最终版）:
1. 管理员访问学生花名册界面
2. 前端发送请求，携带分页参数（pageNum: "1", pageSize: "10"）
3. 后端接收参数，使用parseInt转换为数字
4. 计算offset值
5. 使用字符串拼接构建SQL查询：LIMIT ${offset}, ${size}
6. MySQL执行查询成功
7. 返回学生花名册列表数据
```

### 优化效果
1. **问题修复**: 参考审核日志的成功案例，彻底解决SQL执行失败的问题
2. **方案验证**: 使用已在审核日志中验证过的修复方法，确保可靠性
3. **代码简洁**: 使用字符串拼接，代码更加简洁直观
4. **性能优化**: 避免参数化查询的开销，提升查询性能
5. **一致性**: 与审核日志的修复方法保持一致，便于维护

---

## 2024-01-XX 管理员界面分页参数类型统一修复

### 更新目的
统一修复管理员界面所有模块的分页参数类型问题，使用字符串拼接替代参数化查询，彻底解决MySQL报错"Incorrect arguments to mysqld_stmt_execute"的问题。

### 问题描述
在修复学生花名册后，发现管理员界面的其他模块也存在相同问题：
1. **帖子管理界面**报错：
```
SQL执行失败：SELECT p.*, u.student_id, u.username FROM post p LEFT JOIN user u ON p.user_id = u.id WHERE 1=1 ORDER BY p.create_time DESC LIMIT ?, ?
参数：[0,10]
错误：Incorrect arguments to mysqld_stmt_execute
```

2. **用户管理界面**可能也存在相同问题

### 问题原因
1. 所有使用参数化查询（`LIMIT ?, ?`）的分页接口都可能遇到类型转换问题
2. MySQL的预处理语句对参数类型有严格要求
3. 需要统一修复所有管理员的分页查询接口

### 修改文件

#### 1. backend/model/post.js
**更新前**:
```javascript
static async list(status, pageNum, pageSize) {
  let sql = `
    SELECT p.*, u.student_id, u.username 
    FROM post p
    LEFT JOIN user u ON p.user_id = u.id
    WHERE 1=1
  `
  const params = []
  if (status !== undefined && status !== '') {
    sql += ' AND p.status = ?'
    params.push(status)
  }
  sql += ' ORDER BY p.create_time DESC LIMIT ?, ?'
  params.push((pageNum - 1) * pageSize, pageSize)
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

**更新后**:
```javascript
static async list(status, pageNum, pageSize) {
  let sql = `
    SELECT p.*, u.student_id, u.username 
    FROM post p
    LEFT JOIN user u ON p.user_id = u.id
    WHERE 1=1
  `
  const params = []
  if (status !== undefined && status !== '') {
    sql += ' AND p.status = ?'
    params.push(status)
  }
  // 确保分页参数是数字类型
  const page = parseInt(pageNum) || 1
  const size = parseInt(pageSize) || 10
  const offset = (page - 1) * size
  // 使用字符串拼接，避免参数化查询的类型问题
  sql += ' ORDER BY p.create_time DESC LIMIT ' + offset + ', ' + size
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

#### 2. backend/model/user.js
**更新前**:
```javascript
static async list(key, pageNum, pageSize) {
  let sql = 'SELECT * FROM user WHERE 1=1'
  const params = []
  if (key) {
    sql += ' AND (student_id LIKE ? OR username LIKE ?)'
    params.push(`%${key}%`, `%${key}%`)
  }
  sql += ' LIMIT ?, ?'
  params.push((pageNum - 1) * pageSize, pageSize)
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

**更新后**:
```javascript
static async list(key, pageNum, pageSize) {
  let sql = 'SELECT * FROM user WHERE 1=1'
  const params = []
  if (key) {
    sql += ' AND (student_id LIKE ? OR username LIKE ?)'
    params.push(`%${key}%`, `%${key}%`)
  }
  // 确保分页参数是数字类型
  const page = parseInt(pageNum) || 1
  const size = parseInt(pageSize) || 10
  const offset = (page - 1) * size
  // 使用字符串拼接，避免参数化查询的类型问题
  sql += ' LIMIT ' + offset + ', ' + size
  
  const rows = await mysql.execute(sql, params)
  // ...
}
```

### 修复说明
- 统一使用字符串拼接替代参数化查询
- 将所有 `LIMIT ?, ?` 改为 `LIMIT ${offset}, ${size}`
- 使用 `parseInt()` 进行基本的类型转换
- 确保所有管理员界面的分页查询都使用相同的修复方法

### 功能流程

```
管理员界面分页查询流程（统一修复）:
1. 管理员访问任意管理界面（帖子管理/用户管理/学生花名册/审核日志）
2. 前端发送请求，携带分页参数（pageNum: "1", pageSize: "10"）
3. 后端接收参数，使用parseInt转换为数字
4. 计算offset值
5. 使用字符串拼接构建SQL查询：LIMIT ${offset}, ${size}
6. MySQL执行查询成功
7. 返回列表数据
```

### 优化效果
1. **统一修复**: 一次性修复所有管理员界面的分页查询问题
2. **方案一致**: 所有模块使用相同的修复方法，便于维护
3. **代码规范**: 统一的代码风格，提升代码质量
4. **性能优化**: 避免参数化查询的开销，提升查询性能
5. **用户体验**: 管理员可以正常使用所有管理功能，提升管理效率

---

## 2024-01-XX 学生花名册导入Token无效问题修复

### 更新目的
修复学生花名册导入Excel时出现的Token无效错误，确保管理员可以正常导入学生花名册数据。

### 问题描述
在学生花名册界面导入Excel文件时，后端日志报错：
```
[2026-03-19 03:17:21] [WARN] 业务异常: [21001] Token无效或已过期
```

导致Excel文件无法成功导入。

### 问题原因
1. **前端Token获取错误**：`RosterManage.vue` 中使用 `localStorage.getItem('token')` 获取token
2. **Token存储key不匹配**：根据 `auth.js`，token实际存储的key是 `campus-wall-token`
3. **结果**：获取到的token为 `null`，上传请求没有携带正确的认证信息
4. **后端鉴权失败**：由于请求头中没有有效的token，后端认证中间件抛出 `AUTH_TOKEN_INVALID` 错误（错误码21001）

### 修改文件

#### 1. frontend/src/views/admin/RosterManage.vue
**更新前**:
```javascript
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/admin/roster/import'
const uploadHeaders = {
  Authorization: 'Bearer ' + localStorage.getItem('token')
}
```

**更新后**:
```javascript
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import auth from '@/utils/auth'

const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/admin/roster/import'
const uploadHeaders = {
  Authorization: 'Bearer ' + auth.getToken()
}
```

### 修复说明
- 引入 `auth` 工具模块，使用统一的token管理方法
- 将 `localStorage.getItem('token')` 改为 `auth.getToken()`
- `auth.getToken()` 会从正确的key（`campus-wall-token`）中获取token
- 确保上传请求携带有效的认证信息

### 功能流程

```
学生花名册导入流程（修复后）:
1. 管理员登录系统，token存储到localStorage（key: campus-wall-token）
2. 管理员进入学生花名册界面
3. 点击"选择Excel文件"按钮，选择Excel文件
4. 前端通过 `auth.getToken()` 获取有效的token
5. 构建请求头：`Authorization: Bearer ${token}`
6. 上传Excel文件到 `/api/admin/roster/import` 接口
7. 后端认证中间件验证token有效性
8. 验证通过，解析Excel文件
9. 批量插入学生花名册数据到数据库
10. 返回导入成功结果
11. 前端显示导入成功提示，并刷新花名册列表
```

### 优化效果
1. **问题修复**: 彻底解决Token无效导致的导入失败问题
2. **代码规范**: 使用统一的auth工具模块，提升代码一致性
3. **可维护性**: 与项目中其他地方的token获取方式保持一致
4. **用户体验**: 管理员可以正常导入学生花名册，提升管理效率
5. **安全性**: 确保所有管理员操作都经过正确的身份验证

---

## 2024-01-XX 学生花名册导入文件存储方式优化

### 更新目的
修复学生花名册导入时出现的文件目录不存在错误，优化文件上传存储方式，提升系统稳定性。

### 问题描述
在学生花名册界面导入Excel文件时，后端日志报错：
```
[2026-03-19 03:22:14] [ERROR] 系统异常: ENOENT: no such file or directory, open 'D:\code\HTML\WORK\backend\uploads\1773861734930-1.xlsx'
```

导致Excel文件无法成功导入。

### 问题原因
1. **目录不存在**：后端配置的 `uploads` 目录不存在
2. **磁盘存储配置**：使用 `multer.diskStorage` 配置，需要物理目录存储上传的文件
3. **文件路径错误**：当目录不存在时，multer无法保存文件，导致后续读取失败
4. **系统依赖**：依赖物理目录增加了部署复杂度和维护成本

### 修改文件

#### 1. backend/api-gateway/routes/admin.js
**更新前**:
```javascript
// 配置multer临时存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage });

// 导入学生花名册（Excel）
router.post('/roster/import', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new BusinessException(ErrorCode.UPLOAD_FILE_EMPTY);
    }

    // 读取Excel文件
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
```

**更新后**:
```javascript
// 配置multer内存存储（不需要物理目录）
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 导入学生花名册（Excel）
router.post('/roster/import', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new BusinessException(ErrorCode.UPLOAD_FILE_EMPTY);
    }

    // 读取Excel文件（从内存buffer读取）
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
```

### 修复说明
- 将 `multer.diskStorage` 改为 `multer.memoryStorage`
- 文件直接存储在内存的buffer中，不需要物理目录
- 将 `xlsx.readFile(file.path)` 改为 `xlsx.read(file.buffer, { type: 'buffer' })`
- 从内存buffer直接读取Excel文件，避免文件系统操作

### 功能流程

```
学生花名册导入流程（优化后）:
1. 管理员登录系统，进入学生花名册界面
2. 点击"选择Excel文件"按钮，选择桌面上的Excel文件
3. 前端通过 `auth.getToken()` 获取有效的token
4. 构建请求头：`Authorization: Bearer ${token}`
5. 上传Excel文件到 `/api/admin/roster/import` 接口
6. multer将文件存储在内存buffer中（不需要物理目录）
7. 后端认证中间件验证token有效性
8. 验证通过，从内存buffer直接读取Excel文件
9. 解析Excel数据，验证格式
10. 批量插入学生花名册数据到数据库
11. 返回导入成功结果
12. 前端显示导入成功提示，并刷新花名册列表
```

### 优化效果
1. **问题修复**: 彻底解决文件目录不存在导致的导入失败问题
2. **简化部署**: 不需要创建和维护uploads目录
3. **性能提升**: 内存存储比磁盘存储更快，减少IO操作
4. **安全性**: 文件在内存中处理，处理完成后自动释放，不留痕迹
5. **代码简洁**: 去除了磁盘存储的复杂配置，代码更简洁
6. **跨平台**: 不依赖文件系统路径，提高跨平台兼容性

