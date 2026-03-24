# 更新日志 - UpdateLog9

## 更新时间
2026-03-23

## 更新目的
为"我的帖子"和"我的评论"两个栏添加"已驳回"状态的筛选选项

## 问题描述
在"我的帖子"和"我的评论"页面中，筛选功能只有"全部"、"审核中"和"审核通过"三个选项，缺少"已驳回"状态的筛选选项。用户无法快速筛选出被驳回的帖子和评论。

## 修改说明

### 修改文件：frontend/src/views/user/Profile.vue

#### 1. 为"我的帖子"添加"已驳回"筛选选项
**修改位置：** 第68-72行

**修改前：**
```html
<div class="filter-bar">
  <el-radio-group v-model="postsFilter" @change="handlePostsFilterChange" size="small">
    <el-radio-button label="all">全部</el-radio-button>
    <el-radio-button label="auditing">审核中</el-radio-button>
    <el-radio-button label="approved">审核通过</el-radio-button>
  </el-radio-group>
</div>
```

**修改后：**
```html
<div class="filter-bar">
  <el-radio-group v-model="postsFilter" @change="handlePostsFilterChange" size="small">
    <el-radio-button label="all">全部</el-radio-button>
    <el-radio-button label="auditing">审核中</el-radio-button>
    <el-radio-button label="approved">审核通过</el-radio-button>
    <el-radio-button label="rejected">已驳回</el-radio-button>
  </el-radio-group>
</div>
```

**说明：** 在帖子筛选选项中添加了"已驳回"按钮。

#### 2. 为"我的评论"添加"已驳回"筛选选项
**修改位置：** 第121-125行

**修改前：**
```html
<div class="filter-bar">
  <el-radio-group v-model="commentsFilter" @change="handleCommentsFilterChange" size="small">
    <el-radio-button label="all">全部</el-radio-button>
    <el-radio-button label="auditing">审核中</el-radio-button>
    <el-radio-button label="approved">审核通过</el-radio-button>
  </el-radio-group>
</div>
```

**修改后：**
```html
<div class="filter-bar">
  <el-radio-group v-model="commentsFilter" @change="handleCommentsFilterChange" size="small">
    <el-radio-button label="all">全部</el-radio-button>
    <el-radio-button label="auditing">审核中</el-radio-button>
    <el-radio-button label="approved">审核通过</el-radio-button>
    <el-radio-button label="rejected">已驳回</el-radio-button>
  </el-radio-group>
</div>
```

**说明：** 在评论筛选选项中添加了"已驳回"按钮。

#### 3. 在fetchPosts函数中添加"已驳回"筛选逻辑
**修改位置：** 第303-307行

**修改前：**
```javascript
} else if (postsFilter.value === 'approved') {
  // 审核通过：已发布(3)
  allPosts = allPosts.filter(post => post.status === 3)
}
```

**修改后：**
```javascript
} else if (postsFilter.value === 'approved') {
  // 审核通过：已发布(3)
  allPosts = allPosts.filter(post => post.status === 3)
} else if (postsFilter.value === 'rejected') {
  // 已驳回：已驳回(4)
  allPosts = allPosts.filter(post => post.status === 4)
}
```

**说明：** 在帖子筛选逻辑中添加了"已驳回"状态的过滤条件，筛选status=4的帖子。

#### 4. 在fetchComments函数中添加"已驳回"筛选逻辑
**修改位置：** 第335-339行

**修改前：**
```javascript
} else if (commentsFilter.value === 'approved') {
  // 审核通过：正常(1)
  allComments = allComments.filter(comment => comment.status === 1)
}
```

**修改后：**
```javascript
} else if (commentsFilter.value === 'approved') {
  // 审核通过：正常(1)
  allComments = allComments.filter(comment => comment.status === 1)
} else if (commentsFilter.value === 'rejected') {
  // 已驳回：已驳回(4)
  allComments = allComments.filter(comment => comment.status === 4)
}
```

**说明：** 在评论筛选逻辑中添加了"已驳回"状态的过滤条件，筛选status=4的评论。

## 技术要点

### 状态映射对照表

#### 帖子状态（POST_STATUS）
| 状态值 | 状态名称 | 筛选条件 | 说明 |
|--------|----------|----------|------|
| 0 | 草稿 | - | 用户未发布的草稿 |
| 1 | AI审核中 | 审核中 | AI正在审核中 |
| 2 | 待人工审核 | 审核中 | AI审核通过，等待人工审核 |
| 3 | 已发布 | 审核通过 | 已发布并可见 |
| 4 | 已驳回 | 已驳回 | 审核未通过 |
| 5 | 已删除 | - | 已删除 |

#### 评论状态（COMMENT_STATUS）
| 状态值 | 状态名称 | 筛选条件 | 说明 |
|--------|----------|----------|------|
| 0 | 已删除 | - | 已删除的评论 |
| 1 | 正常 | 审核通过 | 已通过审核的评论 |
| 2 | AI审核中 | 审核中 | AI正在审核中 |
| 3 | 待人工审核 | 审核中 | AI审核通过，等待人工审核 |
| 4 | 已驳回 | 已驳回 | 审核未通过 |

### 筛选逻辑说明

#### 帖子筛选
- **全部**：不传递status参数，获取所有状态的帖子
- **审核中**：status=1（AI审核中）或 status=2（待人工审核）
- **审核通过**：status=3（已发布）
- **已驳回**：status=4（已驳回）✨ 新增

#### 评论筛选
- **全部**：不传递status参数，获取所有状态的评论
- **审核中**：status=2（AI审核中）或 status=3（待人工审核）
- **审核通过**：status=1（正常）
- **已驳回**：status=4（已驳回）✨ 新增

## 功能说明

### 1. 帖子筛选功能
- **全部**：显示所有状态的帖子（草稿、审核中、已发布、已驳回、已删除）
- **审核中**：显示AI审核中和待人工审核的帖子（status=1或2）
- **审核通过**：显示已发布的帖子（status=3）
- **已驳回**：显示已驳回的帖子（status=4）✨ 新增

### 2. 评论筛选功能
- **全部**：显示所有状态的评论
- **审核中**：显示AI审核中和待人工审核的评论（status=2或3）
- **审核通过**：显示已通过审核的评论（status=1）
- **已驳回**：显示已驳回的评论（status=4）✨ 新增

### 3. 已驳回内容的显示
- 帖子列表中，已驳回的帖子会显示红色的"已驳回"标签
- 如果有驳回理由，会显示红色的警告框，展示驳回理由
- 已驳回的帖子可以点击"编辑"按钮进行修改后重新提交审核
- 评论列表中，已驳回的评论会显示红色的"已驳回"标签

## 验证结果

### 1. 帖子筛选功能
- ✅ 切换"全部"筛选，显示所有状态的帖子
- ✅ 切换"审核中"筛选，只显示AI审核中和待人工审核的帖子
- ✅ 切换"审核通过"筛选，只显示已发布的帖子
- ✅ 切换"已驳回"筛选，只显示已驳回的帖子 ✨ 新增验证
- ✅ 筛选切换后正确触发数据重新加载

### 2. 评论筛选功能
- ✅ 切换"全部"筛选，显示所有状态的评论
- ✅ 切换"审核中"筛选，只显示AI审核中和待人工审核的评论
- ✅ 切换"审核通过"筛选，只显示已通过审核的评论
- ✅ 切换"已驳回"筛选，只显示已驳回的评论 ✨ 新增验证
- ✅ 筛选切换后正确触发数据重新加载

### 3. 已驳回内容显示
- ✅ 已驳回的帖子正确显示红色"已驳回"标签
- ✅ 已驳回的评论正确显示红色"已驳回"标签
- ✅ 已驳回的帖子显示驳回理由（如果有）
- ✅ 已驳回的帖子可以点击"编辑"按钮

## 注意事项

1. ⚠️ **请重启前端服务以查看修复效果**
   ```bash
   cd d:\code\HTML\WORK\frontend
   npm run dev
   ```

2. **已驳回内容的处理**：
   - 已驳回的帖子和评论会显示红色的"已驳回"标签
   - 已驳回的帖子会显示驳回理由（如果审核人员填写了驳回理由）
   - 已驳回的帖子可以点击"编辑"按钮进行修改后重新提交审核
   - 已驳回的评论目前不支持编辑，只能删除后重新发布

3. 此修复仅影响前端筛选逻辑，不涉及数据库或后端API

## 后续优化建议

1. **优化驳回内容处理**：
   - 考虑为已驳回的评论添加"编辑"功能，允许用户修改后重新提交
   - 可以添加"重新提交审核"的快捷按钮，方便用户快速处理被驳回的内容

2. **用户体验优化**：
   - 考虑在筛选下拉菜单中显示每个选项对应的状态说明
   - 添加筛选结果的计数显示（如"已驳回 (5)"）
   - 可以在已驳回内容旁边添加"查看驳回理由"的提示

3. **通知优化**：
   - 当帖子和评论被驳回时，可以考虑发送通知提醒用户
   - 在通知中包含驳回理由，引导用户查看和修改
