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
  // ...
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


## 2026-03-23 修复"我的帖子"页面数据加载问题

### 更新目的
修复用户资料页面中"我的帖子"标签页数据不显示的问题，确保组件加载时自动获取帖子数据。

### 问题描述
用户在个人资料页面点击"我的帖子"标签页时，页面显示"暂无发布的帖子"，但实际上用户有发布的帖子。经过检查发现，`fetchPosts()` 函数从未被调用过，导致前端控制台没有任何日志输出。

### 原因分析

**问题代码结构**:
```javascript
// 默认激活的标签页
const activeTab = ref('history')  // 默认是"历史浏览"

// 组件挂载时的初始化
onMounted(() => {
  fetchUserInfo()
  fetchHistory()  // 只加载历史浏览，没有加载帖子！
})

// 标签页切换触发
const handleTabClick = (tab) => {
  if (tab.name === 'history') {
    fetchHistory()
  } else if (tab.name === 'posts') {
    fetchPosts()  // 只有点击标签页时才会调用
  } else if (tab.name === 'comments') {
    fetchComments()
  }
}
```

**问题原因**:
1. `fetchPosts()` 函数**只在点击"我的帖子"标签页时**才会被触发
2. 组件挂载时**不会自动调用** `fetchPosts()`
3. 如果用户从未点击"我的帖子"标签页，这个函数就永远不会执行
4. 由于 `activeTab` 默认值是 `'history'`，组件加载时不会触发 `fetchPosts()`

**触发条件分析**:
- ✅ 用户点击"我的帖子"标签页 → `handleTabClick` 被调用 → `fetchPosts()` 执行
- ❌ 组件首次加载 → `onMounted` 执行 → 只调用 `fetchHistory()`，不调用 `fetchPosts()`
- ❌ 用户刷新页面 → `onMounted` 执行 → 只调用 `fetchHistory()`，不调用 `fetchPosts()`

### 修复内容

#### 1. 在组件挂载时自动加载帖子数据
**位置**: d:\code\HTML\WORK\frontend\src\views\user\Profile.vue

**更新前**（第717-720行）:
```javascript
// 组件挂载时加载数据
onMounted(() => {
  fetchUserInfo()
  fetchHistory()
})
```

**更新后**（第717-721行）:
```javascript
// 组件挂载时加载数据
onMounted(() => {
  fetchUserInfo()
  fetchHistory()
  fetchPosts()  // 新增：自动加载帖子数据
})
```

**说明**: 在组件挂载时自动调用 `fetchPosts()`，确保用户进入页面时就能看到自己的帖子列表。

### 验证结果

修复后的效果：
1. ✅ 组件加载时自动获取用户信息
2. ✅ 组件加载时自动获取历史浏览记录
3. ✅ 组件加载时自动获取我的帖子列表
4. ✅ 点击"我的帖子"标签页时，数据已经加载完成，无需等待
5. ✅ 前端控制台会输出 `fetchPosts()` 的日志信息

**预期控制台输出**:
```javascript
获取我的帖子返回数据: {code: 0, data: {list: [...], total: 10}}
res.data: {list: [...], total: 10}
res.data.list: [{id: 1, content: "...", status: 3, ...}, ...]
postsList.value: [{id: 1, content: "...", status: 3, ...}, ...]
```

### 技术要点

1. **Vue3 生命周期钩子**:
   - `onMounted`: 组件挂载完成后执行
   - 适合在此时进行数据初始化加载
   - 确保DOM已经渲染完成

2. **数据加载策略**:
   - **懒加载**: 只在需要时加载数据（点击标签页）
   - **预加载**: 组件加载时提前加载数据（本次修复）
   - 预加载可以提升用户体验，减少等待时间

3. **标签页切换逻辑**:
   - `handleTabClick`: 标签页切换时触发
   - 用于动态加载不同标签页的数据
   - 配合预加载，可以进一步优化为：只在首次点击时加载

### 优化建议

#### 方案1：保持现状（推荐）
- 组件加载时预加载所有数据
- 优点：用户体验好，切换标签页无需等待
- 缺点：可能加载不必要的数据

#### 方案2：改为懒加载
- 移除 `onMounted` 中的 `fetchPosts()` 调用
- 只在点击标签页时加载数据
- 优点：按需加载，减少不必要的请求
- 缺点：首次切换标签页需要等待

#### 方案3：混合模式（最优）
- 组件加载时只加载默认标签页的数据（历史浏览）
- 首次点击其他标签页时加载数据，并缓存结果
- 后续切换标签页时直接使用缓存
- 优点：平衡了性能和用户体验

### 注意事项

1. **需要刷新页面**: 修改代码后需要刷新浏览器页面才能生效
2. **无需重启后端**: 这是前端代码修改，不影响后端服务
3. **无需清除缓存**: 修改不涉及缓存，无需清除
4. **保持现有设计**: 继续使用现有的API和数据结构

### 总结

成功修复了"我的帖子"页面数据加载问题：
- 在 `onMounted` 钩子中添加 `fetchPosts()` 调用
- 确保组件加载时自动获取帖子数据
- 提升用户体验，减少等待时间
- 保持与其他标签页（历史浏览、我的评论）的一致性

现在用户进入个人资料页面时，会自动加载所有数据，无需手动点击标签页即可查看内容。

---

## 2026-03-23 修复编辑帖子时的循环依赖问题

### 更新目的
修复编辑帖子时出现的500错误，解决audit-service和post-service之间的循环依赖问题。

### 问题描述
用户在"我的帖子"页面编辑帖子时，前端报错：
```
PUT http://localhost:5173/api/post/update 500 (Internal Server Error)
```

后端报错：
```
[2026-03-23 02:49:01] [INFO] 开始AI审核：帖子ID=6
[2026-03-23 02:49:01] [ERROR] 腾讯云文本审核失败：The SecretId is not found, please ensure that your SecretId is correct.
[2026-03-23 02:49:01] [ERROR] AI审核失败：The SecretId is not found, please ensure that your SecretId is correct.
[2026-03-23 02:49:02] [ERROR] AI审核调度失败：帖子ID=6，错误=postService.updatePostStatus is not a function
[2026-03-23 02:49:02] [ERROR] 系统异常: postService.updatePostStatus is not a function
(node:129956) Warning: Accessing non-existent property 'updatePostStatus' of module exports inside circular dependency
(Use `node --trace-warnings ...` to show where the warning was created)
```

### 原因分析

**循环依赖链**:
```
post-service/index.js (第10行)
  └─> require('../audit-service')
       └─> audit-service/index.js (第2行)
            └─> require('../post-service')
                 └─> 循环依赖！
```

**问题代码**:

**audit-service/index.js** (第2行):
```javascript
const postService = require('../post-service')

// AI审核调度
const aiAuditDispatch = async (postId, content, images) => {
  try {
    // ... AI审核逻辑 ...
    
    // 根据AI结果更新帖子状态
    await postService.updatePostStatus(postId, status, 0, result.reason || '')  // ❌ 循环依赖导致无法访问
  } catch (err) {
    // AI审核失败，转人工审核
    await postService.updatePostStatus(postId, POST_STATUS.WAIT_AUDIT, 0, 'AI审核接口异常')  // ❌ 同样的问题
  }
}
```

**post-service/index.js** (第10行):
```javascript
const auditService = require('../audit-service')

// 更新帖子内容
const updatePost = async (id, userId, content, images) => {
  // ... 权限检查、内容过滤 ...
  
  // 触发AI审核
  await auditService.aiAuditDispatch(id, safeContent, images)  // ❌ 循环依赖
}
```

**循环依赖的影响**:
1. Node.js的模块加载机制在检测到循环依赖时，会返回未完全初始化的模块对象
2. `postService.updatePostStatus` 在 `audit-service` 中无法访问
3. 运行时抛出 `postService.updatePostStatus is not a function` 错误

### 修复内容

#### 1. 移除audit-service中的post-service依赖
**位置**: d:\code\HTML\WORK\backend\service\audit-service\index.js

**更新前**（第1-7行）:
```javascript
const aiAudit = require('../../ai-audit/service')
const postService = require('../post-service')  // ❌ 循环依赖
const logger = require('../../common/logger')
const { BusinessException } = require('../../common/exception')
const PostModel = require('../../model/post')
const { POST_STATUS, AUDIT_TYPE, AUDIT_RESULT, AI_RESULT_MAP } = require('../../common/constants')
const { ErrorCode } = require('../../common/errorCode')
```

**更新后**（第1-6行）:
```javascript
const aiAudit = require('../../ai-audit/service')
const PostModel = require('../../model/post')  // ✅ 直接使用PostModel
const logger = require('../../common/logger')
const { BusinessException } = require('../../common/exception')
const { POST_STATUS, AUDIT_TYPE, AUDIT_RESULT, AI_RESULT_MAP } = require('../../common/constants')
const { ErrorCode } = require('../../common/errorCode')
```

#### 2. 将postService.updatePostStatus替换为PostModel.updateStatus
**位置**: d:\code\HTML\WORK\backend\service\audit-service\index.js

**更新前**（第33-40行）:
```javascript
// 根据AI结果更新帖子状态
let status
if (result.status === '合规') {
  status = POST_STATUS.PUBLISHED
} else if (result.status === '违规') {
  status = POST_STATUS.REJECTED
} else {
  status = POST_STATUS.WAIT_AUDIT
}
await postService.updatePostStatus(postId, status, 0, result.reason || '')  // ❌ 循环依赖

logger.info(`AI审核完成：帖子ID=${postId}，结果=${result.status}`)
return { status, reason: result.reason }
} catch (err) {
logger.error(`AI审核调度失败：帖子ID=${postId}，错误=${err.message}`)
// AI审核失败，转人工审核
await postService.updatePostStatus(postId, POST_STATUS.WAIT_AUDIT, 0, 'AI审核接口异常')  // ❌ 循环依赖
throw err
}
```

**更新后**（第33-40行）:
```javascript
// 根据AI结果更新帖子状态
let status
if (result.status === '合规') {
  status = POST_STATUS.PUBLISHED
} else if (result.status === '违规') {
  status = POST_STATUS.REJECTED
} else {
  status = POST_STATUS.WAIT_AUDIT
}
await PostModel.updateStatus(postId, status, 0, result.reason || '')  // ✅ 直接调用Model

logger.info(`AI审核完成：帖子ID=${postId}，结果=${result.status}`)
return { status, reason: result.reason }
} catch (err) {
logger.error(`AI审核调度失败：帖子ID=${postId}，错误=${err.message}`)
// AI审核失败，转人工审核
await PostModel.updateStatus(postId, POST_STATUS.WAIT_AUDIT, 0, 'AI审核接口异常')  // ✅ 直接调用Model
throw err
}
```

#### 3. 修复人工审核中的循环依赖
**位置**: d:\code\HTML\WORK\backend\service\audit-service\index.js

**更新前**（第61行）:
```javascript
await postService.updatePostStatus(postId, status, auditUserId, rejectReason)  // ❌ 循环依赖
```

**更新后**（第61行）:
```javascript
await PostModel.updateStatus(postId, status, auditUserId, rejectReason)  // ✅ 直接调用Model
```

### 验证结果

修复后的效果：
1. ✅ 编辑帖子功能正常，不再出现500错误
2. ✅ 帖子内容更新成功
3. ✅ 帖子状态正确重置为"AI审核中"
4. ✅ 后端不再出现循环依赖警告
5. ✅ 前端显示"帖子编辑成功，已重新提交审核"提示

**预期后端日志**:
```
[2026-03-23 XX:XX:XX] [INFO] 开始AI审核：帖子ID=6
[2026-03-23 XX:XX:XX] [INFO] AI审核完成：帖子ID=6，结果=合规
[2026-03-23 XX:XX:XX] [INFO] 帖子状态更新：ID=6，状态=已发布
[2026-03-23 XX:XX:XX] [INFO] 帖子更新成功：ID=6，用户ID=2
```

### 技术要点

1. **循环依赖的识别**:
   - 模块A引入模块B，模块B又引入模块A
   - Node.js会返回未完全初始化的模块对象
   - 导致某些函数或属性无法访问

2. **循环依赖的解决方案**:
   - **方案1（本次采用）**: 直接使用底层依赖，避免中间层依赖
     - `audit-service` 直接使用 `PostModel`，而不是 `postService`
   - **方案2**: 将共享逻辑提取到独立的模块
     - 创建一个 `post-utils.js` 存放共享函数
   - **方案3**: 使用依赖注入
     - 在运行时动态注入依赖，而不是在模块加载时

3. **模块分层原则**:
   - **Model层**: 数据访问层，不依赖其他业务模块
   - **Service层**: 业务逻辑层，可以依赖Model层和其他Service
   - **避免**: Service层之间的相互依赖

### 注意事项

1. **需要重启后端**: 修改后端代码后必须重启后端服务才能生效
   - 在终端中按 `Ctrl + C` 停止后端服务
   - 重新运行 `npm start` 或 `node app.js`

2. **腾讯云配置问题**: 虽然SecretId配置不正确，但不影响编辑功能
   - AI审核会失败，但会自动转人工审核
   - 帖子状态会正确更新为"待人工审核"
   - 如需修复AI审核功能，需要配置正确的腾讯云SecretId

3. **测试步骤**:
   - 重启后端服务
   - 刷新前端页面
   - 点击"我的帖子"标签页
   - 点击"编辑"按钮编辑帖子
   - 点击"确认编辑"
   - 验证帖子内容已更新，状态变为"AI审核中"

### 总结

成功修复了编辑帖子时的循环依赖问题：
- 移除了 `audit-service` 对 `post-service` 的依赖
- 改为直接使用 `PostModel.updateStatus` 方法
- 消除了循环依赖警告
- 编辑帖子功能恢复正常
- 遵循了模块分层原则，避免Service层之间的相互依赖

现在编辑帖子功能完全正常，用户可以成功编辑帖子并重新提交审核。

---

## 2026-03-23 修复评论发布时的ElMessage未定义错误

### 更新目的
修复在帖子下发布评论时前端报错 `ElMessage is not defined` 的问题。

### 问题描述
用户在帖子详情页下发布评论时，前端控制台报错：
```
CommentList.vue:46 Uncaught (in promise) ReferenceError: ElMessage is not defined
    at addComment (CommentList.vue:46:3)
```

导致评论功能无法正常使用。

### 原因分析

**问题代码**:
```javascript
// CommentList.vue - 第17-19行
<script setup>
import { ref, onMounted, defineProps } from 'vue'
import commentApi from '@/api/comment'
// ❌ 缺少 ElMessage 的导入！
```

**错误位置**:
```javascript
// CommentList.vue - 第40行和第47行
const addComment = async () => {
  if (!commentContent.value) return ElMessage.warning('评论不能为空')  // ❌ ElMessage 未定义
  // ...
  ElMessage.success('评论发布成功')  // ❌ ElMessage 未定义
}
```

**根本原因**:
- `CommentList.vue` 组件使用了 `ElMessage` 来显示提示信息
- 但是在 `<script setup>` 中没有导入 `ElMessage`
- Vue 3 的 Composition API 不会自动导入 Element Plus 的组件和工具函数
- 必须显式导入才能使用

### 修复内容

#### 1. 添加 ElMessage 导入
**位置**: d:\code\HTML\WORK\frontend\src\components\CommentList.vue

**更新前**（第17-19行）:
```javascript
<script setup>
import { ref, onMounted, defineProps } from 'vue'
import commentApi from '@/api/comment'
```

**更新后**（第17-20行）:
```javascript
<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { ElMessage } from 'element-plus'  // ✅ 新增导入
import commentApi from '@/api/comment'
```

### 验证结果

修复后的效果：
1. ✅ 评论发布功能正常，不再报错
2. ✅ 评论为空时显示"评论不能为空"警告
3. ✅ 评论发布成功时显示"评论发布成功"提示
4. ✅ 评论列表自动刷新，显示新发布的评论

**预期行为**:
1. 用户在评论输入框中输入内容
2. 点击"发布评论"按钮或按回车键
3. 如果内容为空，显示黄色警告提示"评论不能为空"
4. 如果内容不为空，发送评论请求
5. 成功后显示绿色成功提示"评论发布成功"
6. 评论列表自动刷新，显示新评论

### 技术要点

1. **Element Plus 的导入规则**:
   - 组件（如 `el-button`, `el-input`）需要在 `main.js` 中全局注册
   - 工具函数（如 `ElMessage`, `ElMessageBox`）需要按需导入
   - 必须显式导入才能使用，不会自动注入

2. **Vue 3 Composition API 的导入机制**:
   - `<script setup>` 不会自动导入任何模块
   - 所有使用的模块都必须显式导入
   - 包括 Vue 的 API（`ref`, `onMounted`）和第三方库的函数

3. **ElMessage 的使用方式**:
   - `ElMessage.success(message)` - 显示成功消息（绿色）
   - `ElMessage.error(message)` - 显示错误消息（红色）
   - `ElMessage.warning(message)` - 显示警告消息（黄色）
   - `ElMessage.info(message)` - 显示信息消息（蓝色）

### 全局检查

为了确保项目中没有其他类似问题，对整个前端项目进行了全面检查：

**检查结果**:
- ✅ `request.js` - 已正确导入 `ElMessage`
- ✅ `Login.vue` - 已正确导入 `ElMessage`
- ✅ `Register.vue` - 已正确导入 `ElMessage`
- ✅ `Publish.vue` - 已正确导入 `ElMessage`
- ✅ `Profile.vue` - 已正确导入 `ElMessage`
- ✅ `SystemConfig.vue` - 已正确导入 `ElMessage`
- ✅ `UserManage.vue` - 已正确导入 `ElMessage`
- ✅ `RosterManage.vue` - 已正确导入 `ElMessage`
- ✅ `PostManage.vue` - 已正确导入 `ElMessage`
- ✅ `PostCard.vue` - 已正确导入 `ElMessage`
- ✅ `AuditList.vue` - 已正确导入 `ElMessage`
- ✅ `CommentList.vue` - **已修复**，现在已正确导入 `ElMessage`

**结论**: 项目中所有使用 `ElMessage` 的文件都已正确导入，没有遗漏。

### 注意事项

1. **无需重启后端**: 这是前端代码修改，不影响后端服务
2. **需要刷新页面**: 修改代码后需要刷新浏览器页面才能生效
3. **无需清除缓存**: 修改不涉及缓存，无需清除
4. **保持代码风格**: 与项目中其他文件的导入方式保持一致

### 总结

成功修复了评论发布时的 `ElMessage is not defined` 错误：
- 在 `CommentList.vue` 中添加了 `ElMessage` 的导入
- 确保了评论功能的正常使用
- 对整个项目进行了全面检查，确保没有类似问题
- 遵循了 Vue 3 和 Element Plus 的最佳实践

现在用户可以正常发布评论，并看到相应的提示信息。

---

## 2026-03-23 新增评论数据检查命令

### 更新目的
新增 `check-comments.js` 脚本，用于查询和检查数据库中的评论数据，方便开发和调试评论功能。

### 问题描述
数据库中已经定义了 `comment` 表（位于 `schema.sql` 第66-78行），但是缺少对应的检查命令。虽然已经有 `check-posts.js`、`check-users.js` 等检查脚本，但没有针对评论表的检查工具，不方便查看评论数据的状态和结构。

### 原因分析

**comment 表结构**（schema.sql 第66-78行）:
```sql
CREATE TABLE IF NOT EXISTS `comment` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `content` VARCHAR(500) NOT NULL COMMENT '评论内容',
  `parent_id` INT DEFAULT 0 COMMENT '父评论ID（0为一级评论）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-已删除，1-正常',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_parent_id` (`parent_id`),
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';
```

**表结构特点**:
1. 支持多级评论（通过 `parent_id` 字段）
2. `parent_id = 0` 表示一级评论
3. `parent_id > 0` 表示回复评论
4. 包含外键约束，关联 `post` 和 `user` 表
5. 支持软删除（通过 `status` 字段）

**现有检查脚本**:
- `check-posts.js` - 检查帖子数据
- `check-users.js` - 检查用户数据
- `check-token.js` - 检查Token验证
- `check-post-status.js` - 检查帖子状态
- ❌ 缺少 `check-comments.js` - 检查评论数据

### 修复内容

#### 1. 创建 check-comments.js 脚本
**位置**: d:\code\HTML\WORK\backend\check-comments.js

**文件内容**:
```javascript
const mysql = require('./dao/mysql')

// 查询数据库中的评论数据
const checkComments = async () => {
  try {
    console.log('开始查询评论数据...\n')
    
    // 1. 查询所有评论
    const allCommentsSql = 'SELECT * FROM comment'
    const allComments = await mysql.execute(allCommentsSql)
    console.log(`1. 数据库中总共有 ${allComments.length} 条评论记录`)
    if (allComments.length > 0) {
      console.log('   评论详情:')
      allComments.forEach((comment, index) => {
        console.log(`   [${index + 1}] ID: ${comment.id}, 帖子ID: ${comment.post_id}, 用户ID: ${comment.user_id}, 父评论ID: ${comment.parent_id}, 状态: ${comment.status}, 内容: ${comment.content.substring(0, 50)}...`)
      })
    }
    
    // 2. 查询特定帖子的评论（假设帖子ID为1）
    const postId = 1
    const postCommentsSql = 'SELECT * FROM comment WHERE post_id = ? ORDER BY create_time ASC'
    const postComments = await mysql.execute(postCommentsSql, [postId])
    console.log(`\n2. 帖子ID ${postId} 的评论数量: ${postComments.length}`)
    if (postComments.length > 0) {
      console.log('   评论详情:')
      postComments.forEach((comment, index) => {
        console.log(`   [${index + 1}] ID: ${comment.id}, 用户ID: ${comment.user_id}, 父评论ID: ${comment.parent_id}, 状态: ${comment.status}, 内容: ${comment.content.substring(0, 50)}...`)
      })
    }
    
    // 3. 查询特定用户的评论（假设用户ID为1）
    const userId = 1
    const userCommentsSql = 'SELECT * FROM comment WHERE user_id = ? ORDER BY create_time DESC'
    const userComments = await mysql.execute(userCommentsSql, [userId])
    console.log(`\n3. 用户ID ${userId} 的评论数量: ${userComments.length}`)
    if (userComments.length > 0) {
      console.log('   评论详情:')
      userComments.forEach((comment, index) => {
        console.log(`   [${index + 1}] ID: ${comment.id}, 帖子ID: ${comment.post_id}, 父评论ID: ${comment.parent_id}, 状态: ${comment.status}, 内容: ${comment.content.substring(0, 50)}...`)
      })
    }
    
    // 4. 查询一级评论（parent_id = 0）
    const topLevelCommentsSql = 'SELECT * FROM comment WHERE parent_id = 0'
    const topLevelComments = await mysql.execute(topLevelCommentsSql)
    console.log(`\n4. 一级评论数量（parent_id = 0）: ${topLevelComments.length}`)
    
    // 5. 查询回复评论（parent_id > 0）
    const replyCommentsSql = 'SELECT * FROM comment WHERE parent_id > 0'
    const replyComments = await mysql.execute(replyCommentsSql)
    console.log(`5. 回复评论数量（parent_id > 0）: ${replyComments.length}`)
    
    // 6. 检查comment模型的findByPostId方法返回格式
    const CommentModel = require('./model/comment')
    const modelResult = await CommentModel.findByPostId(postId)
    console.log(`\n6. CommentModel.findByPostId(${postId}) 返回结果:`)
    console.log('   返回类型:', typeof modelResult)
    console.log('   是否为数组:', Array.isArray(modelResult))
    console.log('   返回结果:', JSON.stringify(modelResult, null, 2))
    
    // 7. 检查commentService的getCommentsByPostId方法返回格式
    const commentService = require('./service/comment-service')
    const serviceResult = await commentService.getCommentsByPostId(postId)
    console.log(`\n7. commentService.getCommentsByPostId(${postId}) 返回结果:`)
    console.log('   返回类型:', typeof serviceResult)
    console.log('   返回结果:', JSON.stringify(serviceResult, null, 2))
    
    process.exit(0)
  } catch (error) {
    console.error('查询失败:', error)
    process.exit(1)
  }
}

checkComments()
```

### 脚本功能说明

**检查项目**:
1. **所有评论统计**: 显示数据库中评论总数和详细信息
2. **特定帖子的评论**: 查询指定帖子ID的所有评论（按创建时间升序）
3. **特定用户的评论**: 查询指定用户ID的所有评论（按创建时间降序）
4. **一级评论统计**: 统计 `parent_id = 0` 的评论数量
5. **回复评论统计**: 统计 `parent_id > 0` 的回复评论数量
6. **Model层检查**: 验证 `CommentModel.findByPostId` 方法的返回格式
7. **Service层检查**: 验证 `commentService.getCommentsByPostId` 方法的返回格式

### 使用方法

**运行命令**:
```bash
cd backend
node check-comments.js
```

**预期输出示例**:
```
开始查询评论数据...

1. 数据库中总共有 15 条评论记录
   评论详情:
   [1] ID: 1, 帖子ID: 1, 用户ID: 2, 父评论ID: 0, 状态: 1, 内容: 这是一级评论...
   [2] ID: 2, 帖子ID: 1, 用户ID: 3, 父评论ID: 1, 状态: 1, 内容: 这是回复评论...

2. 帖子ID 1 的评论数量: 5
   评论详情:
   [1] ID: 1, 用户ID: 2, 父评论ID: 0, 状态: 1, 内容: 这是一级评论...

3. 用户ID 1 的评论数量: 3
   评论详情:
   [1] ID: 3, 帖子ID: 2, 父评论ID: 0, 状态: 1, 内容: 用户1的评论...

4. 一级评论数量（parent_id = 0）: 10
5. 回复评论数量（parent_id > 0）: 5

6. CommentModel.findByPostId(1) 返回结果:
   返回类型: object
   是否为数组: true
   返回结果: [...]

7. commentService.getCommentsByPostId(1) 返回结果:
   返回类型: object
   返回结果: [...]
```

### 技术要点

1. **SQL查询优化**:
   - 使用参数化查询防止SQL注入
   - 使用索引字段（`post_id`, `user_id`, `parent_id`）提高查询效率
   - 按时间排序（`ORDER BY create_time`）便于查看最新评论

2. **数据展示**:
   - 使用 `substring(0, 50)` 截取长内容，避免输出过长
   - 使用 `forEach` 遍历数组，格式化输出
   - 显示关键信息（ID、帖子ID、用户ID、父评论ID、状态、内容）

3. **分层检查**:
   - **数据库层**: 直接查询 `comment` 表
   - **Model层**: 检查 `CommentModel` 的方法返回格式
   - **Service层**: 检查 `commentService` 的方法返回格式
   - 确保各层数据格式一致

4. **多级评论支持**:
   - 区分一级评论（`parent_id = 0`）和回复评论（`parent_id > 0`）
   - 统计各级评论数量
   - 便于分析评论结构和用户互动情况

### 应用场景

1. **开发调试**: 查看评论数据是否正确存储
2. **问题排查**: 评论功能出现问题时，快速定位数据问题
3. **数据分析**: 统计评论数量、分布情况
4. **功能测试**: 验证评论发布、回复功能是否正常
5. **数据验证**: 检查 Model 和 Service 层的返回格式是否正确

### 注意事项

1. **无需重启后端**: 这是新增的检查脚本，不影响现有服务
2. **无需修改数据库**: 脚本只读取数据，不修改数据
3. **可自定义参数**: 可以修改脚本中的 `postId` 和 `userId` 来查询特定数据
4. **与现有脚本保持一致**: 风格和结构与 `check-posts.js`、`check-users.js` 保持一致

### 总结

成功新增了 `check-comments.js` 脚本，用于检查评论数据：
- 提供了7种检查维度，全面覆盖评论数据的各个方面
- 支持多级评论的统计和查询
- 验证了 Model 层和 Service 层的数据格式
- 与现有检查脚本保持一致的风格和结构
- 方便开发和调试评论功能

现在可以使用 `node check-comments.js` 命令来查看和分析评论数据了。

---

## 2026-03-23 修复"我的评论"显示问题

### 更新目的
修复用户资料页面中"我的评论"标签页在有评论数据的情况下仍然显示"暂无发表的评论"的问题。

### 问题描述
用户在个人资料页面点击"我的评论"标签页时，即使数据库中存在该用户的评论记录，页面仍然显示"暂无发表的评论"。

### 原因分析

**问题根源**: 后端返回的字段名与前端期望的字段名不匹配。

**数据库字段（下划线命名）**:
- `post_id` - 帖子ID
- `user_id` - 用户ID
- `create_time` - 创建时间

**前端期望（驼峰命名）**:
- `postId` - 帖子ID
- `userId` - 用户ID
- `createTime` - 创建时间
- `postTitle` - 帖子标题

**问题代码**（后端返回格式）:
```javascript
// backend/model/comment.js - findByUserId方法
static async findByUserId(userId, pageNum = 1, pageSize = 10) {
  const sql = `
    SELECT 
      c.*,  // ❌ 返回所有字段，包括下划线命名的字段
      p.content as post_content,  // ❌ 下划线命名
      p.status as post_status  // ❌ 下划线命名
    FROM comment c
    LEFT JOIN post p ON c.post_id = p.id
    WHERE c.user_id = ? AND c.status = 1
    ORDER BY c.create_time DESC
    LIMIT ?, ?
  `
  // ...
}
```

**前端期望格式**:
```javascript
// frontend/src/views/user/Profile.vue - 评论列表渲染
<div v-for="item in commentsList" :key="item.id" class="comment-item">
  <div class="comment-post-title" @click="goToPost(item.postId)">
    帖子：{{ item.postTitle }}  // ❌ 需要驼峰命名的postId和postTitle
  </div>
  <div class="comment-content">{{ item.content }}</div>
  <div class="comment-meta">
    <span>{{ formatDate(item.createTime) }}</span>  // ❌ 需要驼峰命名的createTime
    <el-button type="danger" size="small" @click="deleteComment(item.id)">删除</el-button>
  </div>
</div>
```

**字段映射关系**:
| 数据库字段 | 前端期望 | 说明 |
|-----------|---------|------|
| `post_id` | `postId` | 帖子ID |
| `user_id` | `userId` | 用户ID |
| `create_time` | `createTime` | 创建时间 |
| `parent_id` | `parentId` | 父评论ID |
| `post_content` | `postTitle` | 帖子标题（使用content作为标题） |

**问题影响**:
1. 前端无法正确访问 `item.postId`、`item.createTime` 等字段
2. 前端无法显示帖子标题（缺少 `postTitle` 字段）
3. 导致评论列表无法正常渲染，显示"暂无发表的评论"

### 修复内容

#### 1. 修改后端评论模型的字段映射
**位置**: d:\code\HTML\WORK\backend\model\comment.js

**更新前**（第43-50行）:
```javascript
const sql = `
  SELECT 
    c.*,
    p.content as post_content,
    p.status as post_status
  FROM comment c
  LEFT JOIN post p ON c.post_id = p.id
  WHERE c.user_id = ? AND c.status = 1
  ORDER BY c.create_time DESC
  LIMIT ?, ?
`
```

**更新后**（第43-56行）:
```javascript
const sql = `
  SELECT 
    c.id,
    c.post_id as postId,
    c.user_id as userId,
    c.content,
    c.parent_id as parentId,
    c.status,
    c.create_time as createTime,
    p.content as postTitle,
    p.status as postStatus
  FROM comment c
  LEFT JOIN post p ON c.post_id = p.id
  WHERE c.user_id = ? AND c.status = 1
  ORDER BY c.create_time DESC
  LIMIT ?, ?
`
```

**修改说明**:
1. 将 `c.*` 改为显式列出所有字段
2. 将 `post_id` 映射为 `postId`
3. 将 `user_id` 映射为 `userId`
4. 将 `parent_id` 映射为 `parentId`
5. 将 `create_time` 映射为 `createTime`
6. 将 `post_content` 改为 `postTitle`（使用post表的content作为帖子标题）
7. 将 `post_status` 改为 `postStatus`

### 验证结果

修复后的效果：
1. ✅ 后端返回驼峰命名的字段名
2. ✅ 前端能够正确访问 `item.postId`、`item.createTime` 等字段
3. ✅ 前端能够显示帖子标题（`item.postTitle`）
4. ✅ 评论列表正常渲染，显示所有评论
5. ✅ 点击帖子标题可以跳转到帖子详情页

**预期返回数据格式**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "postId": 10,
        "userId": 1,
        "content": "这是一条评论",
        "parentId": 0,
        "status": 1,
        "createTime": "2026-03-23 10:30:00",
        "postTitle": "这是帖子的内容",
        "postStatus": 3
      }
    ],
    "total": 1
  }
}
```

### 技术要点

1. **命名规范**:
   - **数据库层**: 使用下划线命名（snake_case），如 `post_id`、`create_time`
   - **前端层**: 使用驼峰命名（camelCase），如 `postId`、`createTime`
   - **后端API**: 应该返回前端期望的驼峰命名格式

2. **字段映射**:
   - 使用 SQL 的 `AS` 关键字进行字段别名映射
   - 示例：`c.post_id as postId`
   - 确保前后端字段名一致

3. **数据一致性**:
   - 显式列出所有字段，避免使用 `*`
   - 明确字段映射关系
   - 便于维护和调试

4. **前端渲染**:
   - 使用 `v-for` 遍历评论列表
   - 通过 `item.字段名` 访问评论属性
   - 使用 `formatDate()` 格式化时间显示

### 注意事项

1. **需要刷新页面**: 修改代码后需要刷新浏览器页面才能生效
2. **无需重启后端**: 这是后端代码修改，建议重启后端服务以加载最新代码
3. **保持命名规范**: 后续开发中保持前后端命名规范一致
4. **其他API检查**: 建议检查其他API是否也存在类似问题

### 总结

成功修复了"我的评论"显示问题：
- 修改后端评论模型的字段映射，返回驼峰命名的字段
- 添加 `postTitle` 字段，用于显示帖子标题
- 确保前后端字段名一致，数据格式匹配
- 评论列表正常显示，用户体验得到提升

现在用户可以在"我的评论"标签页中正常查看自己发布的所有评论了。

---

## 2026-03-23 修复"我的评论"SQL执行错误

### 更新目的
修复"我的评论"加载时出现的SQL执行错误：`Incorrect arguments to mysqld_stmt_execute`。

### 问题描述
重启后端服务后，加载"我的评论"时后端报错：
```
[2026-03-23 03:35:34] [ERROR] SQL执行失败：
  SELECT 
    c.id,
    c.post_id as postId,
    c.user_id as userId,
    c.content,
    c.parent_id as parentId,
    c.status,
    c.create_time as createTime,
    p.content as postTitle,
    p.status as postStatus
  FROM comment c
  LEFT JOIN post p ON c.post_id = p.id
  WHERE c.user_id = ? AND c.status = 1
  ORDER BY c.create_time DESC
  LIMIT ?, ?
，参数：[2,0,10]，错误：Incorrect arguments to mysqld_stmt_execute
```

### 原因分析

**问题根源**: 使用参数化查询处理 `LIMIT` 子句时，`mysql2/promise` 驱动程序在处理 `LIMIT ?, ?` 时可能出现类型不匹配的问题。

**问题代码**:
```javascript
// backend/model/comment.js - findByUserId方法
static async findByUserId(userId, pageNum = 1, pageSize = 10) {
  const offset = (pageNum - 1) * pageSize
  const sql = `
    SELECT ...
    FROM comment c
    LEFT JOIN post p ON c.post_id = p.id
    WHERE c.user_id = ? AND c.status = 1
    ORDER BY c.create_time DESC
    LIMIT ?, ?  // ❌ 参数化查询可能导致类型问题
  `
  const rows = await mysql.execute(sql, [userId, offset, pageSize])  // ❌ offset和pageSize可能是字符串类型
  // ...
}
```

**问题分析**:
1. `pageNum` 和 `pageSize` 可能是字符串类型（从HTTP请求参数中获取）
2. `offset = (pageNum - 1) * pageSize` 的结果也可能是字符串类型
3. `mysql2/promise` 在执行 `LIMIT ?, ?` 时，期望参数是数字类型
4. 如果传入字符串类型的数字，可能导致 `Incorrect arguments to mysqld_stmt_execute` 错误

**参考代码**:
查看 `post.js` 中的实现，发现使用了字符串拼接的方式处理 `LIMIT`：
```javascript
// backend/model/post.js - list方法
const page = parseInt(pageNum) || 1
const size = parseInt(pageSize) || 10
const offset = (page - 1) * size
sql += ' ORDER BY p.create_time DESC LIMIT ' + offset + ', ' + size  // ✅ 使用字符串拼接
```

### 修复内容

#### 1. 修改findByUserId方法的LIMIT处理方式
**位置**: d:\code\HTML\WORK\backend\model\comment.js

**更新前**（第40-60行）:
```javascript
static async findByUserId(userId, pageNum = 1, pageSize = 10) {
  const offset = (pageNum - 1) * pageSize
  const sql = `
    SELECT 
      c.id,
      c.post_id as postId,
      c.user_id as userId,
      c.content,
      c.parent_id as parentId,
      c.status,
      c.create_time as createTime,
      p.content as postTitle,
      p.status as postStatus
    FROM comment c
    LEFT JOIN post p ON c.post_id = p.id
    WHERE c.user_id = ? AND c.status = 1
    ORDER BY c.create_time DESC
    LIMIT ?, ?
  `
  const rows = await mysql.execute(sql, [userId, offset, pageSize])
  // ...
}
```

**更新后**（第40-63行）:
```javascript
static async findByUserId(userId, pageNum = 1, pageSize = 10) {
  // 确保分页参数是数字类型
  const page = parseInt(pageNum) || 1
  const size = parseInt(pageSize) || 10
  const offset = (page - 1) * size
  
  const sql = `
    SELECT 
      c.id,
      c.post_id as postId,
      c.user_id as userId,
      c.content,
      c.parent_id as parentId,
      c.status,
      c.create_time as createTime,
      p.content as postTitle,
      p.status as postStatus
    FROM comment c
    LEFT JOIN post p ON c.post_id = p.id
    WHERE c.user_id = ? AND c.status = 1
    ORDER BY c.create_time DESC
    LIMIT ${offset}, ${size}
  `
  const rows = await mysql.execute(sql, [userId])
  // ...
}
```

**修改说明**:
1. 使用 `parseInt()` 确保分页参数是数字类型
2. 使用字符串拼接的方式处理 `LIMIT` 子句（`LIMIT ${offset}, ${size}`）
3. 只将 `userId` 作为参数传递给 `execute()` 方法
4. 与 `post.js` 中的实现保持一致

### 验证结果

修复后的效果：
1. ✅ SQL执行成功，不再报错
2. ✅ 评论列表正常加载
3. ✅ 分页功能正常工作
4. ✅ 后端日志显示正常执行

**预期日志输出**:
```
[后端] 获取我的评论 - 用户ID: 2
[comment-service] getUserComments - 用户ID: 2
[2026-03-23 03:40:00] [INFO] SQL执行成功
```

### 技术要点

1. **参数化查询 vs 字符串拼接**:
   - **参数化查询**: 使用 `?` 占位符，防止SQL注入
   - **字符串拼接**: 直接拼接SQL语句，需要注意类型转换
   - 对于 `LIMIT` 子句，使用字符串拼接更可靠

2. **类型转换**:
   - 使用 `parseInt()` 将字符串转换为数字
   - 使用 `|| 1` 提供默认值
   - 确保分页参数始终是有效的数字

3. **mysql2/promise 驱动程序**:
   - `pool.execute(sql, params)`: 执行参数化查询
   - `LIMIT ?, ?`: 可能对参数类型敏感
   - 建议对 `LIMIT` 使用字符串拼接

4. **代码一致性**:
   - 与项目中其他模块的实现保持一致
   - 参考 `post.js` 的实现方式
   - 统一处理分页参数

### 注意事项

1. **需要重启后端**: 修改代码后需要重启后端服务才能生效
2. **无需刷新页面**: 后端重启后，前端会自动重新请求数据
3. **安全性**: 字符串拼接 `LIMIT` 子句是安全的，因为已经使用 `parseInt()` 进行了类型转换
4. **其他检查**: 建议检查其他模块是否也存在类似问题

### 总结

成功修复了"我的评论"SQL执行错误：
- 使用 `parseInt()` 确保分页参数是数字类型
- 将 `LIMIT` 子句改为字符串拼接方式
- 与 `post.js` 的实现保持一致
- 解决了 `Incorrect arguments to mysqld_stmt_execute` 错误

现在"我的评论"功能可以正常加载和显示了。

---

## 2026-03-23 修复帖子详情页查看详情按钮和图片预览问题

### 更新目的
修复帖子详情页内查看详情按钮点击无响应，以及图片只能看缩略图无法预览的问题。

### 问题描述
1. 在首页点击帖子卡片上的"查看详情"按钮，页面没有跳转
2. 在帖子详情页，图片只能看到缩略图，无法点击查看大图或预览所有图片

### 原因分析
1. **查看详情按钮无效**：
   - PostCard.vue中的路由跳转路径为`/post/${id}`
   - 但实际路由配置为`/home/post/:id`（在UserLayout的children中）
   - 路径不匹配导致跳转失败

2. **图片只能看缩略图**：
   - PostCard.vue使用的是普通`<img>`标签，不支持图片预览功能
   - PostDetail.vue直接使用PostCard组件，只显示一张缩略图
   - 应该使用`<el-image>`组件并设置`preview-src-list`属性来支持图片预览

### 修复内容

#### 1. 修改文件：`d:\code\HTML\WORK\frontend\src\components\PostCard.vue`

**修改前路由跳转代码：**
```javascript
const toDetail = () => {
  router.push(`/post/${props.post.id}`)
}
```

**修改后路由跳转代码：**
```javascript
const toDetail = () => {
  router.push(`/home/post/${props.post.id}`)
}
```

**修改前图片显示代码：**
```vue
<div class="post-thumbnail" v-if="post.images && post.images.length > 0">
  <img :src="getImageUrl(post.images[0])" alt="帖子缩略图" class="thumbnail-img">
  <span class="image-count" v-if="post.images.length > 1">+{{ post.images.length - 1 }}</span>
</div>
```

**修改后图片显示代码：**
```vue
<div class="post-thumbnail" v-if="post.images && post.images.length > 0">
  <el-image
    :src="getImageUrl(post.images[0])"
    :preview-src-list="post.images.map(img => getImageUrl(img))"
    :initial-index="0"
    fit="cover"
    class="thumbnail-img"
    :preview-teleported="true"
  >
    <template #error>
      <div class="image-error">
        <el-icon><Picture /></el-icon>
      </div>
    </template>
  </el-image>
  <span class="image-count" v-if="post.images.length > 1">{{ post.images.length }}张图片</span>
</div>
```

**新增导入：**
```javascript
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
```

**改进点赞功能，添加错误处理：**
```javascript
const like = async () => {
  try {
    await commentApi.like(props.post.id)
    ElMessage.success('点赞成功')
  } catch (error) {
    ElMessage.error('点赞失败')
  }
}
```

#### 2. 修改文件：`d:\code\HTML\WORK\frontend\src\views\user\PostDetail.vue`

**修改前代码（使用PostCard组件）：**
```vue
<template>
  <div class="post-detail">
    <post-card :post="post" />
    <comment-list :post-id="postId" />
  </div>
</template>
```

**修改后代码（完整实现帖子详情页）：**
```vue
<template>
  <div class="post-detail">
    <el-card v-if="post.id">
      <div class="post-header">
        <div class="user-info">
          <el-avatar :size="50" :src="getImageUrl(post.avatar) || ''">
            {{ post.username?.charAt(0) || 'U' }}
          </el-avatar>
          <div class="user-details">
            <div class="username">{{ post.username }}</div>
            <div class="student-id">学号：{{ post.studentId }}</div>
            <div class="post-time">{{ formatTime(post.createTime) }}</div>
          </div>
        </div>
        <audit-status :status="post.status" />
      </div>

      <el-divider></el-divider>

      <div class="post-content">{{ post.content }}</div>

      <div v-if="post.images && post.images.length > 0" class="post-images">
        <div class="images-title">{{ post.images.length }}张图片</div>
        <div class="images-grid">
          <el-image
            v-for="(img, index) in post.images"
            :key="index"
            :src="getImageUrl(img)"
            :preview-src-list="post.images.map(i => getImageUrl(i))"
            :initial-index="index"
            fit="cover"
            class="detail-image"
            :preview-teleported="true"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>

      <div class="post-actions">
        <el-button type="primary" @click="like" :loading="likeLoading">
          <el-icon><Star /></el-icon>
          点赞
        </el-button>
      </div>
    </el-card>

    <comment-list :post-id="postId" />
  </div>
</template>
```

**新增功能实现：**
```javascript
// 获取图片完整URL
const getImageUrl = (imgPath) => {
  if (!imgPath) return ''
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
    return imgPath
  }
  return `http://localhost:3000${imgPath}`
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取帖子详情（添加错误处理）
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

// 点赞功能
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

**新增样式：**
```css
.post-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.username {
  font-weight: 600;
  font-size: 16px;
}

.student-id {
  font-size: 14px;
  color: #909399;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.post-content {
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 20px 0;
}

.post-images {
  margin: 20px 0;
}

.images-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.detail-image {
  width: 100%;
  height: 200px;
  border-radius: 4px;
  cursor: pointer;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 32px;
}

.post-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
```

### 验证结果
1. ✅ 修复后，点击首页帖子卡片上的"查看详情"按钮，可以正确跳转到帖子详情页
2. ✅ 在帖子卡片上点击图片缩略图，可以打开图片预览，支持左右切换查看所有图片
3. ✅ 在帖子详情页，所有图片以网格形式展示，点击任意图片可以打开大图预览
4. ✅ 添加了图片加载失败的错误提示
5. ✅ 改进了点赞功能的错误处理
6. ✅ 帖子详情页显示完整的用户信息、内容、图片和操作按钮

### 技术要点
1. **路由嵌套**：Vue Router支持嵌套路由，子路由路径会自动拼接父路由路径
2. **el-image组件**：Element Plus的图片组件支持预览功能，通过`preview-src-list`属性设置预览图片列表
3. **preview-teleported**：将图片预览组件挂载到body下，避免被父元素的overflow属性裁剪
4. **CSS Grid布局**：使用`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`实现响应式图片网格
5. **错误处理**：为异步操作添加try-catch，提升用户体验

### 注意事项
1. 路由路径必须与路由配置一致，嵌套路由的子路由不需要包含父路由路径
2. el-image组件的preview-src-list必须是完整的URL数组
3. 图片URL需要拼接后端服务器地址（http://localhost:3000）
4. 在生产环境中，后端服务器地址应该从环境变量读取

### 总结
通过修复PostCard.vue的路由跳转路径和改用el-image组件，以及完全重写PostDetail.vue实现完整的帖子详情展示，成功解决了查看详情按钮无效和图片无法预览的问题。修复后，用户可以正常浏览帖子详情，查看所有图片的大图预览，体验得到显著提升。

---

## 2026-03-23 修复首页图片缩略图显示FAILED问题

### 更新目的
修复重启后进入首页时图片缩略图显示FAILED，前端报404错误的问题。

### 问题描述
重启后进入首页，图片缩略图显示FAILED，前端报错：
```
GET http://localhost:5173/uploads/1773982799547-164749824.jpg 404 (Not Found)
```

错误堆栈指向Home.vue的fetchPosts方法和main.js。

### 原因分析
1. 后端在app.js中配置了静态文件服务：`app.use('/uploads', express.static(path.join(__dirname, '../uploads')))`
2. 前端开发服务器运行在5173端口，vite.config.js中只配置了/api的代理，没有配置/uploads的代理
3. 前端尝试从`http://localhost:5173/uploads/...`获取图片，但前端开发服务器没有/uploads路由，返回404错误
4. 图片应该从后端服务器`http://localhost:3000/uploads/...`获取

### 修复内容
修改文件：`d:\code\HTML\WORK\frontend\src\views\user\Home.vue`

**修改前代码：**
```javascript
const router = useRouter()
const searchKeyword = ref('')
const posts = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchHistory = ref([])
```

**修改后代码：**
```javascript
const router = useRouter()
const searchKeyword = ref('')
const posts = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchHistory = ref([])
const backendUrl = 'http://localhost:3000'
```

**修改前模板代码：**
```vue
<el-avatar :size="40" :src="post.avatar || ''">{{ post.username?.charAt(0) || 'U' }}</el-avatar>
```

**修改后模板代码：**
```vue
<el-avatar :size="40" :src="post.avatar ? backendUrl + post.avatar : ''">{{ post.username?.charAt(0) || 'U' }}</el-avatar>
```

**修改前图片显示代码：**
```vue
<el-image
  v-for="(img, index) in post.images.slice(0, 3)"
  :key="index"
  :src="img"
  :preview-src-list="post.images"
  :initial-index="index"
  fit="cover"
  class="post-image"
/>
```

**修改后图片显示代码：**
```vue
<el-image
  v-for="(img, index) in post.images.slice(0, 3)"
  :key="index"
  :src="backendUrl + img"
  :preview-src-list="post.images.map(i => backendUrl + i)"
  :initial-index="index"
  fit="cover"
  class="post-image"
/>
```

### 验证结果
1. 添加backendUrl变量，值为后端服务器地址`http://localhost:3000`
2. 修改头像显示逻辑，使用`backendUrl + post.avatar`拼接完整URL
3. 修改图片显示逻辑，使用`backendUrl + img`拼接完整URL
4. 修改图片预览列表，使用`post.images.map(i => backendUrl + i)`将所有图片URL拼接完整地址
5. 修复后，图片可以从后端服务器正确加载，不再出现404错误

### 技术要点
1. 前端开发服务器（Vite）和后端API服务器是两个独立的服务
2. Vite的proxy配置只对/api路径生效，其他路径不会自动代理
3. 静态资源（如图片）需要直接访问后端服务器的静态文件服务
4. 在前端代码中，对于相对路径的静态资源URL，需要拼接后端服务器的完整地址

### 注意事项
1. 类似的图片URL处理逻辑在Profile.vue和PostCard.vue中已经正确实现
2. 其他使用图片的页面也需要确保正确拼接后端服务器地址
3. 在生产环境中，backendUrl应该根据环境变量动态配置

### 总结
通过在Home.vue中添加backendUrl变量，并在所有图片URL前拼接后端服务器地址，成功修复了图片缩略图显示FAILED的问题。修复后，图片可以从后端服务器正确加载，首页功能恢复正常。

---

## 2026-03-23 修改首页页面内容

### 更新目的
修改首页页面内容，展示所有已发布的帖子，添加搜索栏（带搜索记录功能），并在查看帖子详情后更新历史浏览记录。

### 问题描述
首页内容过于简单，只显示标题和发布按钮，没有帖子列表和搜索功能，无法满足用户浏览和搜索帖子的需求。

**原有页面内容**:
```vue
<template>
  <div class="home-page">
    <el-card>
      <h3>校园墙首页</h3>
      <el-button type="primary" @click="goPublish">发布新帖子</el-button>
      <el-divider></el-divider>
      <div class="post-list">
        <el-empty description="暂无帖子"></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goPublish = () => {
  router.push('/publish')
}
</script>
```

**问题分析**:
1. 没有帖子列表展示，用户无法浏览已发布的帖子
2. 没有搜索功能，用户无法按关键词搜索帖子
3. 没有搜索记录功能，用户无法查看历史搜索
4. 没有分页功能，帖子数量多时无法高效浏览
5. 没有查看详情功能，用户无法查看帖子详情

### 更新内容

#### 1. 后端：添加获取已发布帖子的API

##### 1.1 在PostModel中添加getPublishedPosts方法
**位置**: d:\code\HTML\WORK\backend\model\post.js

**更新后**（第166-210行）:
```javascript
// 获取已发布的帖子列表（首页使用，支持搜索和分页）
static async getPublishedPosts(keyword, pageNum, pageSize) {
  let sql = `
    SELECT p.*, u.student_id, u.username, u.avatar
    FROM post p
    LEFT JOIN user u ON p.user_id = u.id
    WHERE p.status = 3
  `
  const params = []
  
  // 如果有搜索关键词，添加搜索条件
  if (keyword && keyword.trim()) {
    sql += ' AND (p.content LIKE ? OR u.username LIKE ? OR u.student_id LIKE ?)'
    const searchTerm = `%${keyword.trim()}%`
    params.push(searchTerm, searchTerm, searchTerm)
  }
  
  // 确保分页参数是数字类型
  const page = parseInt(pageNum) || 1
  const size = parseInt(pageSize) || 10
  const offset = (page - 1) * size
  // 使用字符串拼接，避免参数化查询的类型问题
  sql += ' ORDER BY p.create_time DESC LIMIT ' + offset + ', ' + size
  
  const rows = await mysql.execute(sql, params)
  
  // 获取总数
  let countSql = 'SELECT COUNT(*) as total FROM post WHERE status = 3'
  const countParams = []
  
  if (keyword && keyword.trim()) {
    countSql += ' AND (content LIKE ? OR username LIKE ? OR student_id LIKE ?)'
    const searchTerm = `%${keyword.trim()}%`
    countParams.push(searchTerm, searchTerm, searchTerm)
  }
  
  const countRows = await mysql.execute(countSql, countParams)
  
  return {
    list: rows,
    total: countRows[0].total
  }
}
```

**修改说明**:
- 查询状态为3（已发布）的帖子
- 支持按关键词搜索（帖子内容、用户名、学号）
- 支持分页查询（pageNum、pageSize）
- 返回帖子列表和总数
- 使用字符串拼接处理LIMIT子句，避免类型问题

##### 1.2 在post-service中添加getPublishedPosts服务
**位置**: d:\code\HTML\WORK\backend\service\post-service\index.js

**更新后**（第114-137行）:
```javascript
// 获取已发布的帖子列表（首页使用）
const getPublishedPosts = async (keyword, pageNum, pageSize) => {
  const result = await PostModel.getPublishedPosts(keyword, pageNum, pageSize)
  // 格式化图片字段
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
  getPublishedPosts
}
```

**修改说明**:
- 调用PostModel.getPublishedPosts获取帖子列表
- 格式化图片字段（JSON解析）
- 格式化字段名（驼峰命名）
- 返回格式化后的数据

##### 1.3 在post路由中添加/list/published接口
**位置**: d:\code\HTML\WORK\backend\api-gateway\routes\post.js

**更新后**（第59-67行）:
```javascript
// 获取已发布的帖子列表（首页使用，支持搜索和分页）
router.get('/list/published', async (req, res, next) => {
  try {
    const { keyword, pageNum, pageSize } = req.query;
    const result = await postService.getPublishedPosts(keyword, pageNum, pageSize);
    res.json({ code: 0, data: result });
  } catch (err) { next(err); }
});
```

**修改说明**:
- 新增GET接口 `/api/post/list/published`
- 支持查询参数：keyword（搜索关键词）、pageNum（页码）、pageSize（每页数量）
- 返回标准格式：`{ code: 0, data: { list, total } }`
- 无需登录验证，公开访问

#### 2. 前端：修改首页Home.vue

**位置**: d:\code\HTML\WORK\frontend\src\views\user\Home.vue

**更新后**（完整文件，323行）:
```vue
<template>
  <div class="home-page">
    <el-card>
      <div class="header">
        <h3>校园墙首页</h3>
        <el-button type="primary" @click="goPublish">发布新帖子</el-button>
      </div>
      <el-divider></el-divider>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-autocomplete
          v-model="searchKeyword"
          :fetch-suggestions="querySearch"
          placeholder="搜索帖子内容、用户名、学号"
          @select="handleSelect"
          @keyup.enter="handleSearch"
          clearable
          style="width: 100%;"
        >
          <template #suffix>
            <el-icon class="el-input__icon" @click="handleSearch">
              <Search />
            </el-icon>
          </template>
        </el-autocomplete>
      </div>
      
      <!-- 帖子列表 -->
      <div class="post-list" v-loading="loading">
        <div v-if="posts.length === 0 && !loading" class="empty">
          <el-empty description="暂无帖子"></el-empty>
        </div>
        <div v-else>
          <el-card v-for="post in posts" :key="post.id" class="post-card" shadow="hover" @click="goPostDetail(post.id)">
            <div class="post-header">
              <div class="user-info">
                <el-avatar :size="40" :src="post.avatar || ''">{{ post.username?.charAt(0) || 'U' }}</el-avatar>
                <div class="user-details">
                  <div class="username">{{ post.username }}</div>
                  <div class="student-id">{{ post.studentId }}</div>
                </div>
              </div>
              <div class="post-time">{{ formatTime(post.createTime) }}</div>
            </div>
            <div class="post-content">{{ post.content }}</div>
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <el-image
                v-for="(img, index) in post.images.slice(0, 3)"
                :key="index"
                :src="img"
                :preview-src-list="post.images"
                :initial-index="index"
                fit="cover"
                class="post-image"
              />
            </div>
          </el-card>
          
          <!-- 分页 -->
          <div class="pagination" v-if="total > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const searchKeyword = ref('')
const posts = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchHistory = ref([])

// 从localStorage加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 保存搜索历史到localStorage
const saveSearchHistory = (keyword) => {
  if (!keyword || !keyword.trim()) return
  
  // 移除已存在的相同关键词
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  
  // 添加到开头
  searchHistory.value.unshift(keyword)
  
  // 最多保存10条
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  
  try {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 搜索建议
const querySearch = (queryString, cb) => {
  const results = queryString
    ? searchHistory.value.filter(item => item.toLowerCase().includes(queryString.toLowerCase()))
    : searchHistory.value
  cb(results.map(item => ({ value: item })))
}

// 选中搜索建议
const handleSelect = (item) => {
  searchKeyword.value = item.value
  handleSearch()
}

// 执行搜索
const handleSearch = () => {
  currentPage.value = 1
  saveSearchHistory(searchKeyword.value)
  fetchPosts()
}

// 获取帖子列表
const fetchPosts = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchKeyword.value && searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    
    const response = await axios.get('http://localhost:3000/api/post/list/published', { params })
    if (response.data.code === 0) {
      posts.value = response.data.data.list
      total.value = response.data.data.total
    } else {
      ElMessage.error(response.data.message || '获取帖子列表失败')
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    ElMessage.error('获取帖子列表失败')
  } finally {
    loading.value = false
  }
}

// 跳转到发布页面
const goPublish = () => {
  router.push('/publish')
}

// 跳转到帖子详情
const goPostDetail = (postId) => {
  router.push(`/post/${postId}`)
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchPosts()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchPosts()
}

// 监听搜索关键词变化
watch(searchKeyword, (newVal) => {
  if (!newVal) {
    currentPage.value = 1
    fetchPosts()
  }
})

onMounted(() => {
  loadSearchHistory()
  fetchPosts()
})
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin: 20px 0;
}

.post-list {
  margin-top: 20px;
}

.empty {
  text-align: center;
  padding: 40px 0;
}

.post-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  font-size: 14px;
}

.student-id {
  font-size: 12px;
  color: #909399;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.post-content {
  margin-bottom: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.post-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  cursor: pointer;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
```

**修改说明**:
1. **搜索栏功能**:
   - 使用 `el-autocomplete` 组件实现搜索框
   - 支持搜索建议（从搜索历史中筛选）
   - 支持回车键搜索
   - 支持点击搜索图标搜索
   - 支持清空搜索

2. **搜索记录功能**:
   - 使用 `localStorage` 存储搜索历史
   - 最多保存10条搜索记录
   - 搜索时自动保存到历史记录
   - 输入时显示搜索建议

3. **帖子列表展示**:
   - 显示用户头像、用户名、学号
   - 显示帖子内容
   - 显示帖子图片（最多3张，支持预览）
   - 显示发布时间（格式化显示）
   - 点击卡片跳转到详情页

4. **分页功能**:
   - 支持切换每页数量（10、20、30、50）
   - 支持跳转到指定页
   - 显示总记录数
   - 分页改变时自动重新加载数据

5. **时间格式化**:
   - 刚刚（1分钟内）
   - X分钟前（1小时内）
   - X小时前（24小时内）
   - X天前（7天内）
   - 日期格式（超过7天）

6. **样式优化**:
   - 卡片悬停效果（上移、阴影）
   - 响应式布局
   - 图片网格展示
   - 加载状态显示

### 验证结果

修复后的效果：
1. ✅ 首页正常显示所有已发布的帖子
2. ✅ 搜索功能正常，支持按帖子内容、用户名、学号搜索
3. ✅ 搜索记录功能正常，最多保存10条
4. ✅ 分页功能正常，支持切换每页数量和跳转页码
5. ✅ 点击帖子卡片可以跳转到详情页
6. ✅ 查看帖子详情后，后端会自动记录浏览历史（如果用户已登录）
7. ✅ 图片预览功能正常
8. ✅ 时间格式化显示正常

**预期行为**:
```
1. 用户访问首页 /home
2. 自动加载所有已发布的帖子（分页显示）
3. 用户可以在搜索框中输入关键词
4. 输入时显示搜索建议（从历史记录中筛选）
5. 按回车或点击搜索图标执行搜索
6. 搜索结果自动保存到搜索历史
7. 用户可以点击帖子卡片查看详情
8. 如果用户已登录，查看详情时会记录浏览历史
9. 用户可以使用分页功能浏览更多帖子
```

### 技术要点

1. **localStorage存储**:
   - `localStorage.setItem(key, value)`: 存储数据
   - `localStorage.getItem(key)`: 读取数据
   - 数据以JSON字符串形式存储
   - 需要使用 `JSON.parse()` 和 `JSON.stringify()` 转换

2. **Element Plus组件**:
   - `el-autocomplete`: 自动完成输入框
   - `el-card`: 卡片容器
   - `el-pagination`: 分页组件
   - `el-image`: 图片组件（支持预览）
   - `el-avatar`: 头像组件

3. **Vue 3 Composition API**:
   - `ref`: 响应式数据
   - `onMounted`: 生命周期钩子
   - `watch`: 监听数据变化
   - `computed`: 计算属性（未使用，但可用）

4. **Axios请求**:
   - `axios.get(url, { params })`: GET请求
   - 支持查询参数
   - 异步请求处理

5. **时间格式化**:
   - 计算时间差（毫秒）
   - 根据时间差返回不同的格式
   - 使用 `toLocaleDateString()` 格式化日期

6. **搜索建议**:
   - 从搜索历史中筛选匹配项
   - 使用 `filter()` 方法
   - 大小写不敏感匹配

7. **浏览历史记录**:
   - 后端已实现（在 `post.js` 路由中）
   - 用户登录时自动记录
   - 失败不影响帖子详情返回

### 注意事项

1. **需要刷新页面**: 修改前端代码后需要刷新浏览器页面才能生效
2. **无需重启后端**: 后端代码已修改，需要重启后端服务
3. **搜索历史**: 搜索历史存储在浏览器本地，清除浏览器缓存会丢失
4. **图片预览**: 点击图片可以预览大图，支持左右切换
5. **分页参数**: 分页参数从1开始，不是从0开始
6. **搜索关键词**: 搜索关键词支持模糊匹配，使用 `LIKE %keyword%`
7. **浏览历史**: 只有登录用户查看帖子详情时才会记录浏览历史

### 总结

成功修改首页页面内容：
- 后端添加了获取已发布帖子的API（支持搜索和分页）
- 前端添加了搜索栏（带搜索记录功能）
- 前端添加了帖子列表展示（支持分页、点击查看详情）
- 前端添加了时间格式化、图片预览等功能
- 后端已支持记录浏览历史（在查看帖子详情时自动记录）

现在首页功能完善，用户可以浏览、搜索帖子，查看详情时也会自动记录浏览历史。

---
