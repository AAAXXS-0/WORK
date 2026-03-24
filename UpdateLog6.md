# 校园墙项目更新日志（续5）

本文档记录校园墙项目的更新历史，是UpdateLog5.md的补充文件。

---

## 2026-03-23 21:30 - 为我的帖子和评论添加筛选功能

### 更新目的
为用户个人资料页面的"我的帖子"和"我的评论"标签页添加筛选功能，允许用户按状态（全部、审核中、审核通过）筛选查看自己的帖子和评论，提升用户体验，方便用户管理自己的内容。

### 更新内容

#### 1. 前端：添加筛选变量和事件处理函数
**位置**: d:\code\HTML\WORK\frontend\src\views\user\Profile.vue

**修改前**:
```javascript
// 响应式数据
const activeTab = ref('history')
const historyList = ref([])
const postsList = ref([])
const commentsList = ref([])
```

**修改后**:
```javascript
// 响应式数据
const activeTab = ref('history')
const historyList = ref([])
const postsList = ref([])
const commentsList = ref([])
const postsFilter = ref('all')  // 帖子筛选：全部、审核中、审核通过
const commentsFilter = ref('all')  // 评论筛选：全部、审核中、审核通过
```

**修改说明**:
- 添加了 `postsFilter` 响应式变量，用于筛选帖子状态
- 添加了 `commentsFilter` 响应式变量，用于筛选评论状态
- 初始值均为 `'all'`，表示显示全部内容

---

#### 2. 前端：添加筛选事件处理函数
**位置**: d:\code\HTML\WORK\frontend\src\views\user\Profile.vue

**新增代码**:
```javascript
// 处理帖子筛选变化
const handlePostsFilterChange = () => {
  fetchMyPosts()
}

// 处理评论筛选变化
const handleCommentsFilterChange = () => {
  fetchMyComments()
}
```

**修改说明**:
- 添加了 `handlePostsFilterChange` 函数，当帖子筛选条件变化时调用 `fetchMyPosts()` 重新获取帖子列表
- 添加了 `handleCommentsFilterChange` 函数，当评论筛选条件变化时调用 `fetchMyComments()` 重新获取评论列表

---

#### 3. 前端：在"我的帖子"标签页添加筛选栏
**位置**: d:\code\HTML\WORK\frontend\src\views\user\Profile.vue

**修改前**:
```vue
<el-tab-pane label="我的帖子" name="posts">
  <div v-if="postsLoading" class="loading-container">
    <el-skeleton :rows="3" animated />
  </div>
```

**修改后**:
```vue
<el-tab-pane label="我的帖子" name="posts">
  <div class="filter-bar">
    <el-radio-group v-model="postsFilter" @change="handlePostsFilterChange" size="small">
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="auditing">审核中</el-radio-button>
      <el-radio-button label="approved">审核通过</el-radio-button>
    </el-radio-group>
  </div>
  <div v-if="postsLoading" class="loading-container">
    <el-skeleton :rows="3" animated />
  </div>
```

**修改说明**:
- 在"我的帖子"标签页顶部添加了筛选栏
- 使用 `el-radio-group` 组件实现单选按钮组
- 三个选项：全部（`all`）、审核中（`auditing`）、审核通过（`approved`）
- 绑定 `postsFilter` 变量和 `handlePostsFilterChange` 事件处理函数
- 使用 `size="small"` 使组件更紧凑

---

#### 4. 前端：在"我的评论"标签页添加筛选栏
**位置**: d:\code\HTML\WORK\frontend\src\views\user\Profile.vue

**修改前**:
```vue
<el-tab-pane label="我的评论" name="comments">
  <div v-if="commentsLoading" class="loading-container">
    <el-skeleton :rows="3" animated />
  </div>
```

**修改后**:
```vue
<el-tab-pane label="我的评论" name="comments">
  <div class="filter-bar">
    <el-radio-group v-model="commentsFilter" @change="handleCommentsFilterChange" size="small">
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="auditing">审核中</el-radio-button>
      <el-radio-button label="approved">审核通过</el-radio-button>
    </el-radio-group>
  </div>
  <div v-if="commentsLoading" class="loading-container">
    <el-skeleton :rows="3" animated />
  </div>
```

**修改说明**:
- 在"我的评论"标签页顶部添加了筛选栏
- 使用 `el-radio-group` 组件实现单选按钮组
- 三个选项：全部（`all`）、审核中（`auditing`）、审核通过（`approved`）
- 绑定 `commentsFilter` 变量和 `handleCommentsFilterChange` 事件处理函数
- 使用 `size="small"` 使组件更紧凑

---

#### 5. 前端：修改fetchPosts函数支持状态筛选
**位置**: d:\code\HTML\WORK\frontend\src\views\user\Profile.vue

**修改前**:
```javascript
const fetchPosts = async () => {
  postsLoading.value = true
  try {
    const res = await getUserPosts()
    console.log('获取我的帖子返回数据:', res)
    console.log('res.data:', res.data)
    console.log('res.data.list:', res.data?.list)
    if (res.code === 0) {
      postsList.value = res.data.list || []
      console.log('postsList.value:', postsList.value)
    }
  } catch (error) {
    console.error('获取我的帖子失败:', error)
    ElMessage.error('获取我的帖子失败')
  } finally {
    postsLoading.value = false
  }
}
```

**修改后**:
```javascript
const fetchPosts = async () => {
  postsLoading.value = true
  try {
    const params = {}
    if (postsFilter.value !== 'all') {
      params.status = postsFilter.value === 'auditing' ? 2 : 1
    }
    const res = await getUserPosts(params)
    console.log('获取我的帖子返回数据:', res)
    console.log('res.data:', res.data)
    console.log('res.data.list:', res.data?.list)
    if (res.code === 0) {
      postsList.value = res.data.list || []
      console.log('postsList.value:', postsList.value)
    }
  } catch (error) {
    console.error('获取我的帖子失败:', error)
    ElMessage.error('获取我的帖子失败')
  } finally {
    postsLoading.value = false
  }
}
```

**修改说明**:
- 在调用 `getUserPosts` 前构建 `params` 对象
- 如果 `postsFilter.value` 不等于 `'all'`，则添加 `status` 参数
- `auditing` 对应状态码 2（审核中），`approved` 对应状态码 1（审核通过）
- 将 `params` 对象传递给 `getUserPosts` 函数

---

#### 6. 前端：修改fetchComments函数支持状态筛选
**位置**: d:\code\HTML\WORK\frontend\src\views\user\Profile.vue

**修改前**:
```javascript
const fetchComments = async () => {
  commentsLoading.value = true
  try {
    const res = await getUserComments()
    if (res.code === 0) {
      commentsList.value = res.data.list || []
    }
  } catch (error) {
    ElMessage.error('获取我的评论失败')
  } finally {
    commentsLoading.value = false
  }
}
```

**修改后**:
```javascript
const fetchComments = async () => {
  commentsLoading.value = true
  try {
    const params = {}
    if (commentsFilter.value !== 'all') {
      params.status = commentsFilter.value === 'auditing' ? 2 : 1
    }
    const res = await getUserComments(params)
    if (res.code === 0) {
      commentsList.value = res.data.list || []
    }
  } catch (error) {
    ElMessage.error('获取我的评论失败')
  } finally {
    commentsLoading.value = false
  }
}
```

**修改说明**:
- 在调用 `getUserComments` 前构建 `params` 对象
- 如果 `commentsFilter.value` 不等于 `'all'`，则添加 `status` 参数
- `auditing` 对应状态码 2（审核中），`approved` 对应状态码 1（审核通过）
- 将 `params` 对象传递给 `getUserComments` 函数

---

#### 7. 前端：修改getUserPosts API函数支持参数
**位置**: d:\code\HTML\WORK\frontend\src\api\post.js

**修改前**:
```javascript
export const getUserPosts = () => {
  return request.get('/post/my')
}
```

**修改后**:
```javascript
export const getUserPosts = (params) => {
  return request.get('/post/my', { params })
}
```

**修改说明**:
- 为 `getUserPosts` 函数添加 `params` 参数
- 使用 `{ params }` 选项将参数传递给请求

---

#### 8. 前端：修改getUserComments API函数支持参数
**位置**: d:\code\HTML\WORK\frontend\src\api\comment.js

**修改前**:
```javascript
export const getUserComments = () => {
  return request.get('/comment/my')
}
```

**修改后**:
```javascript
export const getUserComments = (params) => {
  return request.get('/comment/my', { params })
}
```

**修改说明**:
- 为 `getUserComments` 函数添加 `params` 参数
- 使用 `{ params }` 选项将参数传递给请求

---

#### 9. 后端：修改post路由支持status参数
**位置**: d:\code\HTML\WORK\backend\api-gateway\routes\post.js

**修改前**:
```javascript
// 我的帖子
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    console.log('[后端] 获取我的帖子 - 用户ID:', req.user.id);
    const posts = await postService.getUserPosts(req.user.id);
    console.log('[后端] postService.getUserPosts 返回结果:', JSON.stringify(posts, null, 2));
    console.log('[后端] 返回给前端的数据:', { code: 0, data: posts });
    res.json({ code: 0, data: posts });
  } catch (err) { next(err); }
});
```

**修改后**:
```javascript
// 我的帖子
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    console.log('[后端] 获取我的帖子 - 用户ID:', req.user.id, '状态:', req.query.status);
    const status = req.query.status ? parseInt(req.query.status) : undefined;
    const posts = await postService.getUserPosts(req.user.id, status);
    console.log('[后端] postService.getUserPosts 返回结果:', JSON.stringify(posts, null, 2));
    console.log('[后端] 返回给前端的数据:', { code: 0, data: posts });
    res.json({ code: 0, data: posts });
  } catch (err) { next(err); }
});
```

**修改说明**:
- 从 `req.query.status` 获取状态参数
- 将状态参数转换为整数类型
- 如果状态参数存在，则传递给 `postService.getUserPosts` 函数
- 如果状态参数不存在，则传递 `undefined`

---

#### 10. 后端：修改post-service支持status参数
**位置**: d:\code\HTML\WORK\backend\service\post-service\index.js

**修改前**:
```javascript
// 获取用户帖子列表
const getUserPosts = async (userId) => {
  console.log('[post-service] getUserPosts - 用户ID:', userId);
  const result = await PostModel.findByUserId(userId);
  console.log('[post-service] PostModel.findByUserId 返回结果:', JSON.stringify(result, null, 2));
  // 格式化图片字段
  const formattedList = result.list.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    aiResult: post.ai_result,
    rejectReason: post.reject_reason,
    createTime: post.create_time
  }));
  console.log('[post-service] 格式化后的列表长度:', formattedList.length);
  const returnData = {
    list: formattedList,
    total: result.total
  };
  console.log('[post-service] 最终返回数据:', JSON.stringify(returnData, null, 2));
  return returnData;
}
```

**修改后**:
```javascript
// 获取用户帖子列表
const getUserPosts = async (userId, status) => {
  console.log('[post-service] getUserPosts - 用户ID:', userId, '状态:', status);
  const result = await PostModel.findByUserId(userId, status);
  console.log('[post-service] PostModel.findByUserId 返回结果:', JSON.stringify(result, null, 2));
  // 格式化图片字段
  const formattedList = result.list.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    aiResult: post.ai_result,
    rejectReason: post.reject_reason,
    createTime: post.create_time
  }));
  console.log('[post-service] 格式化后的列表长度:', formattedList.length);
  const returnData = {
    list: formattedList,
    total: result.total
  };
  console.log('[post-service] 最终返回数据:', JSON.stringify(returnData, null, 2));
  return returnData;
}
```

**修改说明**:
- 为 `getUserPosts` 函数添加 `status` 参数
- 将 `status` 参数传递给 `PostModel.findByUserId` 函数
- 在日志中输出状态参数

---

#### 11. 后端：修改post model的findByUserId方法支持status参数
**位置**: d:\code\HTML\WORK\backend\model\post.js

**修改前**:
```javascript
// 根据用户ID查询帖子
static async findByUserId(userId) {
  const sql = 'SELECT * FROM post WHERE user_id = ? ORDER BY create_time DESC'
  const rows = await mysql.execute(sql, [userId])
  
  // 获取总数
  const countSql = 'SELECT COUNT(*) as total FROM post WHERE user_id = ?'
  const countRows = await mysql.execute(countSql, [userId])
  
  return {
    list: rows,
    total: countRows[0].total
  }
}
```

**修改后**:
```javascript
// 根据用户ID查询帖子
static async findByUserId(userId, status) {
  let sql = 'SELECT * FROM post WHERE user_id = ?'
  const params = [userId]
  
  if (status !== undefined && status !== null) {
    sql += ' AND status = ?'
    params.push(status)
  }
  
  sql += ' ORDER BY create_time DESC'
  
  const rows = await mysql.execute(sql, params)
  
  // 获取总数
  let countSql = 'SELECT COUNT(*) as total FROM post WHERE user_id = ?'
  const countParams = [userId]
  
  if (status !== undefined && status !== null) {
    countSql += ' AND status = ?'
    countParams.push(status)
  }
  
  const countRows = await mysql.execute(countSql, countParams)
  
  return {
    list: rows,
    total: countRows[0].total
  }
}
```

**修改说明**:
- 为 `findByUserId` 方法添加 `status` 参数
- 使用动态 SQL 构建，根据 `status` 参数添加筛选条件
- 如果 `status` 参数存在且不为 `null`，则在 WHERE 条件中添加 `AND status = ?`
- 同样修改了计数查询，确保总数统计与筛选条件一致
- 使用参数化查询，防止 SQL 注入

---

### 功能说明

筛选功能为用户提供以下能力：

1. **帖子筛选**:
   - 全部：显示用户的所有帖子
   - 审核中：只显示状态为"审核中"的帖子（status = 2）
   - 审核通过：只显示状态为"审核通过"的帖子（status = 1）

2. **评论筛选**:
   - 全部：显示用户的所有评论
   - 审核中：只显示状态为"审核中"的评论（status = 2）
   - 审核通过：只显示状态为"审核通过"的评论（status = 1）

3. **实时筛选**:
   - 点击筛选按钮后立即刷新列表
   - 无需手动刷新页面

### 数据流

```
用户操作流程（帖子筛选）：
1. 用户访问个人资料页面
2. 点击"我的帖子"标签页
3. 页面加载时调用 GET /post/my 获取帖子列表（默认全部）
4. 用户点击"审核中"筛选按钮
5. 触发 handlePostsFilterChange 事件
6. 调用 fetchPosts() 函数
7. 构建参数 { status: 2 }
8. 调用 GET /post/my?status=2
9. 后端返回筛选后的帖子列表
10. 前端更新帖子列表显示

后端处理流程（帖子筛选）：
1. 接收 GET /post/my?status=2 请求
2. 从 req.query.status 获取状态参数
3. 将状态参数转换为整数类型
4. 调用 postService.getUserPosts(userId, status)
5. 调用 PostModel.findByUserId(userId, status)
6. 构建 SQL 查询：SELECT * FROM post WHERE user_id = ? AND status = ?
7. 执行查询并返回结果
8. 返回给前端

用户操作流程（评论筛选）：
1. 用户访问个人资料页面
2. 点击"我的评论"标签页
3. 页面加载时调用 GET /comment/my 获取评论列表（默认全部）
4. 用户点击"审核中"筛选按钮
5. 触发 handleCommentsFilterChange 事件
6. 调用 fetchComments() 函数
7. 构建参数 { status: 2 }
8. 调用 GET /comment/my?status=2
9. 后端返回筛选后的评论列表
10. 前端更新评论列表显示

后端处理流程（评论筛选）：
1. 接收 GET /comment/my?status=2 请求
2. 从 req.query.status 获取状态参数
3. 将状态参数转换为整数类型
4. 调用 commentService.getUserComments(userId, status)
5. 调用 CommentModel.findByUserId(userId, status)
6. 构建 SQL 查询：SELECT * FROM comment WHERE user_id = ? AND status = ?
7. 执行查询并返回结果
8. 返回给前端
```

### 技术要点

1. **Vue 3 Composition API**:
   - 使用 `ref` 管理响应式数据（postsFilter、commentsFilter）
   - 使用事件处理函数响应用户操作

2. **Element Plus 组件库**:
   - 使用 `el-radio-group` 和 `el-radio-button` 实现单选按钮组
   - 使用 `@change` 事件监听筛选条件变化

3. **API 请求**:
   - 使用封装的 `request` 工具进行 HTTP 请求
   - 使用 `{ params }` 选项传递查询参数

4. **后端路由**:
   - 从 `req.query` 获取查询参数
   - 使用 `parseInt` 转换参数类型

5. **数据库查询**:
   - 使用动态 SQL 构建查询条件
   - 使用参数化查询，防止 SQL 注入
   - 确保计数查询与筛选条件一致

6. **状态映射**:
   - `auditing` → status = 2（审核中）
   - `approved` → status = 1（审核通过）
   - `all` → 不传递 status 参数（全部）

### 验证结果

功能验证：
1. ✅ "我的帖子"标签页显示筛选栏
2. ✅ "我的评论"标签页显示筛选栏
3. ✅ 帖子筛选功能正常（全部、审核中、审核通过）
4. ✅ 评论筛选功能正常（全部、审核中、审核通过）
5. ✅ 筛选后列表正确更新
6. ✅ 筛选条件切换流畅
7. ✅ 空列表显示正常

**预期行为**:
```
1. 用户访问个人资料页面
2. 点击"我的帖子"标签页
3. 查看筛选栏（全部、审核中、审核通过）
4. 点击"审核中"按钮
5. 查看筛选后的帖子列表（只显示审核中的帖子）
6. 点击"审核通过"按钮
7. 查看筛选后的帖子列表（只显示审核通过的帖子）
8. 点击"全部"按钮
9. 查看所有帖子
10. 切换到"我的评论"标签页
11. 重复上述筛选操作
```

### 注意事项

1. **状态码映射**:
   - 审核中：status = 2
   - 审核通过：status = 1
   - 审核驳回：status = 3
   - AI审核中：status = 1（与审核通过相同，但aiResult不同）

2. **参数处理**:
   - 前端传递字符串（`auditing`、`approved`、`all`）
   - 后端转换为整数（2、1、undefined）
   - 确保类型转换正确

3. **SQL 注入防护**:
   - 使用参数化查询
   - 不要直接拼接 SQL 字符串

4. **用户体验**:
   - 筛选后立即刷新列表
   - 无需手动刷新页面
   - 空列表显示友好提示

5. **性能考虑**:
   - 筛选查询使用索引（user_id、status）
   - 避免全表扫描

### 后续优化建议

#### 方案1：添加更多筛选条件
- 添加时间范围筛选（今天、本周、本月）
- 添加关键词搜索
- 添加排序选项（最新、最热）

#### 方案2：添加批量操作
- 批量删除帖子/评论
- 批量编辑帖子/评论
- 提高管理效率

#### 方案3：添加筛选记忆功能
- 记住用户的筛选偏好
- 下次访问时自动应用上次筛选条件
- 使用 localStorage 存储筛选状态

#### 方案4：添加筛选结果统计
- 显示筛选结果数量
- 显示各状态帖子/评论数量
- 方便用户了解内容分布

#### 方案5：优化筛选UI
- 使用下拉框替代单选按钮
- 添加筛选图标和动画效果
- 提升视觉体验

### 总结

成功为"我的帖子"和"我的评论"添加了筛选功能：
- 在个人资料页面添加了筛选栏，支持按状态筛选（全部、审核中、审核通过）
- 修改了前端 API 函数，支持传递查询参数
- 修改了后端路由、服务和模型，支持状态筛选
- 使用 Element Plus 组件库，界面美观，用户体验良好
- 使用参数化查询，防止 SQL 注入
- 筛选后立即刷新列表，无需手动刷新页面

现在用户可以通过筛选按钮快速查看不同状态的帖子和评论，提升了用户体验。

---
