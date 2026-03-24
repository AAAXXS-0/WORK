### 2026-03-23 修正审核列表页面审核状态显示逻辑

**问题：** 审核列表页面（AuditList.vue）中，原本错误地将 `ai_result` 字段作为审核状态来显示。实际上：
- `status` 字段才是审核状态（数字：0-草稿、1-AI审核中、2-待人工审核、3-已发布、4-已驳回、5-已删除）
- `ai_result` 字段是AI审核的具体意见/描述（文本字符串，有就直接显示）

由于暂时没有接入AI API，`ai_result` 字段一直为空字符串，导致显示"未知"。

**更新位置：**
`frontend/src/views/admin/AuditList.vue`

**更新前代码：**

```vue
<!-- 帖子审核表格 -->
<el-table-column prop="aiResult" label="AI审核结果" width="150">
  <template #default="scope">
    <el-tag :type="getAiResultType(scope.row.aiResult)">
      {{ getAiResultText(scope.row.aiResult) }}
    </el-tag>
  </template>
</el-table-column>

<!-- 评论审核表格 -->
<el-table-column prop="aiResult" label="AI审核结果" width="150">
  <template #default="scope">
    <el-tag :type="getAiResultType(scope.row.aiResult)">
      {{ getAiResultText(scope.row.aiResult) }}
    </el-tag>
  </template>
</el-table-column>

<!-- 头像审核表格 -->
<el-table-column prop="aiResult" label="AI审核结果" width="150">
  <template #default="scope">
    <el-tag :type="getAiResultType(scope.row.aiResult)">
      {{ getAiResultText(scope.row.aiResult) }}
    </el-tag>
  </template>
</el-table-column>

<script>
// 将AI审核结果数字转换为文本
const getAiResultText = (aiResult) => {
  console.log('getAiResultText 输入:', aiResult, '类型:', typeof aiResult)
  const aiResultNum = parseInt(aiResult) || 0
  const resultMap = {
    1: '通过',
    2: '驳回',
    3: '合规',
    4: '违规',
    5: '不确定'
  }
  const result = resultMap[aiResultNum] || '未知'
  console.log('getAiResultText 输出:', result)
  return result
}

// 获取AI审核结果的标签类型
const getAiResultType = (aiResult) => {
  console.log('getAiResultType 输入:', aiResult, '类型:', typeof aiResult)
  const aiResultNum = parseInt(aiResult) || 0
  let type = 'info'
  if (aiResultNum === 1 || aiResultNum === 3) {
    type = 'success'
  } else if (aiResultNum === 2 || aiResultNum === 4) {
    type = 'danger'
  } else if (aiResultNum === 5) {
    type = 'warning'
  }
  console.log('getAiResultType 输出:', type)
  return type
}
</script>
```

**更新后代码：**

```vue
<!-- 帖子审核表格 -->
<el-table-column label="审核状态" width="120">
  <template #default="scope">
    <el-tag :type="getPostStatusType(scope.row.status)">
      {{ getPostStatusText(scope.row.status) }}
    </el-tag>
  </template>
</el-table-column>
<el-table-column prop="aiResult" label="AI审核意见" width="150">
  <template #default="scope">
    <span v-if="scope.row.aiResult">{{ scope.row.aiResult }}</span>
    <el-tag v-else type="info">暂无</el-tag>
  </template>
</el-table-column>

<!-- 评论审核表格 -->
<el-table-column label="审核状态" width="120">
  <template #default="scope">
    <el-tag :type="getCommentStatusType(scope.row.status)">
      {{ getCommentStatusText(scope.row.status) }}
    </el-tag>
  </template>
</el-table-column>
<el-table-column prop="aiResult" label="AI审核意见" width="150">
  <template #default="scope">
    <span v-if="scope.row.aiResult">{{ scope.row.aiResult }}</span>
    <el-tag v-else type="info">暂无</el-tag>
  </template>
</el-table-column>

<!-- 头像审核表格 -->
<el-table-column label="审核状态" width="120">
  <template #default="scope">
    <el-tag :type="getAvatarStatusType(scope.row.avatarStatus)">
      {{ getAvatarStatusText(scope.row.avatarStatus) }}
    </el-tag>
  </template>
</el-table-column>
<el-table-column prop="aiResult" label="AI审核意见" width="150">
  <template #default="scope">
    <span v-if="scope.row.aiResult">{{ scope.row.aiResult }}</span>
    <el-tag v-else type="info">暂无</el-tag>
  </template>
</el-table-column>

<script>
// 获取帖子审核状态文本
const getPostStatusText = (status) => {
  const statusNum = parseInt(status) || 0
  const statusMap = {
    0: '草稿',
    1: 'AI审核中',
    2: '待人工审核',
    3: '已发布',
    4: '已驳回',
    5: '已删除'
  }
  return statusMap[statusNum] || '未知'
}

// 获取帖子审核状态标签类型
const getPostStatusType = (status) => {
  const statusNum = parseInt(status) || 0
  if (statusNum === 2) return 'warning'
  if (statusNum === 3) return 'success'
  if (statusNum === 4) return 'danger'
  return 'info'
}

// 获取评论审核状态文本
const getCommentStatusText = (status) => {
  const statusNum = parseInt(status) || 0
  const statusMap = {
    0: '已删除',
    1: '正常',
    2: 'AI审核中',
    3: '待人工审核',
    4: '已驳回'
  }
  return statusMap[statusNum] || '未知'
}

// 获取评论审核状态标签类型
const getCommentStatusType = (status) => {
  const statusNum = parseInt(status) || 0
  if (statusNum === 3) return 'warning'
  if (statusNum === 1) return 'success'
  if (statusNum === 4) return 'danger'
  return 'info'
}

// 获取头像审核状态文本
const getAvatarStatusText = (status) => {
  const statusNum = parseInt(status) || 0
  const statusMap = {
    0: '未上传',
    1: '审核中',
    2: '已通过',
    3: '已驳回'
  }
  return statusMap[statusNum] || '未知'
}

// 获取头像审核状态标签类型
const getAvatarStatusType = (status) => {
  const statusNum = parseInt(status) || 0
  if (statusNum === 1) return 'warning'
  if (statusNum === 2) return 'success'
  if (statusNum === 3) return 'danger'
  return 'info'
}
</script>
```

**修改内容：**
1. 在帖子、评论、头像审核表格中，新增"审核状态"列，显示 `status` 字段对应的中文文本
2. 将原来的"AI审核结果"列改为"AI审核意见"列，直接显示 `ai_result` 字段的文本内容
3. 删除了 `getAiResultText` 和 `getAiResultType` 函数
4. 新增了 `getPostStatusText`、`getPostStatusType`、`getCommentStatusText`、`getCommentStatusType`、`getAvatarStatusText`、`getAvatarStatusType` 函数

**数据库字段说明：**
- 帖子 `post.status`：0-草稿、1-AI审核中、2-待人工审核、3-已发布、4-已驳回、5-已删除
- 评论 `comment.status`：0-已删除、1-正常、2-AI审核中、3-待人工审核、4-已驳回
- 头像 `user.avatar_status`：0-未上传、1-审核中、2-已通过、3-已驳回
- `ai_result`：AI审核的具体意见/描述（文本字符串）

**验证结果：**
- 审核状态列正确显示帖子的审核状态（如"待人工审核"）
- AI审核意见列显示AI返回的具体文本，如果为空则显示"暂无"
- 不需要重启服务，刷新页面即可看到效果

**注意事项：**
- 修改仅影响前端显示，不涉及后端逻辑
- 建议刷新浏览器页面查看效果
- 状态码定义与 `backend/common/constants.js` 保持一致

---

### 2026-03-23 修复后端帖子审核接口缺少status字段问题

**问题：** 前端审核列表页面显示所有帖子的审核状态都是"草稿"，检查前端日志发现后端返回的数据中没有 `status` 字段，导致前端无法正确映射审核状态。

**更新位置：**
`backend/service/post-service/index.js` - `getWaitAuditPosts` 函数

**更新前代码：**

```javascript
// 获取待人工审核的帖子
const getWaitAuditPosts = async () => {
  const posts = await PostModel.findWaitAudit()
  return posts.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    aiResult: post.ai_result,
    createTime: post.create_time,
    username: post.username,
    studentId: post.student_id
  }))
}
```

**更新后代码：**

```javascript
// 获取待人工审核的帖子
const getWaitAuditPosts = async () => {
  const posts = await PostModel.findWaitAudit()
  return posts.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    status: post.status,
    aiResult: post.ai_result,
    createTime: post.create_time,
    username: post.username,
    studentId: post.student_id
  }))
}
```

**修改内容：**
在返回的数据对象中添加了 `status: post.status` 字段

**问题原因：**
- `getWaitAuditPosts` 函数在映射数据库查询结果时，遗漏了 `status` 字段
- 数据库查询（`PostModel.findWaitAudit()`）确实返回了 `status` 字段，但映射到前端时被忽略了
- 前端使用 `parseInt(status) || 0` 处理缺失的 status，导致所有帖子都显示为 0（草稿）

**验证结果：**
- 前端现在能正确显示帖子的审核状态（待人工审核、已发布、已驳回等）
- 不需要重启服务，刷新页面即可看到效果

**注意事项：**
- 评论审核和头像审核接口已经正确返回了 `status` 和 `avatar_status` 字段，无需修改
- 建议重启后端服务以使修改生效
- 刷新浏览器页面查看效果

---

### 2026-03-23 修复评论审核通过时使用错误状态常量问题

**问题：** 评论审核通过时报错：`Bind parameters must not contain undefined. To pass SQL NULL specify JS null`。检查日志发现参数为 `[null,1,"",7]`，说明 `status` 参数为 `null`。

**更新位置：**
`backend/service/comment-audit-service/index.js` - `aiAuditDispatch` 和 `manualAudit` 函数

**更新前代码：**

```javascript
// AI审核调度
const aiAuditDispatch = async (commentId, content) => {
  // ...
  // 根据AI结果更新评论状态
  let status
  if (result.status === '合规') {
    status = COMMENT_STATUS.PUBLISHED
  } else if (result.status === '违规') {
    status = COMMENT_STATUS.REJECTED
  } else {
    status = COMMENT_STATUS.WAIT_AUDIT
  }
  // ...
}

// 人工审核处理
const manualAudit = async (commentId, act, auditUserId, rejectReason = '') => {
  // ...
  const status = act === 'pass' ? COMMENT_STATUS.PUBLISHED : COMMENT_STATUS.REJECTED
  // ...
}
```

**更新后代码：**

```javascript
// AI审核调度
const aiAuditDispatch = async (commentId, content) => {
  // ...
  // 根据AI结果更新评论状态
  let status
  if (result.status === '合规') {
    status = COMMENT_STATUS.NORMAL
  } else if (result.status === '违规') {
    status = COMMENT_STATUS.REJECTED
  } else {
    status = COMMENT_STATUS.WAIT_AUDIT
  }
  // ...
}

// 人工审核处理
const manualAudit = async (commentId, act, auditUserId, rejectReason = '') => {
  // ...
  const status = act === 'pass' ? COMMENT_STATUS.NORMAL : COMMENT_STATUS.REJECTED
  // ...
}
```

**修改内容：**
将两处 `COMMENT_STATUS.PUBLISHED` 改为 `COMMENT_STATUS.NORMAL`

**问题原因：**
- 评论状态常量 `COMMENT_STATUS` 中没有 `PUBLISHED` 属性
- 帖子状态 `POST_STATUS` 才有 `PUBLISHED`，但评论状态应该使用 `NORMAL`（正常）
- 使用未定义的常量导致 `status` 变量为 `undefined`，传递给SQL时出错

**评论状态定义（来自 constants.js）：**
- 0: DELETED（已删除）
- 1: NORMAL（正常）
- 2: AI_AUDITING（AI审核中）
- 3: WAIT_AUDIT（待人工审核）
- 4: REJECTED（已驳回）

**验证结果：**
- 评论审核通过不再报错
- 评论状态正确更新为 1（正常）

**注意事项：**
- 建议重启后端服务以使修改生效
- 刷新浏览器页面重试评论审核操作

---

### 2026-03-23 修改评论发表成功的提示信息

**问题：** 用户发表评论后，提示信息为"评论发布成功"，没有说明评论需要审核。

**更新位置：**
`frontend/src/components/CommentList.vue` - `addComment` 函数

**更新前代码：**

```javascript
// 发布评论
const addComment = async () => {
  if (!commentContent.value) return ElMessage.warning('评论不能为空')
  await commentApi.addComment({
    postId: props.postId,
    content: commentContent.value
  })
  commentContent.value = ''
  getCommentList()
  ElMessage.success('评论发布成功')
}
```

**更新后代码：**

```javascript
// 发布评论
const addComment = async () => {
  if (!commentContent.value) return ElMessage.warning('评论不能为空')
  await commentApi.addComment({
    postId: props.postId,
    content: commentContent.value
  })
  commentContent.value = ''
  getCommentList()
  ElMessage.success('评论发表成功，正在审核中')
}
```

**修改内容：**
将提示信息从"评论发布成功"改为"评论发表成功，正在审核中"

**验证结果：**
- 用户发表评论后显示"评论发表成功，正在审核中"
- 提示信息更准确地反映了评论需要审核的流程

**注意事项：**
- 刷新浏览器页面即可看到效果

---

### 2026-03-23 修复头像AI审核时错误调用updateAvatarAuditInfo的问题

**问题：** 头像上传后没有被审核，或者被直接通过。检查代码发现头像AI审核服务中调用了两次 `updateAvatarAuditInfo`，第一次调用时传入了错误的参数。

**更新位置：**
`backend/service/avatar-audit-service/index.js` - `aiAuditDispatch` 函数

**更新前代码：**

```javascript
// AI审核调度
const aiAuditDispatch = async (userId, avatarUrl) => {
  try {
    logger.info(`开始AI审核：用户ID=${userId}`)
    // 调用AI审核接口（传入图片URL）
    const result = await aiAudit.audit('', [avatarUrl])
    
    // 映射AI审核结果
    const auditResult = AI_RESULT_MAP[result.status] || AUDIT_RESULT.UNCERTAIN
    
    // 更新AI审核结果
    await UserModel.updateAvatarAuditInfo(userId, auditResult, null, '')  // ❌ 错误：将审核结果作为状态

    // 根据AI结果更新头像状态
    let status
    if (result.status === '合规') {
      status = AVATAR_STATUS.APPROVED
    } else if (result.status === '违规') {
      status = AVATAR_STATUS.REJECTED
    } else {
      status = AVATAR_STATUS.AUDITING
    }
    await UserModel.updateAvatarAuditInfo(userId, status, null, result.reason || '')  // ✅ 正确
    
    logger.info(`AI审核完成：用户ID=${userId}，结果=${result.status}`)
    return { status, reason: result.reason }
  } catch (err) {
    logger.error(`AI审核调度失败：用户ID=${userId}，错误=${err.message}`)
    // AI审核失败，转人工审核
    await UserModel.updateAvatarAuditInfo(userId, AVATAR_STATUS.AUDITING, null, 'AI审核接口异常')
    throw err
  }
}
```

**更新后代码：**

```javascript
// AI审核调度
const aiAuditDispatch = async (userId, avatarUrl) => {
  try {
    logger.info(`开始AI审核：用户ID=${userId}`)
    // 调用AI审核接口（传入图片URL）
    const result = await aiAudit.audit('', [avatarUrl])
    
    // 根据AI结果更新头像状态
    let status
    if (result.status === '合规') {
      status = AVATAR_STATUS.APPROVED
    } else if (result.status === '违规') {
      status = AVATAR_STATUS.REJECTED
    } else {
      status = AVATAR_STATUS.AUDITING
    }
    await UserModel.updateAvatarAuditInfo(userId, status, null, result.reason || '')
    
    logger.info(`AI审核完成：用户ID=${userId}，结果=${result.status}`)
    return { status, reason: result.reason }
  } catch (err) {
    logger.error(`AI审核调度失败：用户ID=${userId}，错误=${err.message}`)
    // AI审核失败，转人工审核
    await UserModel.updateAvatarAuditInfo(userId, AVATAR_STATUS.AUDITING, null, 'AI审核接口异常')
    throw err
  }
}
```

**修改内容：**
删除了第一次错误的 `updateAvatarAuditInfo` 调用，只保留正确的状态更新调用

**问题原因：**
- 第一次调用 `updateAvatarAuditInfo(userId, auditResult, null, '')` 时，将审核结果（如 3-合规）作为状态传入
- 审核结果常量 `AUDIT_RESULT` 的值（1-5）与头像状态常量 `AVATAR_STATUS` 的值（0-3）不匹配
- 导致头像状态被错误设置为 3（已驳回），而不是正确的 1（审核中）或 2（已通过）
- 第二次调用虽然正确，但已经被第一次的错误调用覆盖了

**头像状态定义：**
- 0: NOT_UPLOADED（未上传）
- 1: AUDITING（审核中）
- 2: APPROVED（已通过）
- 3: REJECTED（已驳回）

**验证结果：**
- 头像上传后正确进入审核流程
- AI审核结果正确映射到头像状态
- 头像状态正确显示为"审核中"或"已通过"/"已驳回"

**注意事项：**
- 建议重启后端服务以使修改生效
- 刷新浏览器页面重试头像上传

---

### 2026-03-23 重构头像审核流程：审核通过后才更新头像

**需求：** 
1. 用户上传图片后，暂不更新头像，在头像旁显示状态框（审核中/被驳回），正常通过的头像不需要状态框
2. 头像正在审核中不允许再次上传头像
3. 头像进入AI审核，AI审核失败进入人工审核
4. 审核通过后更换头像并改变状态，审核未通过保持原有头像不变并改变状态

**更新位置：**
- `backend/dao/mysql/migration_add_pending_avatar.sql` - 新建数据库迁移脚本
- `backend/api-gateway/routes/auth.js` - 修改头像上传接口
- `backend/model/user.js` - 添加待审核头像相关方法
- `backend/service/user-service/index.js` - 添加待审核头像服务
- `backend/service/avatar-audit-service/index.js` - 修改AI审核和人工审核逻辑
- `frontend/src/views/user/Profile.vue` - 修改头像显示逻辑
- `frontend/src/views/admin/AuditList.vue` - 修改审核列表头像显示

**数据库迁移：**

新建文件 `backend/dao/mysql/migration_add_pending_avatar.sql`：

```sql
-- 添加待审核头像字段迁移脚本
-- 执行时间：2026-03-23
-- 说明：为user表添加pending_avatar字段，用于存储待审核的头像URL

-- 1. 添加pending_avatar字段
ALTER TABLE `user`
ADD COLUMN `pending_avatar` VARCHAR(255) DEFAULT '' COMMENT '待审核的头像URL' AFTER `avatar`;

-- 2. 验证表结构修改
DESCRIBE `user`;
```

**后端修改：**

1. **backend/api-gateway/routes/auth.js** - 头像上传接口：

```javascript
// 更新用户头像（需要认证）
router.post('/avatar', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { avatar } = req.body
  
  // 第一步：保存待审核的头像，设置状态为审核中
  await userService.updatePendingAvatar(userId, avatar)
  
  // 第二步：调用AI审核服务
  try {
    await avatarAuditService.aiAuditDispatch(userId, avatar)
  } catch (err) {
    // AI审核失败，头像会自动转为待人工审核状态
    console.error('AI审核失败，已转人工审核:', err.message)
  }
  
  res.json({ code: 0, msg: '头像上传成功，正在审核中', data: { pendingAvatar: avatar } })
}))
```

2. **backend/model/user.js** - 添加待审核头像相关方法：

```javascript
// 更新待审核头像
static async updatePendingAvatar(userId, pendingAvatarUrl) {
  const sql = 'UPDATE user SET pending_avatar = ?, avatar_status = 1 WHERE id = ?'
  await mysql.execute(sql, [pendingAvatarUrl, userId])
}

// 审核通过头像
static async approveAvatar(userId) {
  const sql = 'UPDATE user SET avatar = pending_avatar, pending_avatar = \'\', avatar_status = 2 WHERE id = ?'
  await mysql.execute(sql, [userId])
}
```

3. **backend/service/avatar-audit-service/index.js** - 修改AI审核逻辑：

```javascript
// AI审核调度
const aiAuditDispatch = async (userId, avatarUrl) => {
  try {
    logger.info(`开始AI审核：用户ID=${userId}`)
    const result = await aiAudit.audit('', [avatarUrl])
    
    let status
    if (result.status === '合规') {
      status = AVATAR_STATUS.APPROVED
    } else if (result.status === '违规') {
      status = AVATAR_STATUS.REJECTED
    } else {
      status = AVATAR_STATUS.AUDITING
    }
    
    // 审核通过：更新正式头像，清空待审核头像
    if (status === AVATAR_STATUS.APPROVED) {
      await UserModel.approveAvatar(userId)
    }
    
    // 审核未通过：只更新状态和原因，保持待审核头像不变
    await UserModel.updateAvatarAuditInfo(userId, status, null, result.reason || '')
    
    logger.info(`AI审核完成：用户ID=${userId}，结果=${result.status}`)
    return { status, reason: result.reason }
  } catch (err) {
    logger.error(`AI审核调度失败：用户ID=${userId}，错误=${err.message}`)
    await UserModel.updateAvatarAuditInfo(userId, AVATAR_STATUS.AUDITING, null, 'AI审核接口异常')
    throw err
  }
}
```

4. **backend/service/avatar-audit-service/index.js** - 修改人工审核逻辑：

```javascript
// 人工审核处理
const manualAudit = async (userId, act, auditUserId, rejectReason = '') => {
  if (!['pass', 'reject'].includes(act)) {
    throw new BusinessException(ErrorCode.AUDIT_ACTION_INVALID)
  }
  const status = act === 'pass' ? AVATAR_STATUS.APPROVED : AVATAR_STATUS.REJECTED
  const auditResult = act === 'pass' ? AUDIT_RESULT.PASS : AUDIT_RESULT.REJECT
  
  // 审核通过：更新正式头像，清空待审核头像
  if (act === 'pass') {
    await UserModel.approveAvatar(userId)
  }
  
  // 审核未通过：只更新状态和原因，保持待审核头像不变
  await UserModel.updateAvatarAuditInfo(userId, status, auditUserId, rejectReason)
  logger.info(`头像审核完成：用户ID=${userId}，操作=${act}，审核人ID=${auditUserId}`)
  return { success: true }
}
```

5. **backend/service/user-service/index.js** - 添加待审核头像服务：

```javascript
// 更新待审核头像
const updatePendingAvatar = async (userId, pendingAvatarUrl) => {
  if (!pendingAvatarUrl) {
    throw new BusinessException(ErrorCode.PARAM_ERROR, '头像URL不能为空')
  }
  await UserModel.updatePendingAvatar(userId, pendingAvatarUrl)
  logger.info(`用户待审核头像更新成功：用户ID=${userId}，待审核头像URL=${pendingAvatarUrl}`)
  return { success: true, pendingAvatar: pendingAvatarUrl }
}
```

6. **backend/service/user-service/index.js** - 修改getUserInfo返回头像相关字段：

```javascript
// 获取用户信息
const getUserInfo = async (userId) => {
  const user = await UserModel.findById(userId)
  if (!user) {
    throw new BusinessException(ErrorCode.USER_NOT_FOUND)
  }
  return {
    id: user.id,
    studentId: user.student_id,
    username: user.username,
    avatar: user.avatar || '',
    pendingAvatar: user.pending_avatar || '',
    avatarStatus: user.avatar_status || 0,
    avatarRejectReason: user.avatar_reject_reason || '',
    status: user.status,
    role: user.role || 0,
    createTime: user.create_time
  }
}
```

**前端修改：**

1. **frontend/src/views/user/Profile.vue** - 修改头像显示逻辑：

```vue
<template>
  <div class="avatar-section">
    <el-avatar :size="100" :src="getDisplayAvatar()" @click="handleAvatarClick">
      <img v-if="!getDisplayAvatar()" src="@/assets/default-avatar.png" alt="默认头像" />
    </el-avatar>
    <div class="avatar-status" v-if="userInfo.avatarStatus !== 2">
      <el-tag :type="getAvatarStatusTagType(userInfo.avatarStatus)" size="small">
        {{ getAvatarStatusText(userInfo.avatarStatus) }}
      </el-tag>
    </div>
    <div class="avatar-actions">
      <el-button size="small" @click="handleAvatarClick" :disabled="userInfo.avatarStatus === 1">
        {{ userInfo.avatarStatus === 1 ? '审核中' : '更换头像' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
// 获取显示的头像URL
const getDisplayAvatar = () => {
  if (!userInfo.value) return ''
  const status = userInfo.value.avatarStatus
  
  // 审核中或已驳回：显示待审核的头像
  if (status === 1 || status === 3) {
    return getImageUrl(userInfo.value.pendingAvatar)
  }
  
  // 已通过：显示正式头像
  if (status === 2) {
    return getImageUrl(userInfo.value.avatar)
  }
  
  // 未上传：返回空，显示默认头像
  return ''
}
</script>
```

2. **frontend/src/views/admin/AuditList.vue** - 修改审核列表头像显示：

```vue
<el-table-column label="头像" width="150">
  <template #default="scope">
    <el-avatar :size="80" :src="getImageUrl(scope.row.pendingAvatar || scope.row.avatar)">
      {{ scope.row.username?.charAt(0) || 'U' }}
    </el-avatar>
  </template>
</el-table-column>
```

**修改内容：**
1. 数据库添加 `pending_avatar` 字段存储待审核头像
2. 用户上传头像时保存到 `pending_avatar`，状态设为审核中（1）
3. 审核通过时将 `pending_avatar` 复制到 `avatar`，清空 `pending_avatar`，状态设为已通过（2）
4. 审核未通过时只更新状态和原因，保持 `pending_avatar` 不变
5. 前端根据状态显示不同的头像：审核中/已驳回显示待审核头像，已通过显示正式头像
6. 状态框只在非已通过状态时显示
7. 审核中不允许再次上传头像

**流程说明：**
1. 用户上传图片 → 保存到 `pending_avatar`，状态=审核中（1）
2. 进入AI审核 → AI审核通过：更新正式头像，状态=已通过（2）；AI审核未通过：状态=已驳回（3），保持原有头像不变
3. AI审核失败 → 转人工审核，状态=审核中（1）
4. 人工审核通过 → 更新正式头像，状态=已通过（2）
5. 人工审核未通过 → 状态=已驳回（3），保持原有头像不变

**验证结果：**
- 用户上传头像后，头像旁显示"审核中"状态框
- 审核中不允许再次上传头像
- 审核通过后，头像更新为待审核的头像，状态框消失
- 审核未通过，保持原有头像不变，显示"已驳回"状态框和驳回理由

**注意事项：**
- 需要先执行数据库迁移脚本 `backend/dao/mysql/migration_add_pending_avatar.sql`
- 建议重启后端服务以使修改生效
- 刷新浏览器页面重试头像上传

---

### 2026-03-23 修复头像审核的两个显示问题

**问题1：** 头像审核界面审核状态始终显示"未审核"

**原因：** 后端返回的字段名是下划线命名（`avatar_status`），但前端使用的是驼峰命名（`avatarStatus`），导致字段映射失败

**更新位置：**
`frontend/src/views/admin/AuditList.vue` - `getAvatarAuditList` 函数

**更新前代码：**

```javascript
// 获取待审核头像列表
const getAvatarAuditList = async () => {
  avatarLoading.value = true
  try {
    const res = await request.get('/admin/avatar-audit/list')
    console.log('头像审核列表响应:', res)
    if (res.code === 0) {
      // 后端返回的数据结构是 { list: [...], total: ... }
      avatarTableData.value = res.data.list || []
      console.log('处理后的avatarTableData:', avatarTableData.value)
    }
  } catch (error) {
    ElMessage.error('获取待审核头像列表失败')
  } finally {
    avatarLoading.value = false
  }
}
```

**更新后代码：**

```javascript
// 获取待审核头像列表
const getAvatarAuditList = async () => {
  avatarLoading.value = true
  try {
    const res = await request.get('/admin/avatar-audit/list')
    console.log('头像审核列表响应:', res)
    if (res.code === 0) {
      // 后端返回的数据结构是 { list: [...], total: ... }
      // 需要将下划线命名转换为驼峰命名
      avatarTableData.value = (res.data.list || []).map(item => ({
        id: item.id,
        studentId: item.student_id,
        username: item.username,
        avatar: item.avatar,
        pendingAvatar: item.pending_avatar,
        avatarStatus: item.avatar_status,
        avatarAuditUserId: item.avatar_audit_user_id,
        avatarRejectReason: item.avatar_reject_reason
      }))
      console.log('处理后的avatarTableData:', avatarTableData.value)
    }
  } catch (error) {
    ElMessage.error('获取待审核头像列表失败')
  } finally {
    avatarLoading.value = false
  }
}
```

**修改内容：**
添加字段映射，将后端返回的下划线命名转换为前端使用的驼峰命名

**问题2：** 上传头像时，前端会先显示上传成功，且头像也变了，但数据库的变更是对的，刷新一下以后才会正确显示

**原因：** 上传成功后直接更新了 `userInfo.value.avatar`，但应该重新获取用户信息以获取最新的 `pendingAvatar` 和 `avatarStatus`

**更新位置：**
`frontend/src/views/user/Profile.vue` - `confirmAvatarUpload` 函数

**更新前代码：**

```javascript
// 确认上传头像
const confirmAvatarUpload = async () => {
  if (!selectedAvatarFile.value) return

  try {
    // 第一步：上传头像文件到服务器（使用专门的头像上传接口）
    const uploadRes = await uploadAvatar(selectedAvatarFile.value)
    if (uploadRes.code !== 0 || !uploadRes.data || !uploadRes.data.url) {
      ElMessage.error('头像上传失败')
      return
    }
    
    // 获取服务器返回的真实URL
    const avatarUrl = uploadRes.data.url
    
    // 第二步：调用更新头像接口，将URL写入数据库
    const res = await updateAvatar({ avatar: avatarUrl })
    if (res.code === 0) {
      userInfo.value.avatar = avatarUrl  // ❌ 错误：直接更新了avatar字段
      ElMessage.success('头像更新成功')
      avatarPreviewVisible.value = false
      // 清空文件选择
      if (avatarInput.value) {
        avatarInput.value.value = ''
      }
      // 清空选中的文件和预览URL
      selectedAvatarFile.value = null
      if (previewAvatarUrl.value) {
        URL.revokeObjectURL(previewAvatarUrl.value)
        previewAvatarUrl.value = ''
      }
    } else {
      ElMessage.error('头像更新失败：' + (res.msg || '未知错误'))
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像更新失败')
  }
}
```

**更新后代码：**

```javascript
// 确认上传头像
const confirmAvatarUpload = async () => {
  if (!selectedAvatarFile.value) return

  try {
    // 第一步：上传头像文件到服务器（使用专门的头像上传接口）
    const uploadRes = await uploadAvatar(selectedAvatarFile.value)
    if (uploadRes.code !== 0 || !uploadRes.data || !uploadRes.data.url) {
      ElMessage.error('头像上传失败')
      return
    }
    
    // 获取服务器返回的真实URL
    const avatarUrl = uploadRes.data.url
    
    // 第二步：调用更新头像接口，将URL写入数据库
    const res = await updateAvatar({ avatar: avatarUrl })
    if (res.code === 0) {
      ElMessage.success('头像上传成功，正在审核中')
      avatarPreviewVisible.value = false
      // 清空文件选择
      if (avatarInput.value) {
        avatarInput.value.value = ''
      }
      // 清空选中的文件和预览URL
      selectedAvatarFile.value = null
      if (previewAvatarUrl.value) {
        URL.revokeObjectURL(previewAvatarUrl.value)
        previewAvatarUrl.value = ''
      }
      // 重新获取用户信息，更新pendingAvatar和avatarStatus
      await fetchUserInfo()
    } else {
      ElMessage.error('头像更新失败：' + (res.msg || '未知错误'))
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像更新失败')
  }
}
```

**修改内容：**
1. 删除了直接更新 `userInfo.value.avatar` 的代码
2. 添加了 `await fetchUserInfo()` 重新获取用户信息
3. 修改提示信息为"头像上传成功，正在审核中"

**验证结果：**
- 头像审核界面正确显示审核状态（审核中/已通过/已驳回）
- 上传头像后立即显示正确的待审核头像和状态框，不需要刷新页面
- 提示信息更准确地反映了审核流程

**注意事项：**
- 刷新浏览器页面即可看到效果

---

### 2026-03-23 实现Dashboard统计功能和管理员退出登录

**需求：**
1. 让Dashboard.vue界面的几个统计功能能够起作用
2. 给管理员页面添加退出登录功能

**更新位置：**
- `backend/service/dashboard-service/index.js` - 新建仪表盘统计服务
- `backend/model/post.js` - 添加帖子统计相关方法
- `backend/model/user.js` - 添加用户统计相关方法
- `backend/api-gateway/routes/admin.js` - 添加仪表盘统计接口
- `frontend/src/api/admin.js` - 添加仪表盘统计API
- `frontend/src/layouts/AdminLayout.vue` - 添加仪表盘菜单和退出登录功能

**后端实现：**

1. **新建文件 `backend/service/dashboard-service/index.js`**：

```javascript
const PostModel = require('../../model/post')
const UserModel = require('../../model/user')
const logger = require('../../common/logger')

// 获取仪表盘统计数据
const getDashboardData = async () => {
  try {
    // 1. 待审核帖子数（AI审核中 + 待人工审核）
    const waitAuditResult = await PostModel.countByStatus([1, 2])
    const waitAuditCount = waitAuditResult.total

    // 2. 今日发帖数
    const todayPostResult = await PostModel.countTodayPosts()
    const todayPostCount = todayPostResult.total

    // 3. AI驳回数（状态为已驳回且audit_user_id为空，表示AI审核驳回）
    const aiRejectResult = await PostModel.countAiRejected()
    const aiRejectCount = aiRejectResult.total

    // 4. 活跃用户数（最近7天内有发帖或评论的用户）
    const activeUserResult = await UserModel.countActiveUsers()
    const activeUserCount = activeUserResult.total

    logger.info('获取仪表盘数据成功')

    return {
      waitAuditCount,
      todayPostCount,
      aiRejectCount,
      activeUserCount
    }
  } catch (err) {
    logger.error('获取仪表盘数据失败:', err)
    throw err
  }
}

module.exports = {
  getDashboardData
}
```

2. **backend/model/post.js** - 添加统计方法：

```javascript
// 统计指定状态的帖子数
static async countByStatus(statusList) {
  const placeholders = statusList.map(() => '?').join(',')
  const sql = `SELECT COUNT(*) as total FROM post WHERE status IN (${placeholders})`
  const rows = await mysql.execute(sql, statusList)
  return rows[0]
}

// 统计今日发帖数
static async countTodayPosts() {
  const sql = `
    SELECT COUNT(*) as total 
    FROM post 
    WHERE DATE(create_time) = CURDATE()
  `
  const rows = await mysql.execute(sql)
  return rows[0]
}

// 统计AI驳回的帖子数（状态为已驳回且audit_user_id为空）
static async countAiRejected() {
  const sql = `
    SELECT COUNT(*) as total 
    FROM post 
    WHERE status = 4 AND (audit_user_id IS NULL OR audit_user_id = 0)
  `
  const rows = await mysql.execute(sql)
  return rows[0]
}
```

3. **backend/model/user.js** - 添加统计方法：

```javascript
// 统计活跃用户数（最近7天内有发帖或评论的用户）
static async countActiveUsers() {
  const sql = `
    SELECT COUNT(DISTINCT u.id) as total
    FROM user u
    WHERE u.status = 1
    AND (
      EXISTS (
        SELECT 1 FROM post p 
        WHERE p.user_id = u.id 
        AND p.create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      )
      OR EXISTS (
        SELECT 1 FROM comment c 
        WHERE c.user_id = u.id 
        AND c.create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      )
    )
  `
  const rows = await mysql.execute(sql)
  return rows[0]
}
```

4. **backend/api-gateway/routes/admin.js** - 添加仪表盘统计接口：

```javascript
const dashboardService = require('../../service/dashboard-service');

// ============ 仪表盘统计接口 ============

// 获取仪表盘统计数据
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardData();
    res.json({ code: 0, data: stats });
  } catch (err) { next(err); }
});
```

**前端实现：**

1. **frontend/src/api/admin.js** - 添加仪表盘统计API：

```javascript
export default {
  // 获取仪表盘统计数据
  getDashboardData() {
    return request.get('/admin/dashboard/stats')
  },

  // 获取用户列表
  getUserList(params) {
    return request.get('/admin/user/list', { params })
  },
  // ... 其他接口
}
```

2. **frontend/src/layouts/AdminLayout.vue** - 添加仪表盘菜单和退出登录功能：

```vue
<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside width="200px">
      <el-menu :default-active="$route.path" router>
        <el-menu-item index="/admin/dashboard">仪表盘</el-menu-item>
        <el-menu-item index="/admin/audit">人工审核</el-menu-item>
        <el-menu-item index="/admin/log">审核日志</el-menu-item>
        <el-menu-item index="/admin/user">用户管理</el-menu-item>
        <el-menu-item index="/admin/roster">学生花名册</el-menu-item>
        <el-menu-item index="/admin/post">帖子管理</el-menu-item>
        <el-menu-item index="/admin/comment">评论管理</el-menu-item>
        <el-menu-item index="/admin/config">系统配置</el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主体内容 -->
    <el-container>
      <el-header>
        <span class="header-title">校园墙管理后台</span>
        <el-button type="primary" size="small" @click="handleLogout">退出登录</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import auth from '@/utils/auth'

const router = useRouter()

// 权限校验
if (!auth.hasPermission(['admin', 'super_admin'])) {
  router.push('/login')
}

// 退出登录
const handleLogout = () => {
  auth.removeToken()
  ElMessage.success('退出登录成功')
  router.push('/login')
}
</script>

<style scoped>
.admin-layout { height: 100vh; display: flex; }
.el-aside { background-color: #f5f5f5; }
.el-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  font-size: 12px; 
  line-height: 60px; 
  border-bottom: 1px solid #eee; 
  padding: 0 20px;
}
.header-title { font-size: 16px; font-weight: bold; }
.el-main { padding: 20px; }
</style>
```

**修改内容：**
1. 新建仪表盘统计服务，实现4个统计功能
2. 在PostModel中添加统计帖子相关的方法
3. 在UserModel中添加统计活跃用户的方法
4. 在admin路由中添加仪表盘统计接口
5. 在前端admin API中添加仪表盘统计API调用
6. 在AdminLayout中添加仪表盘菜单项
7. 在AdminLayout中添加退出登录按钮和功能
8. 优化AdminLayout的header样式，使用flex布局

**统计功能说明：**
1. **待审核帖子数**：统计状态为AI审核中（1）和待人工审核（2）的帖子总数
2. **今日发帖数**：统计今天（CURDATE()）创建的帖子数
3. **AI驳回数**：统计状态为已驳回（4）且audit_user_id为空或0的帖子数
4. **活跃用户数**：统计最近7天内有发帖或评论的正常用户数

**验证结果：**
- Dashboard页面正确显示4个统计卡片
- 统计数据实时更新
- 侧边栏新增"仪表盘"菜单项
- 右上角新增"退出登录"按钮
- 点击退出登录后成功跳转到登录页

**注意事项：**
- 刷新浏览器页面即可看到效果
- 建议重启后端服务以使修改生效

---

### 2026-03-23 修复schema.sql中缺失的字段和表定义

**问题：** schema.sql 中缺少必要的字段定义，且存在表定义被注释但仍有插入语句的问题

**更新位置：**
`backend/dao/mysql/schema.sql`

**修改内容：**

1. **在 user 表中添加 pending_avatar 字段**：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `student_id` VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `avatar` VARCHAR(255) DEFAULT '' COMMENT '头像URL',
  `pending_avatar` VARCHAR(255) DEFAULT '' COMMENT '待审核的头像URL',
  `avatar_status` TINYINT DEFAULT 0 COMMENT '头像状态：0-未上传，1-审核中，2-已通过，3-已驳回',
  `avatar_audit_user_id` INT DEFAULT NULL COMMENT '头像审核人ID',
  `avatar_reject_reason` VARCHAR(255) DEFAULT '' COMMENT '头像驳回原因',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-封禁，1-正常',
  `role` TINYINT DEFAULT 0 COMMENT '角色：0-普通用户，1-管理员',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_avatar_status` (`avatar_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

2. **取消注释 system_config 表定义**：

```sql
-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(50) NOT NULL UNIQUE COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值',
  `config_type` VARCHAR(20) DEFAULT 'string' COMMENT '配置类型：string-字符串，number-数字，boolean-布尔，json-JSON对象',
  `description` VARCHAR(200) DEFAULT '' COMMENT '配置说明',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 初始化系统配置数据
INSERT INTO `system_config` (`config_key`, `config_value`, `config_type`, `description`) VALUES
('ai_audit_level', 'medium', 'string', 'AI审核严格度：low-宽松，medium-中等，high-严格'),
('ai_check_image', 'true', 'boolean', '是否开启图片审核'),
('ai_timeout_to_manual', 'true', 'boolean', 'AI审核超时是否自动转人工'),
('ai_timeout', '3000', 'number', 'AI审核超时时间（毫秒）');
```

**问题原因：**
1. **缺少 pending_avatar 字段**：在头像审核流程重构时，我们在代码中使用了 `pending_avatar` 字段来存储待审核的头像，但 schema.sql 中没有定义这个字段
2. **system_config 表被注释**：之前可能因为某些原因注释掉了 system_config 表的定义，但后面的 INSERT 语句仍然存在，导致执行 SQL 时会报错

**修改说明：**
1. 在 user 表的 `avatar` 字段后添加了 `pending_avatar` 字段，用于存储待审核的头像URL
2. 取消注释 system_config 表的定义，使其能够正常创建并初始化配置数据

**验证结果：**
- schema.sql 现在包含了所有必要的字段定义
- 执行 schema.sql 不会因为表不存在而报错
- system_config 表能够正常创建并初始化配置数据

**注意事项：**
- 如果数据库已经存在，需要手动执行迁移脚本添加 pending_avatar 字段
- 迁移脚本路径：`backend/dao/mysql/migration_add_pending_avatar.sql`

---

### 2026-03-23 创建清空数据库和上传图片的危险脚本

**需求：** 创建一个脚本清空所有上传的图片和已有的数据库，并在启动前加三次同意验证

**更新位置：**
`scripts/clear-all-data.ps1` - 新建清空数据和图片的PowerShell脚本

**脚本功能：**

1. **三次确认验证机制**：
   - 第一次确认：提示用户输入 'YES' 确认执行
   - 第二次确认：再次提示用户输入 'YES' 确认执行
   - 第三次确认：最后提示用户输入 'YES' 确认执行
   - 任何一次输入非 'YES' 都会取消操作

2. **清空数据库**：
   - 清空所有业务表（audit_log, comment, like, notification, post, view_history, student_roster, sensitive_word, system_config）
   - 重置用户表（保留管理员账号，清空普通用户的头像和审核信息）
   - 重新初始化系统配置数据

3. **删除上传的图片文件**：
   - 删除 uploads 目录下的所有文件和子目录
   - 包括 avatars 和其他上传目录

4. **验证清理结果**：
   - 检查 uploads 目录是否已清空
   - 显示剩余文件数量（如果有）

**脚本内容：**

```powershell
# ============================================================================
# 危险操作：清空数据库和上传的图片
# ============================================================================
# 警告：此脚本将删除所有数据库数据和上传的图片文件
# 执行前请确保已备份重要数据！
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Red
Write-Host "  警告：危险操作 - 清空数据库和上传的图片" -ForegroundColor Red
Write-Host "============================================================================" -ForegroundColor Red
Write-Host ""
Write-Host "此脚本将执行以下操作：" -ForegroundColor Yellow
Write-Host "  1. 清空所有数据库表（删除所有数据）" -ForegroundColor Yellow
Write-Host "  2. 删除 uploads 目录下的所有图片文件" -ForegroundColor Yellow
Write-Host ""
Write-Host "警告：此操作不可逆！请确保已备份重要数据！" -ForegroundColor Red
Write-Host ""

# 第一次确认
$confirm1 = Read-Host "请输入 'YES' 确认执行此危险操作 (输入其他任何内容将取消): "
if ($confirm1 -ne "YES") {
    Write-Host "操作已取消" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "第二次确认..." -ForegroundColor Yellow
Write-Host "您确定要清空所有数据库数据和上传的图片吗？" -ForegroundColor Red
Write-Host ""

# 第二次确认
$confirm2 = Read-Host "请再次输入 'YES' 确认执行此危险操作 (输入其他任何内容将取消): "
if ($confirm2 -ne "YES") {
    Write-Host "操作已取消" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "最后一次确认..." -ForegroundColor Yellow
Write-Host "此操作将永久删除所有数据，无法恢复！" -ForegroundColor Red
Write-Host ""

# 第三次确认
$confirm3 = Read-Host "请最后输入 'YES' 确认执行此危险操作 (输入其他任何内容将取消): "
if ($confirm3 -ne "YES") {
    Write-Host "操作已取消" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  开始执行清空操作..." -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""

# 获取项目根目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# 数据库配置（请根据实际情况修改）
$dbHost = "localhost"
$dbPort = 3306
$dbName = "campus_wall"
$dbUser = "root"
$dbPassword = Read-Host "请输入数据库密码: "

# 上传文件目录
$uploadsDir = Join-Path $projectRoot "uploads"

try {
    # 步骤1：清空数据库
    Write-Host "[1/3] 清空数据库..." -ForegroundColor Cyan
    
    # 数据库清空SQL语句
    $clearSql = @"
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `audit_log`;
TRUNCATE TABLE `comment`;
TRUNCATE TABLE `like`;
TRUNCATE TABLE `notification`;
TRUNCATE TABLE `post`;
TRUNCATE TABLE `view_history`;
TRUNCATE TABLE `student_roster`;
TRUNCATE TABLE `sensitive_word`;
TRUNCATE TABLE `system_config`;

-- 重置用户表（保留管理员账号）
UPDATE `user` SET 
    `avatar` = '',
    `pending_avatar` = '',
    `avatar_status` = 0,
    `avatar_audit_user_id` = NULL,
    `avatar_reject_reason` = ''
WHERE `role` = 0;

-- 重新初始化系统配置
INSERT INTO `system_config` (`config_key`, `config_value`, `config_type`, `description`) VALUES
('ai_audit_level', 'medium', 'string', 'AI审核严格度：low-宽松，medium-中等，high-严格'),
('ai_check_image', 'true', 'boolean', '是否开启图片审核'),
('ai_timeout_to_manual', 'true', 'boolean', 'AI审核超时是否自动转人工'),
('ai_timeout', '3000', 'number', 'AI审核超时时间（毫秒）');

SET FOREIGN_KEY_CHECKS = 1;
"@

    # 执行SQL
    $mysqlCommand = "mysql -h $dbHost -P $dbPort -u $dbUser -p$dbPassword $dbName"
    $clearSql | & $mysqlCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 数据库清空完成" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 数据库清空失败，退出码: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    
    # 步骤2：删除上传的图片文件
    Write-Host "[2/3] 删除上传的图片文件..." -ForegroundColor Cyan
    
    if (Test-Path $uploadsDir) {
        # 删除uploads目录下的所有文件
        Get-ChildItem -Path $uploadsDir -Recurse -File | Remove-Item -Force
        
        Write-Host "  ✓ 图片文件删除完成" -ForegroundColor Green
    } else {
        Write-Host "  ! uploads 目录不存在，跳过" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # 步骤3：验证清理结果
    Write-Host "[3/3] 验证清理结果..." -ForegroundColor Cyan
    
    # 检查uploads目录
    $remainingFiles = Get-ChildItem -Path $uploadsDir -Recurse -File -ErrorAction SilentlyContinue
    if ($remainingFiles.Count -eq 0) {
        Write-Host "  ✓ uploads 目录已清空" -ForegroundColor Green
    } else {
        Write-Host "  ! uploads 目录仍有 $($remainingFiles.Count) 个文件" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host "  清空操作完成！" -ForegroundColor Green
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "提示：请重启后端服务以使更改生效" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host "  错误：执行过程中发生异常" -ForegroundColor Red
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
```

**使用方法：**

1. 打开 PowerShell 终端
2. 进入项目根目录
3. 执行脚本：
   ```powershell
   .\scripts\clear-all-data.ps1
   ```
4. 按照提示输入三次 'YES' 确认执行

**数据库配置：**

脚本默认配置如下，请根据实际情况修改：
- 数据库主机：localhost
- 数据库端口：3306
- 数据库名称：campus_wall
- 数据库用户：root
- 数据库密码：执行时输入

**注意事项：**
- 此脚本会永久删除所有数据，无法恢复
- 执行前请务必备份重要数据
- 用户表中的管理员账号（role=1）会被保留，但头像和审核信息会被清空
- 执行完成后需要重启后端服务

**安全特性：**
- 三次确认验证机制，防止误操作
- 任何一次输入非 'YES' 都会取消操作
- 清晰的警告提示和操作说明
- 异常处理和错误提示

---
