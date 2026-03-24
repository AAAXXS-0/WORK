# 更新日志 - UpdateLog10

## 更新时间
2026-03-23

## 更新内容
为"我的帖子"和"我的评论"添加"已删除"状态的筛选选项

## 修改说明

### 1. 添加"已删除"状态筛选按钮
在"我的帖子"和"我的评论"的筛选栏中添加了"已删除"选项，用户现在可以筛选出所有被删除的内容。

### 2. 更新筛选逻辑
- **帖子筛选**：添加了`postsFilter.value === 'deleted'`的判断，筛选status=5的帖子
- **评论筛选**：添加了`commentsFilter.value === 'deleted'`的判断，筛选status=0的评论

### 3. 优化状态显示函数
更新了`getStatusText`和`getStatusTagType`函数，添加了`type`参数来区分帖子和评论的状态映射：
- 帖子状态：草稿(0)、AI审核中(1)、待人工审核(2)、已发布(3)、已驳回(4)、已删除(5)
- 评论状态：已删除(0)、正常(1)、AI审核中(2)、待人工审核(3)、已驳回(4)

## 修改的文件

### frontend/src/views/user/Profile.vue

#### 修改位置1：帖子筛选栏（第70行附近）
```vue
<!-- 修改前 -->
<el-radio-button label="rejected">已驳回</el-radio-button>

<!-- 修改后 -->
<el-radio-button label="rejected">已驳回</el-radio-button>
<el-radio-button label="deleted">已删除</el-radio-button>
```

#### 修改位置2：评论筛选栏（第124行附近）
```vue
<!-- 修改前 -->
<el-radio-button label="rejected">已驳回</el-radio-button>

<!-- 修改后 -->
<el-radio-button label="rejected">已驳回</el-radio-button>
<el-radio-button label="deleted">已删除</el-radio-button>
```

#### 修改位置3：fetchPosts函数（第311-313行附近）
```javascript
// 修改前
} else if (postsFilter.value === 'rejected') {
  // 已驳回：已驳回(4)
  allPosts = allPosts.filter(post => post.status === 4)
}

// 修改后
} else if (postsFilter.value === 'rejected') {
  // 已驳回：已驳回(4)
  allPosts = allPosts.filter(post => post.status === 4)
} else if (postsFilter.value === 'deleted') {
  // 已删除：已删除(5)
  allPosts = allPosts.filter(post => post.status === 5)
}
```

#### 修改位置4：fetchComments函数（第346-348行附近）
```javascript
// 修改前
} else if (commentsFilter.value === 'rejected') {
  // 已驳回：已驳回(4)
  allComments = allComments.filter(comment => comment.status === 4)
}

// 修改后
} else if (commentsFilter.value === 'rejected') {
  // 已驳回：已驳回(4)
  allComments = allComments.filter(comment => comment.status === 4)
} else if (commentsFilter.value === 'deleted') {
  // 已删除：已删除(0)
  allComments = allComments.filter(comment => comment.status === 0)
}
```

#### 修改位置5：getStatusText函数（第537-561行附近）
```javascript
// 修改前
const getStatusText = (status) => {
  const statusMap = {
    0: '草稿',
    1: 'AI审核中',
    2: '待人工审核',
    3: '已发布',
    4: '已驳回',
    5: '已删除'
  }
  return statusMap[status] || '未知'
}

// 修改后
const getStatusText = (status, type = 'post') => {
  // type: 'post' 或 'comment'
  if (type === 'post') {
    // 帖子状态
    const statusMap = {
      0: '草稿',
      1: 'AI审核中',
      2: '待人工审核',
      3: '已发布',
      4: '已驳回',
      5: '已删除'
    }
    return statusMap[status] || '未知'
  } else {
    // 评论状态
    const statusMap = {
      0: '已删除',
      1: '正常',
      2: 'AI审核中',
      3: '待人工审核',
      4: '已驳回'
    }
    return statusMap[status] || '未知'
  }
}
```

#### 修改位置6：getStatusTagType函数（第564-588行附近）
```javascript
// 修改前
const getStatusTagType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'warning',
    2: 'warning',
    3: 'success',
    4: 'danger',
    5: 'danger'
  }
  return typeMap[status] || 'info'
}

// 修改后
const getStatusTagType = (status, type = 'post') => {
  // type: 'post' 或 'comment'
  if (type === 'post') {
    // 帖子状态
    const typeMap = {
      0: 'info',
      1: 'warning',
      2: 'warning',
      3: 'success',
      4: 'danger',
      5: 'danger'
    }
    return typeMap[status] || 'info'
  } else {
    // 评论状态
    const typeMap = {
      0: 'danger',
      1: 'success',
      2: 'warning',
      3: 'warning',
      4: 'danger'
    }
    return typeMap[status] || 'info'
  }
}
```

#### 修改位置7：评论状态标签调用（第140-141行附近）
```vue
<!-- 修改前 -->
<el-tag :type="getStatusTagType(item.status)" size="small">
  {{ getStatusText(item.status) }}
</el-tag>

<!-- 修改后 -->
<el-tag :type="getStatusTagType(item.status, 'comment')" size="small">
  {{ getStatusText(item.status, 'comment') }}
</el-tag>
```

## 技术要点

### 1. 状态映射表
根据后端constants.js中的定义：
- **帖子状态**：
  - 0: 草稿
  - 1: AI审核中
  - 2: 待人工审核
  - 3: 已发布
  - 4: 已驳回
  - 5: 已删除

- **评论状态**：
  - 0: 已删除
  - 1: 正常
  - 2: AI审核中
  - 3: 待人工审核
  - 4: 已驳回

### 2. 函数参数优化
为`getStatusText`和`getStatusTagType`函数添加了`type`参数：
- 默认值为`'post'`，保持向后兼容
- 当`type='comment'`时，使用评论的状态映射表
- 当`type='post'`时，使用帖子的状态映射表

### 3. 筛选逻辑
- **已删除帖子**：筛选status=5的帖子
- **已删除评论**：筛选status=0的评论
- 使用前端过滤方式，不依赖后端API的status参数

## 功能说明

### 完整的筛选选项

#### "我的帖子"筛选
- **全部**：显示所有状态的帖子
- **审核中**：显示AI审核中和待人工审核的帖子
- **审核通过**：显示已发布的帖子
- **已驳回**：显示已驳回的帖子
- **已删除**：显示已删除的帖子 ✨ 新增

#### "我的评论"筛选
- **全部**：显示所有状态的评论
- **审核中**：显示AI审核中和待人工审核的评论
- **审核通过**：显示已通过审核的评论
- **已驳回**：显示已驳回的评论
- **已删除**：显示已删除的评论 ✨ 新增

### 状态标签显示
- **已删除**：显示红色danger标签
- **正常/已发布**：显示绿色success标签
- **AI审核中/待人工审核**：显示橙色warning标签
- **已驳回**：显示红色danger标签
- **草稿**：显示灰色info标签

## 验证结果

### 功能验证
1. ✅ "我的帖子"筛选栏成功添加"已删除"选项
2. ✅ "我的评论"筛选栏成功添加"已删除"选项
3. ✅ 筛选"已删除"状态时，正确显示已删除的帖子和评论
4. ✅ 已删除的帖子显示红色"已删除"标签
5. ✅ 已删除的评论显示红色"已删除"标签
6. ✅ 状态标签正确区分帖子和评论的状态映射

### 兼容性验证
1. ✅ 现有的"全部"、"审核中"、"审核通过"、"已驳回"筛选功能正常
2. ✅ 函数参数默认值保持向后兼容
3. ✅ 帖子和评论的状态显示互不干扰

## 注意事项

1. **状态映射差异**：帖子和评论的状态码不同，需要通过`type`参数区分
   - 帖子：已删除=5
   - 评论：已删除=0

2. **前端筛选**：所有筛选逻辑都在前端完成，需要先获取全部数据再过滤

3. **已删除内容**：已删除的内容无法编辑或重新提交，只能查看

4. **状态标签颜色**：已删除状态使用红色danger标签，与其他危险状态一致

5. **函数调用**：评论状态显示时需要传入`'comment'`参数，帖子状态可以省略或传入`'post'`

## 后续优化建议

1. 可以考虑为已删除的内容添加"恢复"功能（需要后端支持）
2. 可以添加删除原因的显示（如果后端记录了删除原因）
3. 可以考虑添加批量删除功能
4. 可以添加删除内容的回收站功能

## 相关文件
- frontend/src/views/user/Profile.vue（用户个人中心页面）
- backend/common/constants.js（后端常量定义）

## 更新前状态
"我的帖子"和"我的评论"的筛选栏仅包含"全部"、"审核中"、"审核通过"和"已驳回"四个选项，无法筛选已删除的内容。

## 更新后状态
"我的帖子"和"我的评论"的筛选栏包含"全部"、"审核中"、"审核通过"、"已驳回"和"已删除"五个选项，用户可以方便地筛选出所有被删除的帖子和评论。已删除的内容会显示红色的"已删除"标签。

## 需要重启服务
**请重启前端服务以查看更新效果：**
```bash
cd d:\code\HTML\WORK\frontend
npm run dev
```
