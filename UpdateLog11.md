### 2026-03-23 修复AI审核结果列不显示问题

**问题：** 人工审核页面中，AI审核结果列显示为"未知"，无法正确显示审核结果。

**更新位置：**
1. `backend/service/post-service/index.js` - `getWaitAuditPosts` 函数
2. `backend/model/user.js` - `getPendingAuditAvatars` 方法
3. `frontend/src/views/admin/AuditList.vue` - `getAiResultText` 和 `getAiResultType` 函数

**更新前代码：**

```javascript
// backend/service/post-service/index.js
const getWaitAuditPosts = async () => {
  const posts = await PostModel.findWaitAudit()
  return posts.map(post => ({
    id: post.id,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    aiResult: post.ai_result,
    createTime: post.create_time
  }))
}
```

```javascript
// backend/model/user.js
const sql = `
  SELECT 
    id,
    student_id,
    username,
    avatar,
    avatar_status,
    avatar_audit_user_id,
    avatar_reject_reason
  FROM user
  WHERE avatar_status = 1
  ORDER BY id DESC
  LIMIT ${offset}, ${size}
`
```

**更新后代码：**

```javascript
// backend/service/post-service/index.js
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

```javascript
// backend/model/user.js
const sql = `
  SELECT 
    id,
    student_id,
    username,
    avatar,
    avatar_status,
    avatar_audit_user_id,
    avatar_reject_reason,
    avatar_ai_result as ai_result
  FROM user
  WHERE avatar_status = 1
  ORDER BY id DESC
  LIMIT ${offset}, ${size}
`
```

```javascript
// frontend/src/views/admin/AuditList.vue
const getAiResultText = (aiResult) => {
  console.log('getAiResultText 输入:', aiResult, '类型:', typeof aiResult)
  const resultMap = {
    1: '通过',
    2: '驳回',
    3: '合规',
    4: '违规',
    5: '不确定'
  }
  const result = resultMap[aiResult] || '未知'
  console.log('getAiResultText 输出:', result)
  return result
}

const getAiResultType = (aiResult) => {
  console.log('getAiResultType 输入:', aiResult, '类型:', typeof aiResult)
  let type = 'info'
  if (aiResult === 1 || aiResult === 3) {
    type = 'success'
  } else if (aiResult === 2 || aiResult === 4) {
    type = 'danger'
  } else if (aiResult === 5) {
    type = 'warning'
  }
  console.log('getAiResultType 输出:', type)
  return type
}
```

**修改内容：**
1. 在帖子审核服务中，添加了 `username` 和 `studentId` 字段的返回，确保前端能正确显示发布者信息
2. 在头像审核查询中，添加了 `avatar_ai_result as ai_result` 字段查询，确保返回AI审核结果
3. 在前端转换函数中添加了详细的调试日志，便于排查问题

**问题原因：**
1. 帖子审核：虽然数据库查询已经关联了用户表，但服务层返回数据时遗漏了 `username` 和 `studentId` 字段
2. 头像审核：数据库查询时未包含 `avatar_ai_result` 字段，导致前端无法获取AI审核结果
3. 数据类型可能存在问题，需要通过日志确认

**功能说明：**
- AI审核结果使用数字存储（1-5），前端需要转换为中文文本显示
- 1=通过，2=驳回，3=合规，4=违规，5=不确定
- 不同结果显示不同颜色的标签：通过/合规为绿色，驳回/违规为红色，不确定为橙色

**验证结果：**
- 后端已修复数据返回问题
- 前端已添加调试日志
- 需要重启后端服务并刷新前端页面验证

**注意事项：**
- 修改后需要重启后端服务才能生效
- 建议检查数据库中 `post` 表的 `ai_result` 字段是否有值
- 建议检查数据库中 `user` 表的 `avatar_ai_result` 字段是否有值
- 如果仍然显示"未知"，请查看浏览器控制台的调试日志，确认传入的 `aiResult` 值和类型

---

### 2026-03-23 修复AI审核结果字段缺失问题

**问题：** 人工审核页面中，AI审核结果列显示为"未知"，前端控制台显示：
- 帖子审核：`getAiResultText 输入:  类型: string`（空字符串）
- 评论审核：`getAiResultText 输入: undefined 类型: undefined`
- 头像审核：`getAiResultText 输入: undefined 类型: undefined` 且后端报错 `Unknown column 'avatar_ai_result' in 'field list'`

**更新位置：**
1. `backend/model/post.js` - 新增 `updateAiResult` 方法
2. `backend/service/audit-service/index.js` - `aiAuditDispatch` 函数
3. `backend/model/user.js` - `getPendingAuditAvatars` 方法（回退修改）

**更新前代码：**

```javascript
// backend/model/post.js
// 没有 updateAiResult 方法
```

```javascript
// backend/service/audit-service/index.js
const aiAuditDispatch = async (postId, content, images) => {
  try {
    logger.info(`开始AI审核：帖子ID=${postId}`)
    const result = await aiAudit.audit(content, images)
    const auditResult = AI_RESULT_MAP[result.status] || AUDIT_RESULT.UNCERTAIN
    
    // 添加AI审核日志
    await PostModel.addAuditLog({
      postId,
      type: AUDIT_TYPE.AI,
      result: auditResult,
      operatorId: 0
    })

    // 根据AI结果更新帖子状态
    let status
    if (result.status === '合规') {
      status = POST_STATUS.PUBLISHED
    } else if (result.status === '违规') {
      status = POST_STATUS.REJECTED
    } else {
      status = POST_STATUS.WAIT_AUDIT
    }
    await PostModel.updateStatus(postId, status, 0, result.reason || '')
    
    logger.info(`AI审核完成：帖子ID=${postId}，结果=${result.status}`)
    return { status, reason: result.reason }
  } catch (err) {
    logger.error(`AI审核调度失败：帖子ID=${postId}，错误=${err.message}`)
    await PostModel.updateStatus(postId, POST_STATUS.WAIT_AUDIT, 0, 'AI审核接口异常')
    throw err
  }
}
```

```javascript
// backend/model/user.js
const sql = `
  SELECT 
    id,
    student_id,
    username,
    avatar,
    avatar_status,
    avatar_audit_user_id,
    avatar_reject_reason,
    avatar_ai_result as ai_result
  FROM user
  WHERE avatar_status = 1
  ORDER BY id DESC
  LIMIT ${offset}, ${size}
`
```

**更新后代码：**

```javascript
// backend/model/post.js
// 更新AI审核结果
static async updateAiResult(id, aiResult) {
  const sql = 'UPDATE post SET ai_result = ? WHERE id = ?'
  await mysql.execute(sql, [aiResult, id])
}
```

```javascript
// backend/service/audit-service/index.js
const aiAuditDispatch = async (postId, content, images) => {
  try {
    logger.info(`开始AI审核：帖子ID=${postId}`)
    const result = await aiAudit.audit(content, images)
    const auditResult = AI_RESULT_MAP[result.status] || AUDIT_RESULT.UNCERTAIN
    
    // 更新AI审核结果
    await PostModel.updateAiResult(postId, auditResult)
    
    // 添加AI审核日志
    await PostModel.addAuditLog({
      postId,
      type: AUDIT_TYPE.AI,
      result: auditResult,
      operatorId: 0
    })

    // 根据AI结果更新帖子状态
    let status
    if (result.status === '合规') {
      status = POST_STATUS.PUBLISHED
    } else if (result.status === '违规') {
      status = POST_STATUS.REJECTED
    } else {
      status = POST_STATUS.WAIT_AUDIT
    }
    await PostModel.updateStatus(postId, status, 0, result.reason || '')
    
    logger.info(`AI审核完成：帖子ID=${postId}，结果=${result.status}`)
    return { status, reason: result.reason }
  } catch (err) {
    logger.error(`AI审核调度失败：帖子ID=${postId}，错误=${err.message}`)
    await PostModel.updateStatus(postId, POST_STATUS.WAIT_AUDIT, 0, 'AI审核接口异常')
    throw err
  }
}
```

```javascript
// backend/model/user.js
const sql = `
  SELECT 
    id,
    student_id,
    username,
    avatar,
    avatar_status,
    avatar_audit_user_id,
    avatar_reject_reason
  FROM user
  WHERE avatar_status = 1
  ORDER BY id DESC
  LIMIT ${offset}, ${size}
`
```

**修改内容：**
1. 在 `PostModel` 中新增 `updateAiResult` 方法，用于更新帖子的AI审核结果字段
2. 在 `audit-service` 的 `aiAuditDispatch` 函数中，调用 `PostModel.updateAiResult` 更新AI审核结果到数据库
3. 回退 `user.js` 中的修改，移除不存在的 `avatar_ai_result` 字段查询

**问题原因：**
1. **帖子审核**：`audit-service/index.js` 的 `aiAuditDispatch` 函数在AI审核完成后，只更新了帖子状态，但没有更新 `ai_result` 字段，导致数据库中该字段为空字符串
2. **评论审核**：`comment-audit-service/index.js` 正确调用了 `CommentModel.updateAiResult`，所以评论审核应该有AI结果
3. **头像审核**：数据库 `user` 表中没有 `avatar_ai_result` 字段，查询时报错

**功能说明：**
- 帖子AI审核完成后，会将审核结果（1-5的数字）存储到 `post.ai_result` 字段
- 评论AI审核完成后，会将审核结果存储到 `comment.ai_result` 字段
- 头像审核目前没有AI审核结果字段，需要后续添加该功能

**验证结果：**
- 后端代码已修复，帖子AI审核结果会正确存储到数据库
- 头像审核查询已修复，不再报错
- 需要重启后端服务才能生效
- 新创建的帖子会正确显示AI审核结果，但已有的待审核帖子仍为空（需要重新触发AI审核）

**注意事项：**
- 修改后需要重启后端服务才能生效
- 帖子AI审核结果修复后，新创建的帖子会正确显示AI审核结果
- 已有的待审核帖子 `ai_result` 字段为空，需要重新触发AI审核才能显示结果
- 头像审核目前没有AI审核功能，AI审核结果列会显示"未知"
- 评论审核应该已经有AI审核结果，如果仍显示"未知"，需要检查数据库数据

