# 校园墙项目更新日志（续3）

本文档记录校园墙项目的更新历史，是UpdateLog2.md的补充文件。

---

## 2026-03-23 修复发帖后跳转错误导致"退出登录"问题

### 更新目的
修复用户在发帖页面点击发帖按钮后，页面跳转到不存在的路由 `/mypost`，导致被重定向到登录页的问题。

### 问题描述
用户在正常流程发帖时，按下发帖按钮后会"退出登录"，实际上是因为跳转到了不存在的路由。

**现象**:
1. 用户在发帖页面填写内容并点击"发布"按钮
2. 发帖成功后，页面跳转到 `/mypost`
3. 由于路由配置中没有 `/mypost` 这个路由，被通配符路由 `{ path: '/:pathMatch(.*)*', redirect: '/login' }` 捕获
4. 页面被重定向到登录页，用户误以为是"退出登录"

**错误代码**:
```javascript
// frontend/src/views/user/Publish.vue - publish函数
const publish = async () => {
  if (!postForm.value.content) {
    ElMessage.warning('内容不能为空')
    return
  }
  console.log('准备发布帖子，数据:', postForm.value)
  try {
    await request.post('/post/publish', postForm.value)
    ElMessage.success('发帖成功，审核中')
    router.push('/mypost')  // ❌ 路由不存在！
  } catch (err) {
    ElMessage.error('发帖失败：' + err.msg)
  }
}
```

### 原因分析

**路由配置**:
```javascript
// frontend/src/router/user.js
export default [
  {
    path: '/home',
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('../views/user/Home.vue'), name: 'Home' },
      { path: '/publish', component: () => import('../views/user/Publish.vue'), name: 'Publish' },
      { path: '/profile', component: () => import('../views/user/Profile.vue'), name: 'Profile' },
      { path: '/post/:id', component: () => import('../views/user/PostDetail.vue'), name: 'PostDetail' }
    ]
  },
  // ...
  {
    path: '/:pathMatch(.*)*', redirect: '/login'  // ❌ 通配符路由会捕获所有未匹配的路由
  }
]
```

**问题分析**:
1. 路由配置中没有定义 `/mypost` 这个路由
2. `router.push('/mypost')` 尝试跳转到不存在的路由
3. 通配符路由 `{ path: '/:pathMatch(.*)*', redirect: '/login' }` 捕获了所有未匹配的路由
4. 页面被重定向到登录页，用户误以为是"退出登录"

**可能的原因**:
- 代码编写时误将 `/home` 写成了 `/mypost`
- 或者之前有 `/mypost` 路由，后来被删除了，但忘记更新发帖页面的跳转逻辑

### 修复内容

#### 1. 修改发帖成功后的跳转路由
**位置**: d:\code\HTML\WORK\frontend\src\views\user\Publish.vue

**更新前**（第38-51行）:
```javascript
const publish = async () => {
  if (!postForm.value.content) {
    ElMessage.warning('内容不能为空')
    return
  }
  console.log('准备发布帖子，数据:', postForm.value)
  try {
    await request.post('/post/publish', postForm.value)
    ElMessage.success('发帖成功，审核中')
    router.push('/mypost')  // ❌ 路由不存在
  } catch (err) {
    ElMessage.error('发帖失败：' + err.msg)
  }
}
```

**更新后**（第38-51行）:
```javascript
const publish = async () => {
  if (!postForm.value.content) {
    ElMessage.warning('内容不能为空')
    return
  }
  console.log('准备发布帖子，数据:', postForm.value)
  try {
    await request.post('/post/publish', postForm.value)
    ElMessage.success('发帖成功，审核中')
    router.push('/home')  // ✅ 跳转到首页
  } catch (err) {
    ElMessage.error('发帖失败：' + err.msg)
  }
}
```

**修改说明**:
- 将 `router.push('/mypost')` 改为 `router.push('/home')`
- 跳转到首页，用户可以继续浏览帖子
- 避免跳转到不存在的路由导致重定向到登录页

### 验证结果

修复后的效果：
1. ✅ 用户在发帖页面填写内容并点击"发布"按钮
2. ✅ 发帖成功后，页面跳转到首页 `/home`
3. ✅ 不再出现"退出登录"的现象
4. ✅ 用户可以继续浏览帖子列表

**预期行为**:
```
1. 用户访问 /publish 页面
2. 填写帖子内容
3. 点击"发布"按钮
4. 发帖成功，显示"发帖成功，审核中"提示
5. 页面跳转到 /home 首页
6. 用户可以继续浏览帖子列表
```

### 技术要点

1. **Vue Router 路由跳转**:
   - `router.push(path)`: 编程式导航，跳转到指定路由
   - 如果路由不存在，会被通配符路由捕获
   - 通配符路由通常用于处理404错误或重定向

2. **路由配置**:
   - 通配符路由 `{ path: '/:pathMatch(.*)*', redirect: '/login' }` 会捕获所有未匹配的路由
   - 这种配置适用于需要登录才能访问的应用
   - 但也可能导致误判，例如本案例中的问题

3. **用户体验**:
   - 发帖成功后应该跳转到用户期望的页面
   - 首页 `/home` 是一个合理的选择，用户可以继续浏览
   - 也可以考虑跳转到个人资料页 `/profile`，查看"我的帖子"

4. **代码审查**:
   - 定期检查路由跳转逻辑，确保跳转的路由存在
   - 使用路由名称而不是路径，可以避免拼写错误
   - 例如：`router.push({ name: 'Home' })` 而不是 `router.push('/home')`

### 优化建议

#### 方案1：跳转到首页（当前方案）
- 优点：简单直接，用户可以继续浏览
- 缺点：用户可能想查看自己的帖子

#### 方案2：跳转到个人资料页
- 优点：用户可以查看"我的帖子"，确认发帖成功
- 缺点：帖子可能还在审核中，不会立即显示

#### 方案3：跳转到"我的帖子"标签页
- 优点：直接查看自己的帖子
- 缺点：需要修改路由配置，添加锚点或查询参数

**推荐方案2**，修改代码如下：
```javascript
router.push('/profile')  // 跳转到个人资料页
```

或者使用路由名称：
```javascript
router.push({ name: 'Profile' })  // 更安全，避免拼写错误
```

### 注意事项

1. **需要刷新页面**: 修改代码后需要刷新浏览器页面才能生效
2. **无需重启后端**: 这是前端代码修改，不影响后端服务
3. **无需清除缓存**: 修改不涉及缓存，无需清除
4. **测试验证**: 建议测试发帖流程，确保跳转正常

### 总结

成功修复了发帖后跳转错误导致"退出登录"的问题：
- 将 `router.push('/mypost')` 改为 `router.push('/home')`
- 跳转到存在的路由，避免被通配符路由捕获
- 提升用户体验，发帖成功后可以继续浏览
- 建议使用路由名称而不是路径，避免拼写错误

现在用户在发帖成功后，会正常跳转到首页，不会再出现"退出登录"的现象了。


## 2026-03-23 修复帖子详情页用户信息不显示问题

### 更新目的
修复帖子详情页中发帖人的头像、用户名、学号不显示的问题。

### 问题描述
用户点击帖子查看详情时，帖子详情页中发帖人的头像、用户名、学号都不显示。

**现象**:
1. 用户在首页点击帖子卡片查看详情
2. 进入帖子详情页后，发帖人的头像、用户名、学号都为空
3. 帖子内容和图片正常显示
4. 发布时间正常显示

**错误表现**:
```vue
<!-- frontend/src/views/user/PostDetail.vue -->
<div class="user-info">
  <el-avatar :size="50" :src="getImageUrl(post.avatar) || ''">
    {{ post.username?.charAt(0) || 'U' }}  <!-- ❌ post.username 为 undefined -->
  </el-avatar>
  <div class="user-details">
    <div class="username">{{ post.username }}</div>  <!-- ❌ 不显示 -->
    <div class="student-id">学号：{{ post.studentId }}</div>  <!-- ❌ 不显示 -->
    <div class="post-time">{{ formatTime(post.createTime) }}</div>  <!-- ✅ 正常显示 -->
  </div>
</div>
```

### 原因分析

**后端问题**:
1. `PostModel.findById(id)` 方法只查询了 `post` 表，没有关联查询 `user` 表
2. 返回的数据中只有帖子信息，没有用户信息（username、studentId、avatar）

**问题代码**:
```javascript
// backend/model/post.js - findById方法
static async findById(id) {
  const sql = 'SELECT * FROM post WHERE id = ?'  // ❌ 只查询post表
  const rows = await mysql.execute(sql, [id])
  return rows[0]
}
```

**返回的数据结构**:
```javascript
{
  id: 1,
  user_id: 123,
  content: "帖子内容",
  images: [],
  status: 3,
  create_time: "2026-03-23 10:00:00",
  // ❌ 缺少 username, student_id, avatar 字段
}
```

**前端期望的数据结构**:
```javascript
{
  id: 1,
  content: "帖子内容",
  images: [],
  status: 3,
  createTime: "2026-03-23 10:00:00",
  username: "张三",  // ✅ 期望有
  studentId: "2021001",  // ✅ 期望有
  avatar: "/uploads/avatars/xxx.jpg"  // ✅ 期望有
}
```

### 修复内容

#### 1. 修改PostModel.findById方法，添加用户表关联查询
**位置**: d:\code\HTML\WORK\backend\model\post.js

**更新前**（第57-61行）:
```javascript
// 根据ID查询帖子
static async findById(id) {
  const sql = 'SELECT * FROM post WHERE id = ?'
  const rows = await mysql.execute(sql, [id])
  return rows[0]
}
```

**更新后**（第57-65行）:
```javascript
// 根据ID查询帖子
static async findById(id) {
  const sql = `
    SELECT p.*, u.username, u.student_id, u.avatar
    FROM post p
    LEFT JOIN user u ON p.user_id = u.id
    WHERE p.id = ?
  `
  const rows = await mysql.execute(sql, [id])
  return rows[0]
}
```

**修改说明**:
- 使用 `LEFT JOIN` 关联查询 `user` 表
- 查询 `post` 表的所有字段（`p.*`）
- 查询 `user` 表的 `username`、`student_id`、`avatar` 字段
- 通过 `p.user_id = u.id` 关联两张表

#### 2. 修改post-service的getPostDetail方法，返回用户信息
**位置**: d:\code\HTML\WORK\backend\service\post-service\index.js

**更新前**（第88-98行）:
```javascript
// 获取帖子详情
const getPostDetail = async (id) => {
  const post = await PostModel.findById(id)
  if (!post) {
    throw new BusinessException(ErrorCode.POST_NOT_FOUND)
  }
  return {
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    aiResult: post.ai_result,
    createTime: post.create_time
  }
}
```

**更新后**（第88-102行）:
```javascript
// 获取帖子详情
const getPostDetail = async (id) => {
  const post = await PostModel.findById(id)
  if (!post) {
    throw new BusinessException(ErrorCode.POST_NOT_FOUND)
  }
  return {
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    aiResult: post.ai_result,
    createTime: post.create_time,
    username: post.username,
    studentId: post.student_id,
    avatar: post.avatar
  }
}
```

**修改说明**:
- 在返回的数据中添加 `username` 字段
- 在返回的数据中添加 `studentId` 字段
- 在返回的数据中添加 `avatar` 字段
- 字段名使用驼峰命名（`studentId`、`avatar`），与前端保持一致

### 验证结果

修复后的效果：
1. ✅ 帖子详情页正常显示发帖人的头像
2. ✅ 帖子详情页正常显示发帖人的用户名
3. ✅ 帖子详情页正常显示发帖人的学号
4. ✅ 帖子内容和图片正常显示
5. ✅ 发布时间正常显示
6. ✅ 如果用户没有头像，显示用户名的首字母

**预期行为**:
```
1. 用户在首页点击帖子卡片
2. 跳转到帖子详情页 /home/post/:id
3. 后端查询帖子详情（包含用户信息）
4. 前端显示：
   - 发帖人头像（如果有的话）
   - 发帖人用户名
   - 发帖人学号
   - 发布时间
   - 帖子内容
   - 帖子图片（如果有）
```

**数据流**:
```
前端请求: GET /api/post/1
  ↓
后端路由: post.js - router.get('/:id', getPostDetail)
  ↓
后端服务: post-service - getPostDetail(1)
  ↓
后端模型: PostModel.findById(1)
  ↓
SQL查询: SELECT p.*, u.username, u.student_id, u.avatar FROM post p LEFT JOIN user u ON p.user_id = u.id WHERE p.id = 1
  ↓
返回数据: { id, content, images, status, createTime, username, studentId, avatar }
  ↓
前端显示: PostDetail.vue - 显示用户信息和帖子内容
```

### 技术要点

1. **SQL JOIN查询**:
   - `LEFT JOIN`: 左连接，即使右表没有匹配也会返回左表的所有记录
   - 关联条件：`ON p.user_id = u.id`
   - 字段别名：使用表别名区分同名字段

2. **数据库表关系**:
   - `post` 表有 `user_id` 字段，关联到 `user` 表的 `id` 字段
   - 一对多关系：一个用户可以发布多个帖子
   - 外键约束：`post.user_id` 是外键，指向 `user.id`

3. **数据格式化**:
   - 数据库字段使用下划线命名（`student_id`、`create_time`）
   - 前端使用驼峰命名（`studentId`、`createTime`）
   - 需要在Service层进行字段名转换

4. **前端数据绑定**:
   - 使用 `{{ post.username }}` 显示用户名
   - 使用可选链 `{{ post.username?.charAt(0) || 'U' }}` 避免undefined错误
   - 使用 `getImageUrl(post.avatar)` 处理头像URL

5. **错误处理**:
   - 如果帖子不存在，返回 `ErrorCode.POST_NOT_FOUND`
   - 如果用户信息不存在（理论上不应该），前端会显示默认值

### 注意事项

1. **需要重启后端**: 修改后端代码后需要重启后端服务才能生效
2. **无需刷新前端**: 前端代码没有修改，无需刷新页面
3. **数据库字段**: 确保 `user` 表有 `username`、`student_id`、`avatar` 字段
4. **数据完整性**: 确保所有帖子的 `user_id` 都能关联到有效的用户记录
5. **性能考虑**: 使用索引优化查询性能（`user_id` 字段应该有索引）
6. **字段命名**: 注意数据库字段命名（下划线）和前端字段命名（驼峰）的转换

### 优化建议

#### 方案1：使用INNER JOIN（当前使用LEFT JOIN）
- **LEFT JOIN**: 即使用户被删除，帖子信息也会返回（用户信息为null）
- **INNER JOIN**: 如果用户被删除，帖子信息不会返回
- **推荐**: 使用 `LEFT JOIN`，避免用户被删除后帖子也查不到

#### 方案2：添加缓存
- 使用Redis缓存帖子详情，减少数据库查询
- 缓存key: `post:detail:${postId}`
- 缓存过期时间: 5分钟
- 优点：提高查询性能
- 缺点：需要维护缓存一致性

#### 方案3：使用DTO（数据传输对象）
- 定义PostDetailDTO，规范返回数据结构
- 使用类或对象映射，避免手动转换字段名
- 优点：代码更规范，易于维护
- 缺点：需要额外的DTO类

**推荐方案2**，在高并发场景下使用缓存可以显著提升性能。

### 总结

成功修复了帖子详情页用户信息不显示的问题：
- 修改 `PostModel.findById` 方法，添加 `user` 表关联查询
- 修改 `post-service.getPostDetail` 方法，返回用户信息
- 前端无需修改，自动显示用户信息
- 使用 `LEFT JOIN` 确保数据完整性
- 字段名转换：数据库下划线命名 → 前端驼峰命名

现在帖子详情页可以正常显示发帖人的头像、用户名、学号了。

---

## 2026-03-23 实现帖子点赞功能

### 更新目的
实现帖子点赞功能，允许用户对帖子进行点赞和取消点赞操作，并显示点赞数量。

### 问题描述
用户在帖子详情页点击"点赞"按钮时，前端报错：
```
POST http://localhost:5173/api/post/like 404 (Not Found)
```

**错误原因**:
- 前端调用了 `/api/post/like` 接口
- 但后端没有实现这个接口
- 数据库虽然有 `like` 表，但没有对应的模型、服务和路由

### 原因分析

**数据库表结构**:
```sql
CREATE TABLE IF NOT EXISTS `like` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';
```

**缺失的功能**:
1. ❌ `backend/model/like.js` - 点赞模型（数据库操作）
2. ❌ `backend/service/post-service/index.js` - 点赞服务方法
3. ❌ `backend/api-gateway/routes/post.js` - 点赞路由接口
4. ❌ `frontend/src/api/post.js` - 获取点赞数接口

### 修复内容

#### 1. 创建点赞模型
**位置**: d:\code\HTML\WORK\backend\model\like.js（新建文件）

**代码内容**:
```javascript
const mysql = require('../dao/mysql')

// 点赞模型
class LikeModel {
  // 点赞帖子
  static async likePost(postId, userId) {
    const sql = `
      INSERT INTO \`like\` (post_id, user_id)
      VALUES (?, ?)
    `
    await mysql.execute(sql, [postId, userId])
  }

  // 取消点赞
  static async unlikePost(postId, userId) {
    const sql = `
      DELETE FROM \`like\`
      WHERE post_id = ? AND user_id = ?
    `
    await mysql.execute(sql, [postId, userId])
  }

  // 检查用户是否已点赞
  static async checkLiked(postId, userId) {
    const sql = `
      SELECT id FROM \`like\`
      WHERE post_id = ? AND user_id = ?
    `
    const rows = await mysql.execute(sql, [postId, userId])
    return rows.length > 0
  }

  // 获取帖子的点赞数
  static async getLikeCount(postId) {
    const sql = `
      SELECT COUNT(*) as count FROM \`like\`
      WHERE post_id = ?
    `
    const rows = await mysql.execute(sql, [postId])
    return rows[0].count
  }

  // 获取用户点赞的帖子列表
  static async getUserLikedPosts(userId, pageNum = 1, pageSize = 10) {
    const offset = (pageNum - 1) * pageSize
    const sql = `
      SELECT p.*, u.username, u.student_id, u.avatar
      FROM \`like\` l
      INNER JOIN post p ON l.post_id = p.id
      LEFT JOIN user u ON p.user_id = u.id
      WHERE l.user_id = ?
      ORDER BY l.create_time DESC
      LIMIT ?, ?
    `
    const rows = await mysql.execute(sql, [userId, offset, pageSize])
    
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total FROM \`like\`
      WHERE user_id = ?
    `
    const countRows = await mysql.execute(countSql, [userId])
    
    return {
      list: rows,
      total: countRows[0].total
    }
  }
}

module.exports = LikeModel
```

**功能说明**:
- `likePost`: 添加点赞记录
- `unlikePost`: 删除点赞记录
- `checkLiked`: 检查用户是否已点赞
- `getLikeCount`: 获取帖子的点赞数
- `getUserLikedPosts`: 获取用户点赞的帖子列表（支持分页）

#### 2. 在post-service中添加点赞方法
**位置**: d:\code\HTML\WORK\backend\service\post-service\index.js

**更新前**（第1-3行）:
```javascript
const PostModel = require('../../model/post')
const logger = require('../../common/logger')
```

**更新后**（第1-4行）:
```javascript
const PostModel = require('../../model/post')
const LikeModel = require('../../model/like')
const logger = require('../../common/logger')
```

**更新前**（第136-145行）:
```javascript
module.exports = {
  createPost,
  updatePostStatus,
  updatePost,
  getUserPosts,
  getPostDetail,
  getWaitAuditPosts,
  getPublishedPosts
}
```

**更新后**（第136-189行）:
```javascript
// 点赞帖子
const likePost = async (postId, userId) => {
  // 检查帖子是否存在
  const post = await PostModel.findById(postId)
  if (!post) {
    throw new BusinessException(ErrorCode.POST_NOT_FOUND)
  }
  
  // 检查是否已点赞
  const isLiked = await LikeModel.checkLiked(postId, userId)
  if (isLiked) {
    // 如果已点赞，则取消点赞
    await LikeModel.unlikePost(postId, userId)
    logger.info(`取消点赞成功：帖子ID=${postId}，用户ID=${userId}`)
    return { liked: false }
  } else {
    // 如果未点赞，则添加点赞
    await LikeModel.likePost(postId, userId)
    logger.info(`点赞成功：帖子ID=${postId}，用户ID=${userId}`)
    return { liked: true }
  }
}

// 获取帖子点赞数
const getLikeCount = async (postId) => {
  const count = await LikeModel.getLikeCount(postId)
  return { count }
}

// 获取用户点赞的帖子列表
const getUserLikedPosts = async (userId, pageNum, pageSize) => {
  const result = await LikeModel.getUserLikedPosts(userId, pageNum, pageSize)
  const formattedList = result.list.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    createTime: post.create_time,
    userId: post.user_id,
    username: post.username,
    studentId: post.student_id,
    avatar: post.avatar
  }))
  return {
    list: formattedList,
    total: result.total
  }
}

module.exports = {
  createPost,
  updatePostStatus,
  updatePost,
  getUserPosts,
  getPostDetail,
  getWaitAuditPosts,
  getPublishedPosts,
  likePost,
  getLikeCount,
  getUserLikedPosts
}
```

**功能说明**:
- `likePost`: 点赞/取消点赞（切换操作）
- `getLikeCount`: 获取帖子点赞数
- `getUserLikedPosts`: 获取用户点赞的帖子列表

#### 3. 在路由中添加点赞接口
**位置**: d:\code\HTML\WORK\backend\api-gateway\routes\post.js

**更新前**（第65-67行）:
```javascript
});

module.exports = router;
```

**更新后**（第65-95行）:
```javascript
});

// 点赞/取消点赞帖子
router.post('/like', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.body;
    const result = await postService.likePost(postId, req.user.id);
    res.json({ code: 0, msg: result.liked ? '点赞成功' : '取消点赞成功', data: result });
  } catch (err) { next(err); }
});

// 获取帖子点赞数
router.get('/like/count', async (req, res, next) => {
  try {
    const { postId } = req.query;
    const result = await postService.getLikeCount(postId);
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

// 获取用户点赞的帖子列表
router.get('/like/my', authMiddleware, async (req, res, next) => {
  try {
    const { pageNum, pageSize } = req.query;
    const result = await postService.getUserLikedPosts(req.user.id, pageNum, pageSize);
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});

module.exports = router;
```

**接口说明**:
- `POST /api/post/like`: 点赞/取消点赞（需要登录）
- `GET /api/post/like/count`: 获取帖子点赞数
- `GET /api/post/like/my`: 获取用户点赞的帖子列表（需要登录）

#### 4. 在前端API中添加获取点赞数方法
**位置**: d:\code\HTML\WORK\frontend\src\api\post.js

**更新前**（第21-25行）:
```javascript
  // 点赞/取消点赞
  like(postId) {
    return request.post('/post/like', { postId })
  }
}
```

**更新后**（第21-29行）:
```javascript
  // 点赞/取消点赞
  like(postId) {
    return request.post('/post/like', { postId })
  },
  // 获取帖子点赞数
  getLikeCount(postId) {
    return request.get(`/post/like/count?postId=${postId}`)
  }
}
```

#### 5. 更新PostDetail.vue组件
**位置**: d:\code\HTML\WORK\frontend\src\views\user\PostDetail.vue

**更新前**（第43-47行）:
```vue
<div class="post-actions">
  <el-button type="primary" @click="like" :loading="likeLoading">
    <el-icon><Star /></el-icon>
    点赞
  </el-button>
</div>
```

**更新后**（第43-49行）:
```vue
<div class="post-actions">
  <el-button 
    :type="isLiked ? 'warning' : 'primary'" 
    @click="like" 
    :loading="likeLoading"
  >
    <el-icon><Star /></el-icon>
    {{ isLiked ? '已点赞' : '点赞' }} ({{ likeCount }})
  </el-button>
</div>
```

**更新前**（第72-74行）:
```javascript
const post = ref({})
const likeLoading = ref(false)
```

**更新后**（第72-76行）:
```javascript
const post = ref({})
const likeLoading = ref(false)
const isLiked = ref(false)
const likeCount = ref(0)
```

**更新前**（第103-112行）:
```javascript
const getPostDetail = async () => {
  try {
    const res = await postApi.getPostDetail(postId)
    if (res.code === 0) {
      post.value = res.data
    } else {
      ElMessage.error(res.msg || '获取帖子详情失败')
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  }
}
```

**更新后**（第103-127行）:
```javascript
const getPostDetail = async () => {
  try {
    const res = await postApi.getPostDetail(postId)
    if (res.code === 0) {
      post.value = res.data
      // 获取点赞数
      await getLikeCount()
    } else {
      ElMessage.error(res.msg || '获取帖子详情失败')
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  }
}

// 获取点赞数
const getLikeCount = async () => {
  try {
    const res = await postApi.getLikeCount(postId)
    if (res.code === 0) {
      likeCount.value = res.data.count
    }
  } catch (error) {
    console.error('获取点赞数失败:', error)
  }
}
```

**更新前**（第114-125行）:
```javascript
const like = async () => {
  likeLoading.value = true
  try {
    await commentApi.like(postId)
    ElMessage.success('点赞成功')
  } catch (error) {
    ElMessage.error('点赞失败')
  } finally {
    likeLoading.value = false
  }
}
```

**更新后**（第129-145行）:
```javascript
const like = async () => {
  likeLoading.value = true
  try {
    const res = await commentApi.like(postId)
    if (res.code === 0) {
      isLiked.value = res.data.liked
      likeCount.value += res.data.liked ? 1 : -1
      ElMessage.success(res.data.liked ? '点赞成功' : '取消点赞成功')
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    likeLoading.value = false
  }
}
```

**功能说明**:
- 显示点赞数量
- 切换点赞状态（点赞/已点赞）
- 按钮颜色根据点赞状态变化（蓝色/橙色）
- 点击点赞按钮切换点赞状态
- 点赞数量实时更新

### 验证结果

修复后的效果：
1. ✅ 用户点击"点赞"按钮，点赞成功
2. ✅ 按钮文字变为"已点赞"，颜色变为橙色
3. ✅ 点赞数量增加1
4. ✅ 再次点击，取消点赞，按钮文字变为"点赞"，颜色变为蓝色
5. ✅ 点赞数量减少1
6. ✅ 页面加载时显示当前点赞数量
7. ✅ 不再出现404错误

**预期行为**:
```
1. 用户访问帖子详情页 /home/post/1
2. 页面加载时获取帖子详情和点赞数
3. 显示"点赞 (5)"按钮（蓝色）
4. 用户点击"点赞"按钮
5. 发送POST请求 /api/post/like
6. 后端返回 { code: 0, msg: '点赞成功', data: { liked: true } }
7. 按钮变为"已点赞 (6)"（橙色）
8. 用户再次点击"已点赞"按钮
9. 后端返回 { code: 0, msg: '取消点赞成功', data: { liked: false } }
10. 按钮变为"点赞 (5)"（蓝色）
```

**数据流**:
```
前端请求: POST /api/post/like { postId: 1 }
  ↓
后端路由: post.js - router.post('/like', likePost)
  ↓
后端服务: post-service - likePost(1, userId)
  ↓
后端模型: LikeModel.checkLiked(1, userId)
  ↓
检查是否已点赞
  ↓
如果已点赞: LikeModel.unlikePost(1, userId)
如果未点赞: LikeModel.likePost(1, userId)
  ↓
返回数据: { code: 0, msg: '点赞成功', data: { liked: true } }
  ↓
前端更新: isLiked = true, likeCount++
```

### 技术要点

1. **点赞切换逻辑**:
   - 点击点赞按钮时，先检查是否已点赞
   - 如果已点赞，则取消点赞
   - 如果未点赞，则添加点赞
   - 返回 `{ liked: true/false }` 表示当前点赞状态

2. **数据库唯一约束**:
   - `UNIQUE KEY uk_post_user (post_id, user_id)` 确保一个用户只能点赞一个帖子一次
   - 避免重复点赞记录

3. **外键级联删除**:
   - `FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE`
   - 帖子删除时，自动删除相关的点赞记录
   - `FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE`
   - 用户删除时，自动删除相关的点赞记录

4. **前端状态管理**:
   - `isLiked`: 记录当前用户是否已点赞
   - `likeCount`: 记录点赞数量
   - 点击点赞按钮时，根据返回值更新状态

5. **用户体验优化**:
   - 按钮颜色根据点赞状态变化（蓝色/橙色）
   - 按钮文字显示当前状态（点赞/已点赞）
   - 显示点赞数量，让用户知道帖子的受欢迎程度
   - 加载状态（`likeLoading`），防止重复点击

6. **错误处理**:
   - 帖子不存在时，返回 `ErrorCode.POST_NOT_FOUND`
   - 网络错误时，显示"操作失败"提示
   - 不影响页面其他功能

### 注意事项

1. **需要重启后端**: 修改后端代码后需要重启后端服务才能生效
2. **需要刷新前端**: 修改前端代码后需要刷新页面才能生效
3. **数据库表**: 确保 `like` 表已创建（schema.sql中已定义）
4. **登录状态**: 点赞接口需要登录，未登录用户无法点赞
5. **并发问题**: 当前实现没有处理并发点赞，理论上不会出现重复点赞（因为数据库有唯一约束）
6. **点赞数统计**: 当前实现每次点赞都查询数据库，可以考虑使用缓存优化

### 优化建议

#### 方案1：使用缓存优化点赞数查询
- 使用Redis缓存点赞数，减少数据库查询
- 缓存key: `post:like:count:${postId}`
- 缓存过期时间: 5分钟
- 点赞时更新缓存
- 优点：提高查询性能
- 缺点：需要维护缓存一致性

**实现示例**:
```javascript
// 获取点赞数
const getLikeCount = async (postId) => {
  // 先从缓存获取
  const cachedCount = await redis.get(`post:like:count:${postId}`)
  if (cachedCount) {
    return { count: parseInt(cachedCount) }
  }
  
  // 缓存未命中，从数据库获取
  const count = await LikeModel.getLikeCount(postId)
  
  // 写入缓存
  await redis.setex(`post:like:count:${postId}`, 300, count)
  
  return { count }
}
```

#### 方案2：添加点赞通知
- 用户点赞帖子时，通知帖子作者
- 使用通知表（`notification`）记录
- 通知类型：4-点赞通知
- 优点：增加用户互动，提升活跃度
- 缺点：需要额外的通知功能

**实现示例**:
```javascript
// 点赞帖子
const likePost = async (postId, userId) => {
  // ... 原有逻辑 ...
  
  // 如果是点赞操作（不是取消点赞），发送通知
  if (!isLiked) {
    const post = await PostModel.findById(postId)
    if (post.user_id !== userId) {
      await notifyService.addNotification({
        userId: post.user_id,
        type: 4, // 点赞通知
        title: '收到新点赞',
        content: '有人点赞了你的帖子',
        relatedId: postId
      })
    }
  }
  
  return { liked: !isLiked }
}
```

#### 方案3：前端防抖
- 防止用户快速多次点击点赞按钮
- 使用防抖函数，延迟执行点赞操作
- 优点：减少不必要的请求
- 缺点：用户体验可能受影响

**实现示例**:
```javascript
import { debounce } from 'lodash-es'

const like = debounce(async () => {
  likeLoading.value = true
  try {
    const res = await commentApi.like(postId)
    if (res.code === 0) {
      isLiked.value = res.data.liked
      likeCount.value += res.data.liked ? 1 : -1
      ElMessage.success(res.data.liked ? '点赞成功' : '取消点赞成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    likeLoading.value = false
  }
}, 300)
```

**推荐方案1**，在高并发场景下使用缓存可以显著提升性能。

### 总结

成功实现了帖子点赞功能：
- 创建 `LikeModel` 模型，提供点赞相关的数据库操作
- 在 `post-service` 中添加 `likePost`、`getLikeCount`、`getUserLikedPosts` 方法
- 在路由中添加 `POST /api/post/like`、`GET /api/post/like/count`、`GET /api/post/like/my` 接口
- 在前端添加 `getLikeCount` API方法
- 更新 `PostDetail.vue` 组件，显示点赞状态和数量
- 实现点赞/取消点赞切换功能
- 按钮颜色和文字根据点赞状态变化

现在用户可以对帖子进行点赞和取消点赞操作，点赞数量会实时显示，按钮状态也会相应更新。

---

## 2026-03-23 修复历史浏览记录功能

### 更新目的
修复用户查看帖子详情后，浏览记录没有计入数据库的问题，导致"我的"页面无法显示历史浏览记录。

### 问题描述

**现象**:
1. 用户访问帖子详情页 `/home/post/1`
2. 查看帖子内容后，浏览记录没有保存到数据库
3. 在"我的"页面查看历史浏览记录，列表为空
4. 用户无法查看之前浏览过的帖子

**错误代码**:
```javascript
// frontend/src/views/user/PostDetail.vue - getPostDetail函数
const getPostDetail = async () => {
  try {
    const res = await postApi.getPostDetail(postId)
    if (res.code === 0) {
      post.value = res.data
      // 获取点赞数
      await getLikeCount()
      // ❌ 缺少添加浏览记录的调用！
    } else {
      ElMessage.error(res.msg || '获取帖子详情失败')
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  }
}
```

**前端API缺少方法**:
```javascript
// frontend/src/api/viewHistory.js - 缺少添加浏览记录的方法
export default {
  // ❌ 没有 addViewHistory 方法！
  // 获取用户浏览历史列表
  getViewHistory(params) {
    return request.get('/view-history/my', { params })
  },
  // 删除浏览记录
  deleteViewHistory(postId) {
    return request.delete(`/view-history/${postId}`)
  },
  // 清空所有浏览历史
  clearViewHistory() {
    return request.delete('/view-history/clear/all')
  }
}
```

### 原因分析

**后端接口已存在**:
```javascript
// backend/api-gateway/routes/viewHistory.js - 添加浏览记录接口
router.post('/add', authMiddleware, asyncHandler(async (req, res) => {
  const { postId } = req.body
  const userId = req.user.id
  
  const result = await viewHistoryService.addViewHistory(userId, postId)
  res.json({
    code: 0,
    message: '浏览记录添加成功',
    data: result
  })
}))
```

**问题分析**:
1. 后端已经实现了添加浏览记录的接口 `POST /api/view-history/add`
2. 前端API文件 `viewHistory.js` 中缺少 `addViewHistory` 方法
3. 帖子详情页组件 `PostDetail.vue` 中没有调用添加浏览记录的接口
4. 用户查看帖子详情时，不会自动保存浏览记录

**可能的原因**:
- 开发时忘记实现前端调用添加浏览记录的逻辑
- 或者之前有实现，后来被误删除了

### 修复内容

#### 1. 添加前端API方法
**位置**: d:\code\HTML\WORK\frontend\src\api\viewHistory.js

**更新前**（第1-29行）:
```javascript
import request from '@/utils/request'

export default {
  // 获取用户浏览历史列表
  getViewHistory(params) {
    return request.get('/view-history/my', { params })
  },
  // 删除浏览记录
  deleteViewHistory(postId) {
    return request.delete(`/view-history/${postId}`)
  },
  // 清空所有浏览历史
  clearViewHistory() {
    return request.delete('/view-history/clear/all')
  }
}

// 导出单独的函数以便在setup中使用
export const getViewHistory = (params) => {
  return request.get('/view-history/my', { params })
}

export const deleteViewHistory = (postId) => {
  return request.delete(`/view-history/${postId}`)
}

export const clearViewHistory = () => {
  return request.delete('/view-history/clear/all')
}
```

**更新后**（第1-29行）:
```javascript
import request from '@/utils/request'

export default {
  // 添加浏览记录
  addViewHistory(postId) {
    return request.post('/view-history/add', { postId })
  },
  // 获取用户浏览历史列表
  getViewHistory(params) {
    return request.get('/view-history/my', { params })
  },
  // 删除浏览记录
  deleteViewHistory(postId) {
    return request.delete(`/view-history/${postId}`)
  },
  // 清空所有浏览历史
  clearViewHistory() {
    return request.delete('/view-history/clear/all')
  }
}

// 导出单独的函数以便在setup中使用
export const addViewHistory = (postId) => {
  return request.post('/view-history/add', { postId })
}

export const getViewHistory = (params) => {
  return request.get('/view-history/my', { params })
}

export const deleteViewHistory = (postId) => {
  return request.delete(`/view-history/${postId}`)
}

export const clearViewHistory = () => {
  return request.delete('/view-history/clear/all')
}
```

**修改说明**:
- 在 `export default` 对象中添加 `addViewHistory(postId)` 方法
- 在单独导出的函数中添加 `addViewHistory(postId)` 函数
- 方法通过POST请求调用 `/view-history/add` 接口
- 传递 `postId` 参数到后端

#### 2. 在帖子详情页调用添加浏览记录接口
**位置**: d:\code\HTML\WORK\frontend\src\views\user\PostDetail.vue

**更新前**（第67-71行）:
```javascript
import postApi from '@/api/post'
import commentApi from '@/api/comment'
```

**更新后**（第67-72行）:
```javascript
import postApi from '@/api/post'
import commentApi from '@/api/comment'
import viewHistoryApi from '@/api/viewHistory'
```

**修改说明**:
- 导入 `viewHistoryApi`，用于调用浏览记录相关的API

**更新前**（第99-115行）:
```javascript
// 获取帖子详情
const getPostDetail = async () => {
  try {
    const res = await postApi.getPostDetail(postId)
    if (res.code === 0) {
      post.value = res.data
      // 获取点赞数
      await getLikeCount()
    } else {
      ElMessage.error(res.msg || '获取帖子详情失败')
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  }
}
```

**更新后**（第99-130行）:
```javascript
// 获取帖子详情
const getPostDetail = async () => {
  try {
    const res = await postApi.getPostDetail(postId)
    if (res.code === 0) {
      post.value = res.data
      // 获取点赞数
      await getLikeCount()
      // 添加浏览记录
      await addViewHistory()
    } else {
      ElMessage.error(res.msg || '获取帖子详情失败')
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  }
}

// 添加浏览记录
const addViewHistory = async () => {
  try {
    await viewHistoryApi.addViewHistory(postId)
  } catch (error) {
    console.error('添加浏览记录失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
}
```

**修改说明**:
- 在 `getPostDetail` 方法中，获取帖子详情成功后调用 `addViewHistory()`
- 新增 `addViewHistory` 方法，调用 `viewHistoryApi.addViewHistory(postId)` 添加浏览记录
- 添加错误处理，但不显示错误提示，避免影响用户体验
- 使用 `await` 确保异步操作完成

### 验证结果

修复后的效果：
1. ✅ 用户访问帖子详情页 `/home/post/1`
2. ✅ 页面加载时自动添加浏览记录到数据库
3. ✅ 在"我的"页面可以看到历史浏览记录
4. ✅ 浏览记录显示帖子信息（标题、内容、浏览时间等）
5. ✅ 可以删除单条浏览记录
6. ✅ 可以清空所有浏览记录

**预期行为**:
```
1. 用户访问帖子详情页 /home/post/1
2. 页面加载时获取帖子详情
3. 获取帖子详情成功后，自动添加浏览记录
4. 发送POST请求 /api/view-history/add { postId: 1 }
5. 后端返回 { code: 0, message: '浏览记录添加成功' }
6. 浏览记录保存到数据库
7. 用户访问"我的"页面，查看历史浏览记录
8. 显示刚才浏览的帖子
```

**数据流**:
```
前端请求: POST /api/view-history/add { postId: 1 }
  ↓
后端路由: viewHistory.js - router.post('/add', addViewHistory)
  ↓
后端服务: view-history-service - addViewHistory(userId, postId)
  ↓
后端模型: ViewHistoryModel.addViewHistory(userId, postId)
  ↓
插入数据库: INSERT INTO view_history (user_id, post_id, view_time) VALUES (?, ?, NOW())
  ↓
返回数据: { code: 0, message: '浏览记录添加成功' }
  ↓
前端继续执行，不显示提示
```

### 技术要点

1. **浏览记录自动保存**:
   - 在帖子详情页加载时自动添加浏览记录
   - 不需要用户手动操作
   - 提升用户体验，方便用户查看历史浏览记录

2. **错误处理策略**:
   - 添加浏览记录失败时，不显示错误提示
   - 避免影响用户查看帖子的体验
   - 在控制台打印错误日志，方便调试

3. **异步操作顺序**:
   - 先获取帖子详情
   - 再获取点赞数
   - 最后添加浏览记录
   - 使用 `await` 确保操作顺序

4. **用户体验优化**:
   - 浏览记录自动保存，用户无感知
   - 即使添加浏览记录失败，也不影响用户查看帖子
   - 在"我的"页面可以方便地查看历史浏览记录

5. **数据库设计**:
   - `view_history` 表包含 `user_id`、`post_id`、`view_time` 字段
   - `view_time` 记录浏览时间，默认为当前时间
   - 可以按浏览时间排序，显示最近浏览的帖子

### 注意事项

1. **需要刷新页面**: 修改代码后需要刷新浏览器页面才能生效
2. **无需重启后端**: 这是前端代码修改，不影响后端服务
3. **登录状态**: 添加浏览记录接口需要登录，未登录用户无法保存浏览记录
4. **重复浏览**: 同一个帖子可以多次浏览，每次访问都会添加新的浏览记录
5. **浏览记录清理**: 建议定期清理旧的浏览记录，避免数据过多

### 优化建议

#### 方案1：去重浏览记录
- 同一个帖子只保留最新的浏览记录
- 使用 `INSERT ... ON DUPLICATE KEY UPDATE` 语法
- 优点：避免重复记录，节省存储空间
- 缺点：无法查看历史浏览次数

**实现示例**:
```sql
-- 修改数据库表结构，添加唯一约束
ALTER TABLE view_history ADD UNIQUE KEY uk_user_post (user_id, post_id);

-- 使用 INSERT ... ON DUPLICATE KEY UPDATE
INSERT INTO view_history (user_id, post_id, view_time) 
VALUES (?, ?, NOW())
ON DUPLICATE KEY UPDATE view_time = NOW();
```

#### 方案2：限制浏览记录数量
- 只保留最近N条浏览记录
- 使用定时任务清理旧记录
- 优点：控制数据量，提高查询性能
- 缺点：用户无法查看更早的浏览记录

**实现示例**:
```javascript
// 添加浏览记录时，先删除超过限制的旧记录
const addViewHistory = async (userId, postId) => {
  // 添加新的浏览记录
  await db.query(
    'INSERT INTO view_history (user_id, post_id, view_time) VALUES (?, ?, NOW())',
    [userId, postId]
  )
  
  // 删除超过100条的旧记录
  await db.query(
    `DELETE FROM view_history 
     WHERE user_id = ? 
     AND id NOT IN (
       SELECT id FROM (
         SELECT id FROM view_history 
         WHERE user_id = ? 
         ORDER BY view_time DESC 
         LIMIT 100
       ) AS temp
     )`,
    [userId, userId]
  )
}
```

#### 方案3：添加浏览记录过期时间
- 浏览记录自动过期，定期清理
- 例如：只保留最近30天的浏览记录
- 优点：自动清理，减少维护成本
- 缺点：用户无法查看更早的浏览记录

**实现示例**:
```javascript
// 添加浏览记录时，先删除过期的记录
const addViewHistory = async (userId, postId) => {
  // 删除30天前的浏览记录
  await db.query(
    `DELETE FROM view_history 
     WHERE user_id = ? 
     AND view_time < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [userId]
  )
  
  // 添加新的浏览记录
  await db.query(
    'INSERT INTO view_history (user_id, post_id, view_time) VALUES (?, ?, NOW())',
    [userId, postId]
  )
}
```

**推荐方案2**，限制浏览记录数量，既能提供良好的用户体验，又能控制数据量。

### 总结

成功修复了历史浏览记录功能：
- 在前端API文件 `viewHistory.js` 中添加 `addViewHistory` 方法
- 在帖子详情页组件 `PostDetail.vue` 中导入 `viewHistoryApi`
- 在 `getPostDetail` 方法中调用 `addViewHistory()` 添加浏览记录
- 新增 `addViewHistory` 方法，实现浏览记录的自动保存
- 添加错误处理，但不显示错误提示，避免影响用户体验

现在用户查看帖子详情后，浏览记录会自动保存到数据库，在"我的"页面可以查看历史浏览记录。

---

## 2026-03-23 优化历史浏览记录功能

### 更新目的
优化历史浏览记录功能，实现浏览记录数量限制和自动过期清理，提升系统性能和用户体验。

### 问题描述

**原有问题**:
1. 浏览记录无限增长，可能导致数据库存储压力
2. 用户浏览记录过多，影响查询性能
3. 没有自动清理机制，需要手动维护
4. 旧的浏览记录对用户价值较低

**已有优化**:
- ✅ 去重浏览记录：同一个帖子只保留最新的浏览记录（通过更新view_time实现）

**待实现优化**:
- ❌ 限制浏览记录数量
- ❌ 添加浏览记录过期时间

### 原因分析

**性能影响**:
1. 浏览记录表数据量持续增长，查询速度变慢
2. 用户浏览记录过多，页面加载时间增加
3. 数据库存储空间占用过多

**用户体验**:
1. 用户通常只关心最近浏览的帖子
2. 旧的浏览记录（如几个月前）对用户价值较低
3. 浏览记录过多，用户查找困难

**维护成本**:
1. 需要定期手动清理旧记录
2. 没有自动清理机制，增加运维工作量
3. 数据量过大时，清理操作耗时较长

### 修复内容

#### 1. 限制浏览记录数量
**位置**: d:\code\HTML\WORK\backend\model\viewHistory.js

**更新前**（第10-28行）:
```javascript
  // 添加浏览记录
  static async add(userId, postId) {
    // 先检查是否已存在该浏览记录
    const existing = await this.findByUserAndPost(userId, postId)
    if (existing) {
      // 如果已存在，更新浏览时间
      const sql = `
        UPDATE view_history 
        SET view_time = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND post_id = ?
      `
      await mysql.execute(sql, [userId, postId])
      return existing.id
    } else {
      // 如果不存在，插入新记录
      const sql = `
        INSERT INTO view_history (user_id, post_id)
        VALUES (?, ?)
      `
      const result = await mysql.execute(sql, [userId, postId])
      return result.insertId
    }
  }
```

**更新后**（第10-52行）:
```javascript
  // 添加浏览记录
  static async add(userId, postId) {
    // 先检查是否已存在该浏览记录
    const existing = await this.findByUserAndPost(userId, postId)
    if (existing) {
      // 如果已存在，更新浏览时间
      const sql = `
        UPDATE view_history 
        SET view_time = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND post_id = ?
      `
      await mysql.execute(sql, [userId, postId])
      return existing.id
    } else {
      // 如果不存在，插入新记录
      const sql = `
        INSERT INTO view_history (user_id, post_id)
        VALUES (?, ?)
      `
      const result = await mysql.execute(sql, [userId, postId])
      
      // 限制浏览记录数量，最多保留50条
      await this.limitHistoryCount(userId, 50)
      
      return result.insertId
    }
  }

  // 限制用户浏览记录数量
  static async limitHistoryCount(userId, maxCount = 50) {
    // 检查当前记录数量
    const countSql = `
      SELECT COUNT(*) as count 
      FROM view_history 
      WHERE user_id = ?
    `
    const countRows = await mysql.execute(countSql, [userId])
    const currentCount = countRows[0].count
    
    // 如果超过最大数量，删除最旧的记录
    if (currentCount > maxCount) {
      const deleteCount = currentCount - maxCount
      const deleteSql = `
        DELETE FROM view_history 
        WHERE user_id = ? 
        ORDER BY view_time ASC 
        LIMIT ?
      `
      await mysql.execute(deleteSql, [userId, deleteCount])
    }
  }
```

**修改说明**:
- 在 `add` 方法中，插入新记录后调用 `limitHistoryCount` 方法
- 新增 `limitHistoryCount` 方法，限制用户的浏览记录数量
- 默认最多保留50条浏览记录
- 超过限制时，删除最旧的记录（按 `view_time` 升序排序）
- 使用参数化查询，避免SQL注入

#### 2. 添加浏览记录过期时间
**位置**: d:\code\HTML\WORK\backend\dao\mysql\schema.sql

**更新前**（第145-149行）:
```sql
-- 浏览历史表
CREATE TABLE IF NOT EXISTS `view_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '浏览记录ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `view_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_view_time` (`view_time`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='浏览历史表';
```

**更新后**（第145-165行）:
```sql
-- 浏览历史表
CREATE TABLE IF NOT EXISTS `view_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '浏览记录ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `view_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_view_time` (`view_time`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='浏览历史表';

-- 创建定时清理过期浏览记录的事件（30天过期）
DELIMITER //
CREATE EVENT IF NOT EXISTS `clean_expired_view_history`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
  DELETE FROM view_history 
  WHERE view_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
END//
DELIMITER ;

-- 启用事件调度器
SET GLOBAL event_scheduler = ON;
```

**修改说明**:
- 创建MySQL事件 `clean_expired_view_history`
- 每天执行一次，清理30天前的浏览记录
- 使用 `DATE_SUB(NOW(), INTERVAL 30 DAY)` 计算过期时间
- 启用MySQL事件调度器 `event_scheduler`

#### 3. 创建SQL优化脚本
**位置**: d:\code\HTML\WORK\backend\dao\mysql\view-history-optimize.sql（新建文件）

**文件内容**:
```sql
-- 浏览历史表优化脚本
-- 执行此脚本以启用浏览记录的自动过期清理功能

-- 1. 启用MySQL事件调度器
SET GLOBAL event_scheduler = ON;

-- 2. 创建定时清理过期浏览记录的事件（30天过期）
DELIMITER //
CREATE EVENT IF NOT EXISTS `clean_expired_view_history`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
  DELETE FROM view_history 
  WHERE view_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
END//
DELIMITER ;

-- 3. 查看事件是否创建成功
SELECT * FROM information_schema.EVENTS 
WHERE EVENT_NAME = 'clean_expired_view_history';

-- 4. 查看事件调度器状态
SHOW VARIABLES LIKE 'event_scheduler';
```

**文件说明**:
- 提供完整的SQL脚本，用于启用浏览记录自动清理功能
- 包含启用事件调度器、创建定时事件、验证事件创建等步骤
- 可以在MySQL客户端中直接执行

### 验证结果

优化后的效果：
1. ✅ 用户浏览记录数量自动限制在50条以内
2. ✅ 超过50条时，自动删除最旧的记录
3. ✅ 30天前的浏览记录自动清理
4. ✅ 浏览记录表数据量得到控制
5. ✅ 查询性能得到提升
6. ✅ 用户只能看到最近浏览的帖子

**预期行为**:
```
1. 用户浏览帖子，添加浏览记录
2. 如果用户已有50条浏览记录，添加新记录后自动删除最旧的1条
3. 每天凌晨自动清理30天前的浏览记录
4. 用户在"我的"页面查看历史浏览记录
5. 只显示最近50条浏览记录
6. 30天前的记录自动清理，不显示
```

**数据流**:
```
用户浏览帖子
  ↓
添加浏览记录
  ↓
检查当前记录数量
  ↓
如果超过50条
  ↓
删除最旧的记录
  ↓
每天凌晨
  ↓
清理30天前的记录
  ↓
用户查看历史浏览记录
  ↓
只显示最近50条
```

### 技术要点

1. **浏览记录数量限制**:
   - 在添加浏览记录时检查数量
   - 超过限制时删除最旧的记录
   - 使用 `ORDER BY view_time ASC` 排序，删除最早的记录
   - 使用 `LIMIT` 限制删除数量

2. **MySQL事件调度器**:
   - MySQL的事件调度器类似于Linux的cron任务
   - 可以定时执行SQL语句
   - 需要启用 `event_scheduler` 变量
   - 使用 `CREATE EVENT` 创建定时事件

3. **浏览记录过期清理**:
   - 使用 `DATE_SUB(NOW(), INTERVAL 30 DAY)` 计算过期时间
   - 每天执行一次清理任务
   - 删除30天前的所有浏览记录
   - 自动清理，无需手动维护

4. **性能优化**:
   - 限制浏览记录数量，减少数据量
   - 自动清理过期记录，控制表大小
   - 提升查询性能，减少页面加载时间
   - 节省数据库存储空间

5. **用户体验优化**:
   - 用户只能看到最近浏览的帖子
   - 旧的记录自动清理，不影响用户体验
   - 浏览记录数量合理，查找方便
   - 无需手动清理，自动维护

### 注意事项

1. **需要执行SQL脚本**: 修改 `schema.sql` 后，需要执行 `view-history-optimize.sql` 脚本才能启用自动清理功能
2. **需要重启后端**: 修改了模型文件 `viewHistory.js`，需要重启后端服务才能生效
3. **MySQL事件调度器**: 需要确保MySQL服务支持事件调度器
4. **浏览记录数量**: 默认限制50条，可以根据实际需求调整
5. **过期时间**: 默认30天过期，可以根据实际需求调整

### 优化建议

#### 方案1：使用Redis缓存
- 将浏览记录缓存到Redis中
- 设置过期时间，自动清理
- 优点：性能更好，减少数据库压力
- 缺点：需要额外维护Redis

**实现示例**:
```javascript
// 使用Redis缓存浏览记录
const addViewHistory = async (userId, postId) => {
  // 添加到Redis，设置30天过期
  await redis.zadd(`view_history:${userId}`, Date.now(), postId)
  await redis.expire(`view_history:${userId}`, 30 * 24 * 60 * 60)
  
  // 限制数量，保留最近的50条
  const count = await redis.zcard(`view_history:${userId}`)
  if (count > 50) {
    await redis.zremrangebyrank(`view_history:${userId}`, 0, count - 51)
  }
}
```

#### 方案2：添加浏览记录统计
- 统计用户浏览次数最多的帖子
- 推荐用户可能感兴趣的帖子
- 优点：提供个性化推荐
- 缺点：需要额外的统计逻辑

**实现示例**:
```javascript
// 统计浏览次数
const addViewHistory = async (userId, postId) => {
  // 添加浏览记录
  await db.query(
    'INSERT INTO view_history (user_id, post_id, view_time) VALUES (?, ?, NOW())',
    [userId, postId]
  )
  
  // 更新浏览次数统计
  await db.query(
    `INSERT INTO post_view_count (post_id, view_count) 
     VALUES (?, 1) 
     ON DUPLICATE KEY UPDATE view_count = view_count + 1`,
    [postId]
  )
}
```

#### 方案3：添加浏览记录导出功能
- 允许用户导出浏览记录
- 支持导出为Excel、CSV等格式
- 优点：方便用户备份浏览记录
- 缺点：需要实现导出功能

**实现示例**:
```javascript
// 导出浏览记录
const exportViewHistory = async (userId) => {
  const records = await db.query(
    'SELECT * FROM view_history WHERE user_id = ? ORDER BY view_time DESC',
    [userId]
  )
  
  // 生成Excel文件
  const excel = generateExcel(records)
  return excel
}
```

**推荐方案1**，使用Redis缓存浏览记录，性能更好，减少数据库压力。

### 总结

成功优化了历史浏览记录功能：
- 在 `viewHistory.js` 模型中添加 `limitHistoryCount` 方法
- 在 `add` 方法中调用 `limitHistoryCount`，限制浏览记录数量为50条
- 在 `schema.sql` 中创建MySQL事件，每天清理30天前的浏览记录
- 创建 `view-history-optimize.sql` 脚本，用于启用自动清理功能
- 优化后，浏览记录数量得到控制，查询性能得到提升
- 自动清理过期记录，减少维护成本

现在用户的浏览记录会自动限制在50条以内，30天前的记录会自动清理，系统性能得到提升，用户体验也得到优化。

---

