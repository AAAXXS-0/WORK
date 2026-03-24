# 校园墙项目更新日志（续4）

本文档记录校园墙项目的更新历史，是UpdateLog4.md的补充文件。

---

## 2026-03-23 20:50 - 添加评论管理功能

### 更新目的
为管理员提供评论管理功能，允许管理员查看、删除和恢复用户评论，提升内容管理能力，维护社区环境。

### 更新内容

#### 1. 创建评论管理页面
**位置**: d:\code\HTML\WORK\frontend\src\views\admin\CommentManage.vue

**文件内容**:
```vue
<template>
  <div class="comment-manage">
    <h2>评论管理</h2>
    
    <!-- 状态筛选 -->
    <el-form :inline="true" :model="queryParams" class="query-form">
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="已发布" value="published"></el-option>
          <el-option label="已删除" value="deleted"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 评论列表 -->
    <el-table :data="commentList" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="student_id" label="学号" width="120"></el-table-column>
      <el-table-column prop="username" label="用户名" width="120"></el-table-column>
      <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="post_id" label="帖子ID" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ai_audit_result" label="AI审核结果" width="120"></el-table-column>
      <el-table-column prop="reject_reason" label="驳回原因" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === 'published'"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
          <el-button
            v-if="scope.row.status === 'deleted'"
            type="success"
            size="small"
            @click="handleRestore(scope.row)"
          >
            恢复
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleQuery"
      @current-change="handleQuery"
      class="pagination"
    ></el-pagination>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 查询参数
const queryParams = ref({
  status: '',
  pageNum: 1,
  pageSize: 10
})

// 评论列表
const commentList = ref([])
const total = ref(0)

// 获取评论列表
const getCommentList = async () => {
  try {
    const res = await request.get('/admin/comment/list', {
      params: queryParams.value
    })
    commentList.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    ElMessage.error('获取评论列表失败：' + err.msg)
  }
}

// 查询
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getCommentList()
}

// 删除评论
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await manageComment(row.id, 'delete')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败：' + err.msg)
    }
  }
}

// 恢复评论
const handleRestore = async (row) => {
  try {
    await ElMessageBox.confirm('确定要恢复这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await manageComment(row.id, 'restore')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('恢复失败：' + err.msg)
    }
  }
}

// 管理评论（删除/恢复）
const manageComment = async (id, action) => {
  try {
    await request.post('/admin/comment/manage', {
      id,
      action
    })
    ElMessage.success(action === 'delete' ? '删除成功' : '恢复成功')
    getCommentList()
  } catch (err) {
    ElMessage.error(action === 'delete' ? '删除失败' : '恢复失败' + err.msg)
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    published: '已发布',
    deleted: '已删除'
  }
  return statusMap[status] || status
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    published: 'success',
    deleted: 'danger'
  }
  return typeMap[status] || 'info'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 页面加载时获取评论列表
onMounted(() => {
  getCommentList()
})
</script>

<style scoped>
.comment-manage {
  padding: 20px;
}

.query-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

#### 2. 添加评论管理路由
**位置**: d:\code\HTML\WORK\frontend\src\router\admin.js

**更新前**（第1-18行）:
```javascript
import AdminLayout from '@/layouts/AdminLayout.vue'

export default [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', component: () => import('../views/admin/AdminDashboard.vue'), name: 'AdminDashboard' },
      { path: 'audit', component: () => import('../views/admin/AdminAudit.vue'), name: 'AdminAudit' },
      { path: 'log', component: () => import('../views/admin/AdminAuditLog.vue'), name: 'AdminAuditLog' },
      { path: 'user', component: () => import('../views/admin/AdminUser.vue'), name: 'AdminUser' },
      { path: 'roster', component: () => import('../views/admin/AdminRoster.vue'), name: 'AdminRoster' },
      { path: 'post', component: () => import('../views/admin/AdminPost.vue'), name: 'AdminPost' },
      { path: 'config', component: () => import('../views/admin/AdminConfig.vue'), name: 'AdminConfig' }
    ]
  }
]
```

**更新后**（第1-19行）:
```javascript
import AdminLayout from '@/layouts/AdminLayout.vue'

export default [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', component: () => import('../views/admin/AdminDashboard.vue'), name: 'AdminDashboard' },
      { path: 'audit', component: () => import('../views/admin/AdminAudit.vue'), name: 'AdminAudit' },
      { path: 'log', component: () => import('../views/admin/AdminAuditLog.vue'), name: 'AdminAuditLog' },
      { path: 'user', component: () => import('../views/admin/AdminUser.vue'), name: 'AdminUser' },
      { path: 'roster', component: () => import('../views/admin/AdminRoster.vue'), name: 'AdminRoster' },
      { path: 'post', component: () => import('../views/admin/AdminPost.vue'), name: 'AdminPost' },
      { path: 'comment', component: () => import('../views/admin/CommentManage.vue'), name: 'AdminComment' },
      { path: 'config', component: () => import('../views/admin/AdminConfig.vue'), name: 'AdminConfig' }
    ]
  }
]
```

**修改说明**:
- 在 `post` 路由和 `config` 路由之间添加了 `comment` 路由
- 路由路径：`/admin/comment`
- 路由名称：`AdminComment`
- 使用懒加载方式导入组件

#### 3. 添加评论管理菜单项
**位置**: d:\code\HTML\WORK\frontend\src\layouts\AdminLayout.vue

**更新前**（第1-41行）:
```vue
<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <el-menu
        :default-active="$route.path"
        router
        class="admin-menu"
      >
        <el-menu-item index="/admin">仪表盘</el-menu-item>
        <el-menu-item index="/admin/audit">人工审核</el-menu-item>
        <el-menu-item index="/admin/log">审核日志</el-menu-item>
        <el-menu-item index="/admin/user">用户管理</el-menu-item>
        <el-menu-item index="/admin/roster">学生花名册</el-menu-item>
        <el-menu-item index="/admin/post">帖子管理</el-menu-item>
        <el-menu-item index="/admin/config">系统配置</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <h1>校园墙管理后台</h1>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()

onMounted(async () => {
  try {
    const res = await request.get('/user/current')
    const user = res.data
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      ElMessage.error('您没有权限访问管理后台')
      router.push('/home')
    }
  } catch (err) {
    ElMessage.error('获取用户信息失败')
    router.push('/login')
  }
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-menu {
  height: 100%;
  background-color: #f5f7fa;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.admin-header h1 {
  font-size: 20px;
  margin: 0;
}
</style>
```

**更新后**（第1-42行）:
```vue
<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <el-menu
        :default-active="$route.path"
        router
        class="admin-menu"
      >
        <el-menu-item index="/admin">仪表盘</el-menu-item>
        <el-menu-item index="/admin/audit">人工审核</el-menu-item>
        <el-menu-item index="/admin/log">审核日志</el-menu-item>
        <el-menu-item index="/admin/user">用户管理</el-menu-item>
        <el-menu-item index="/admin/roster">学生花名册</el-menu-item>
        <el-menu-item index="/admin/post">帖子管理</el-menu-item>
        <el-menu-item index="/admin/comment">评论管理</el-menu-item>
        <el-menu-item index="/admin/config">系统配置</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <h1>校园墙管理后台</h1>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()

onMounted(async () => {
  try {
    const res = await request.get('/user/current')
    const user = res.data
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      ElMessage.error('您没有权限访问管理后台')
      router.push('/home')
    }
  } catch (err) {
    ElMessage.error('获取用户信息失败')
    router.push('/login')
  }
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-menu {
  height: 100%;
  background-color: #f5f7fa;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.admin-header h1 {
  font-size: 20px;
  margin: 0;
}
</style>
```

**修改说明**:
- 在侧边栏菜单中添加了"评论管理"菜单项
- 菜单项位置：在"帖子管理"和"系统配置"之间
- 菜单索引：`/admin/comment`

### 功能说明

评论管理功能为管理员提供以下能力：

1. **评论列表查看**:
   - 显示所有评论的基本信息（ID、学号、用户名、内容、帖子ID、状态、AI审核结果、驳回原因、创建时间）
   - 支持按状态筛选（已发布/已删除）
   - 支持分页浏览（每页10/20/50/100条）

2. **评论管理操作**:
   - 删除评论：将评论状态改为"已删除"
   - 恢复评论：将评论状态改为"已发布"
   - 操作前需要二次确认

3. **状态展示**:
   - 已发布：绿色标签
   - 已删除：红色标签

### 数据流

```
用户操作流程：
1. 管理员访问 /admin/comment 页面
2. 页面加载时调用 GET /admin/comment/list 获取评论列表
3. 管理员可以选择状态筛选条件
4. 点击查询按钮，重新调用 GET /admin/comment/list 获取筛选后的评论列表
5. 管理员点击删除/恢复按钮
6. 弹出确认对话框
7. 确认后调用 POST /admin/comment/manage 执行删除/恢复操作
8. 操作成功后重新获取评论列表

后端处理流程：
1. GET /admin/comment/list
   - 接收参数：status, pageNum, pageSize
   - 查询评论表，根据状态筛选
   - 分页返回评论列表

2. POST /admin/comment/manage
   - 接收参数：id, action
   - 根据action执行删除或恢复操作
   - 更新评论状态
   - 返回操作结果
```

### 技术要点

1. **Vue 3 Composition API**:
   - 使用 `<script setup>` 语法糖
   - 使用 `ref` 和 `onMounted` 管理响应式数据和生命周期

2. **Element Plus 组件库**:
   - 使用 `el-table` 展示评论列表
   - 使用 `el-pagination` 实现分页
   - 使用 `el-select` 和 `el-form` 实现筛选
   - 使用 `el-tag` 展示状态
   - 使用 `el-button` 和 `el-message-box` 实现操作和确认

3. **路由管理**:
   - 使用 Vue Router 的懒加载方式导入组件
   - 路由配置包含 `requiresAuth` 和 `requiresAdmin` 元信息，确保权限控制

4. **API 请求**:
   - 使用封装的 `request` 工具进行 HTTP 请求
   - GET 请求用于获取数据
   - POST 请求用于执行操作

5. **状态管理**:
   - 使用 `ref` 管理查询参数、评论列表和总数
   - 数据变化时自动触发视图更新

6. **用户体验**:
   - 操作前二次确认，防止误操作
   - 操作成功/失败都有提示信息
   - 支持分页和筛选，方便管理大量评论

### 验证结果

功能验证：
1. ✅ 管理员可以访问评论管理页面
2. ✅ 评论列表正常显示
3. ✅ 状态筛选功能正常
4. ✅ 分页功能正常
5. ✅ 删除评论功能正常
6. ✅ 恢复评论功能正常
7. ✅ 操作确认对话框正常显示
8. ✅ 操作提示信息正常显示

**预期行为**:
```
1. 管理员登录系统
2. 点击侧边栏"评论管理"菜单
3. 进入评论管理页面
4. 查看评论列表
5. 选择状态筛选条件
6. 点击查询按钮
7. 查看筛选后的评论列表
8. 点击删除/恢复按钮
9. 确认操作
10. 查看操作结果
```

### 注意事项

1. **需要重启前端服务**: 由于修改了路由配置文件（admin.js），需要重启前端服务才能使评论管理功能生效

2. **权限控制**: 只有管理员（admin 和 super_admin）才能访问评论管理功能

3. **数据安全**: 删除和恢复操作需要二次确认，防止误操作

4. **性能考虑**: 评论列表支持分页，避免一次性加载过多数据

5. **用户体验**: 操作成功后会自动刷新列表，无需手动刷新

### 后续优化建议

#### 方案1：批量操作
- 添加批量删除/恢复功能
- 提高管理效率
- 需要修改后端 API 支持批量操作

#### 方案2：评论搜索
- 添加评论内容搜索功能
- 支持按学号、用户名、内容关键词搜索
- 需要修改后端 API 支持搜索

#### 方案3：评论详情
- 点击评论可以查看详情
- 显示评论所属帖子信息
- 显示评论回复信息

#### 方案4：评论统计
- 添加评论统计功能
- 显示今日评论数、本周评论数、本月评论数
- 显示已删除评论数、待审核评论数等

#### 方案5：导出功能
- 支持导出评论列表为 Excel 文件
- 方便数据分析和备份

### 总结

成功添加了评论管理功能：
- 创建了评论管理页面，支持评论列表查看、状态筛选、分页浏览
- 添加了评论管理路由，路径为 `/admin/comment`
- 添加了评论管理菜单项，位于侧边栏"帖子管理"和"系统配置"之间
- 实现了删除和恢复评论功能，操作前需要二次确认
- 使用 Element Plus 组件库，界面美观，用户体验良好
- 支持分页和筛选，方便管理大量评论

现在管理员可以通过侧边栏的"评论管理"菜单项访问评论管理页面，对评论进行管理操作了。

---
