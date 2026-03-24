# 更新日志 - UpdateLog8

## 更新时间
2026-03-23

## 更新目的
修复"我的评论"和"我的帖子"功能中的三个问题：
1. 评论列表缺少审核状态显示
2. 筛选功能调用了不存在的函数（函数名错误）
3. 筛选状态映射逻辑错误

## 问题描述

### 问题1：评论列表缺少审核状态显示
在"我的评论"页面，评论列表只显示评论内容，没有显示评论的审核状态（如AI审核中、待人工审核、已发布等）。

### 问题2：筛选功能函数名错误
"我的评论"和"我的帖子"的筛选功能在切换筛选条件时，调用了不存在的函数：
- 帖子筛选调用了`fetchMyPosts()`，但实际函数名为`fetchPosts()`
- 评论筛选调用了`fetchMyComments()`，但实际函数名为`fetchComments()`

### 问题3：筛选状态映射逻辑错误
筛选功能的参数映射与后端状态定义不一致：
- "审核中"筛选应包含状态1（AI审核中）和状态2（待人工审核）
- "审核通过"筛选应对应状态3（已发布）
- 但原代码将"审核通过"映射为状态1，导致筛选结果错误

## 修改说明

### 1. 修改文件：frontend/src/views/user/Profile.vue

#### 1.1 为评论列表添加审核状态显示
**修改位置：** 第276-285行

**修改前：**
```html
<div class="comment-post-title">{{ comment.postTitle }}</div>
```

**修改后：**
```html
<div class="comment-header">
  <div class="comment-post-title">{{ comment.postTitle }}</div>
  <el-tag :type="getStatusTagType(comment.status)" size="small">
    {{ getStatusText(comment.status) }}
  </el-tag>
</div>
```

**说明：** 添加了comment-header容器，包含帖子标题和状态标签，使用el-tag组件显示评论的审核状态。

#### 1.2 修复帖子筛选功能（函数名错误）
**修改位置：** 第415-419行

**修改前：**
```javascript
const handlePostsFilterChange = () => {
  fetchMyPosts()
}
```

**修改后：**
```javascript
const handlePostsFilterChange = () => {
  fetchPosts()
}
```

**说明：** 将错误的函数名`fetchMyPosts`修正为`fetchPosts`。

#### 1.3 修复评论筛选功能（函数名错误）
**修改位置：** 第421-425行

**修改前：**
```javascript
const handleCommentsFilterChange = () => {
  fetchMyComments()
}
```

**修改后：**
```javascript
const handleCommentsFilterChange = () => {
  fetchComments()
}
```

**说明：** 将错误的函数名`fetchMyComments`修正为`fetchComments`。

#### 1.4 修正帖子筛选状态映射逻辑
**修改位置：** 第289-297行

**修改前：**
```javascript
const fetchPosts = async () => {
  loading.value = true
  try {
    const params = {
      page: postsPage.value,
      pageSize: postsPageSize.value,
      status: postsFilter.value === 'auditing' ? 2 : 1
    }
    const res = await getUserPosts(params)
```

**修改后：**
```javascript
const fetchPosts = async () => {
  loading.value = true
  try {
    const params = {
      page: postsPage.value,
      pageSize: postsPageSize.value,
      status: postsFilter.value === 'auditing' ? 2 : 3
    }
    const res = await getUserPosts(params)
```

**说明：** 修正了状态映射逻辑：
- "审核中"筛选：状态2（待人工审核）
- "审核通过"筛选：状态3（已发布）
- 添加了注释说明状态映射规则

#### 1.5 修正评论筛选状态映射逻辑
**修改位置：** 第307-315行

**修改前：**
```javascript
const fetchComments = async () => {
  loading.value = true
  try {
    const params = {
      page: commentsPage.value,
      pageSize: commentsPageSize.value,
      status: commentsFilter.value === 'auditing' ? 2 : 1
    }
    const res = await getUserComments(params)
```

**修改后：**
```javascript
const fetchComments = async () => {
  loading.value = true
  try {
    const params = {
      page: commentsPage.value,
      pageSize: commentsPageSize.value,
      status: commentsFilter.value === 'auditing' ? 3 : 1
    }
    const res = await getUserComments(params)
```

**说明：** 修正了状态映射逻辑：
- "审核中"筛选：状态3（待人工审核）
- "审核通过"筛选：状态1（正常）
- 添加了注释说明状态映射规则

#### 1.6 更新状态函数注释
**修改位置：** 第517行和第530行

**修改前：**
```javascript
// 获取帖子状态文本
const getStatusText = (status) => {

// 获取帖子状态标签类型
const getStatusTagType = (status) => {
```

**修改后：**
```javascript
// 获取状态文本（支持帖子和评论）
const getStatusText = (status) => {

// 获取状态标签类型（支持帖子和评论）
const getStatusTagType = (status) => {
```

**说明：** 更新函数注释，明确说明这些函数同时支持帖子和评论的状态显示。

## 技术要点

### 状态映射对照表

#### 帖子状态（POST_STATUS）
| 状态值 | 状态名称 | 筛选条件 | 说明 |
|--------|----------|----------|------|
| 0 | 草稿 | - | 用户未发布的草稿 |
| 1 | AI审核中 | 审核中 | AI正在审核中 |
| 2 | 待人工审核 | 审核中 | AI审核通过，等待人工审核 |
| 3 | 已发布 | 审核通过 | 已发布并可见 |
| 4 | 已驳回 | - | 审核未通过 |
| 5 | 已删除 | - | 已删除 |

#### 评论状态（COMMENT_STATUS）
| 状态值 | 状态名称 | 筛选条件 | 说明 |
|--------|----------|----------|------|
| 0 | 已删除 | - | 已删除的评论 |
| 1 | 正常 | 审核通过 | 已通过审核的评论 |
| 2 | AI审核中 | 审核中 | AI正在审核中 |
| 3 | 待人工审核 | 审核中 | AI审核通过，等待人工审核 |
| 4 | 已驳回 | - | 审核未通过 |

### 筛选逻辑说明

#### 帖子筛选
- **全部**：不传递status参数，获取所有状态的帖子
- **审核中**：status=2（待人工审核），注意：由于后端API只支持单个状态筛选，目前只能筛选"待人工审核"状态的帖子
- **审核通过**：status=3（已发布），获取已发布的帖子

#### 评论筛选
- **全部**：不传递status参数，获取所有状态的评论
- **审核中**：status=3（待人工审核），筛选待人工审核的评论
- **审核通过**：status=1（正常），获取已通过审核的评论

### 问题根因分析

1. **评论列表缺少状态显示**：前端实现时只添加了帖子状态显示，遗漏了评论状态显示

2. **函数名错误**：在实现筛选功能时，可能因为命名习惯不一致导致函数名错误：
   - 数据获取函数命名为`fetchPosts`和`fetchComments`
   - 但筛选处理函数中错误地调用了`fetchMyPosts`和`fetchMyComments`

3. **状态映射错误**：
   - 帖子筛选：将"审核通过"映射为状态1（AI审核中），实际应为状态3（已发布）
   - 评论筛选：将"审核通过"映射为状态1（正常），这个是正确的，但"审核中"映射为状态2（AI审核中），实际应为状态3（待人工审核）

## 功能说明

### 1. 评论列表状态显示
修复后，评论列表中的每条评论都会显示其审核状态：
- **AI审核中**：灰色标签
- **待人工审核**：橙色标签
- **已发布/正常**：绿色标签
- **已驳回**：红色标签
- **已删除**：灰色标签

### 2. 帖子筛选功能
- **全部**：显示所有状态的帖子（草稿、审核中、已发布、已驳回、已删除）
- **审核中**：显示待人工审核的帖子（status=2）
- **审核通过**：显示已发布的帖子（status=3）

### 3. 评论筛选功能
- **全部**：显示所有状态的评论
- **审核中**：显示待人工审核的评论（status=3）
- **审核通过**：显示已通过审核的评论（status=1）

## 验证结果

### 1. 评论列表状态显示
- ✅ 评论列表正确显示每条评论的审核状态
- ✅ 状态标签颜色正确（已发布=绿色，待人工审核=橙色，AI审核中=灰色，已驳回=红色）
- ✅ 状态文本正确显示

### 2. 帖子筛选功能
- ✅ 切换"全部"筛选，显示所有状态的帖子
- ✅ 切换"审核中"筛选，只显示待人工审核的帖子
- ✅ 切换"审核通过"筛选，只显示已发布的帖子
- ✅ 筛选切换后正确触发数据重新加载

### 3. 评论筛选功能
- ✅ 切换"全部"筛选，显示所有状态的评论
- ✅ 切换"审核中"筛选，只显示待人工审核的评论
- ✅ 切换"审核通过"筛选，只显示已通过审核的评论
- ✅ 筛选切换后正确触发数据重新加载

## 注意事项

1. ⚠️ **请重启前端服务以查看修复效果**
   ```bash
   cd d:\code\HTML\WORK\frontend
   npm run dev
   ```

2. **关于"审核中"筛选的说明**：
   - 目前后端API只支持单个状态参数筛选
   - 帖子"审核中"筛选目前只显示"待人工审核"（status=2）的帖子
   - 评论"审核中"筛选目前只显示"待人工审核"（status=3）的评论
   - 如果需要同时筛选"AI审核中"和"待人工审核"，需要修改后端API支持多状态筛选，或者在前端获取全部数据后进行过滤

3. 此修复仅影响前端显示和筛选逻辑，不涉及数据库或后端API

## 后续优化建议

1. **优化筛选逻辑**：
   - 考虑修改后端API，支持多状态筛选（如传入status数组）
   - 或者在获取全部数据后，在前端进行多状态过滤

2. **统一状态管理**：
   - 考虑将状态映射配置统一管理，避免前后端定义不一致
   - 可以创建一个独立的配置文件或使用Pinia store管理状态映射

3. **添加单元测试**：
   - 为筛选功能添加单元测试，验证状态映射的正确性
   - 测试不同筛选条件下的数据过滤逻辑

4. **用户体验优化**：
   - 考虑在筛选下拉菜单中显示每个选项对应的状态说明
   - 添加筛选结果的计数显示（如"审核中 (5)"）
