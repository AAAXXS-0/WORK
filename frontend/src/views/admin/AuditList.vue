<template>
<<<<<<< HEAD
    <div class="audit-list-page">
      <el-card>
        <h3>审核管理</h3>
        <el-divider></el-divider>
        
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <!-- 帖子审核 -->
          <el-tab-pane label="帖子审核" name="post">
            <el-table :data="postTableData" border style="width: 100%" v-loading="postLoading">
              <el-table-column prop="id" label="ID" width="80"></el-table-column>
              <el-table-column label="发布者" width="150">
                <template #default="scope">
                  <div>{{ scope.row.username }}</div>
                  <div class="student-id">{{ scope.row.studentId }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="内容" min-width="300"></el-table-column>
              <el-table-column label="图片" width="200">
                <template #default="scope">
                  <div v-if="scope.row.images && scope.row.images.length > 0" class="image-preview">
                    <el-image
                      v-for="(img, index) in scope.row.images.slice(0, 3)"
                      :key="index"
                      :src="getImageUrl(img)"
                      :preview-src-list="scope.row.images.map(img => getImageUrl(img))"
                      :initial-index="index"
                      fit="cover"
                      style="width: 50px; height: 50px; margin-right: 5px; border-radius: 4px;"
                      :preview-teleported="true"
                    />
                    <span v-if="scope.row.images.length > 3" style="font-size: 12px; color: #909399;">
                      +{{ scope.row.images.length - 3 }}
                    </span>
                  </div>
                  <el-tag v-else type="info">无图片</el-tag>
                </template>
              </el-table-column>
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
              <el-table-column prop="createTime" label="发布时间" width="180"></el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="passPostAudit(scope.row)">通过</el-button>
                  <el-button type="danger" size="small" @click="rejectPostAudit(scope.row)">驳回</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="postTableData.length === 0 && !postLoading" description="暂无待审核帖子"></el-empty>
          </el-tab-pane>
          
          <!-- 评论审核 -->
          <el-tab-pane label="评论审核" name="comment">
            <el-table :data="commentTableData" border style="width: 100%" v-loading="commentLoading">
              <el-table-column prop="id" label="ID" width="80"></el-table-column>
              <el-table-column label="评论者" width="150">
                <template #default="scope">
                  <div>{{ scope.row.username }}</div>
                  <div class="student-id">{{ scope.row.studentId }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="评论内容" min-width="300"></el-table-column>
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
              <el-table-column prop="createTime" label="发布时间" width="180"></el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="passCommentAudit(scope.row)">通过</el-button>
                  <el-button type="danger" size="small" @click="rejectCommentAudit(scope.row)">驳回</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="commentTableData.length === 0 && !commentLoading" description="暂无待审核评论"></el-empty>
          </el-tab-pane>
          
          <!-- 头像审核 -->
          <el-tab-pane label="头像审核" name="avatar">
            <el-table :data="avatarTableData" border style="width: 100%" v-loading="avatarLoading">
              <el-table-column prop="id" label="ID" width="80"></el-table-column>
              <el-table-column label="用户" width="150">
                <template #default="scope">
                  <div>{{ scope.row.username }}</div>
                  <div class="student-id">{{ scope.row.studentId }}</div>
                </template>
              </el-table-column>
              <el-table-column label="头像" width="150">
                <template #default="scope">
                  <el-avatar :size="80" :src="getImageUrl(scope.row.pendingAvatar || scope.row.avatar)">
                    {{ scope.row.username?.charAt(0) || 'U' }}
                  </el-avatar>
                </template>
              </el-table-column>
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
              <el-table-column prop="createTime" label="上传时间" width="180"></el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="passAvatarAudit(scope.row)">通过</el-button>
                  <el-button type="danger" size="small" @click="rejectAvatarAudit(scope.row)">驳回</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="avatarTableData.length === 0 && !avatarLoading" description="暂无待审核头像"></el-empty>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import request from '@/utils/request'
  
  const activeTab = ref('post')
  
  // 帖子审核相关
  const postTableData = ref([])
  const postLoading = ref(false)
  
  // 评论审核相关
  const commentTableData = ref([])
  const commentLoading = ref(false)
  
  // 头像审核相关
  const avatarTableData = ref([])
  const avatarLoading = ref(false)
  
  // 获取图片完整URL
  const getImageUrl = (imgPath) => {
    console.log('getImageUrl 输入:', imgPath)
    console.log('imgPath 类型:', typeof imgPath)
    
    // 如果已经是完整URL，直接返回
    if (imgPath && (imgPath.startsWith('http://') || imgPath.startsWith('https://'))) {
      console.log('返回完整URL:', imgPath)
      return imgPath
    }
    
    // 如果是相对路径，添加后端服务器地址
    const serverUrl = 'http://localhost:3000'
    const fullUrl = serverUrl + imgPath
    console.log('生成的完整URL:', fullUrl)
    return fullUrl
  }
  
  // 获取帖子审核状态文本
  const getPostStatusText = (status) => {
    console.log('status:', status)
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
  
  // 标签页切换
  const handleTabClick = (tab) => {
    console.log('标签页切换:', tab)
    console.log('标签页名称:', tab.props.name)
    if (tab.props.name === 'post') {
      console.log('调用 getPostAuditList()')
      getPostAuditList()
    } else if (tab.props.name === 'comment') {
      console.log('调用 getCommentAuditList()')
      getCommentAuditList()
    } else if (tab.props.name === 'avatar') {
      console.log('调用 getAvatarAuditList()')
      getAvatarAuditList()
    }
  }
  
  // 获取待审核帖子列表
  const getPostAuditList = async () => {
    postLoading.value = true
    try {
      const res = await request.get('/admin/audit/list')
      console.log('帖子审核列表响应:', res)
      if (res.code === 0) {
        postTableData.value = res.data.map(post => ({
          ...post,
          images: post.images || []
        }))
        console.log('处理后的postTableData:', postTableData.value)
      }
    } catch (error) {
      ElMessage.error('获取待审核帖子列表失败')
    } finally {
      postLoading.value = false
    }
  }
  
  // 获取待审核评论列表
  const getCommentAuditList = async () => {
    commentLoading.value = true
    try {
      const res = await request.get('/admin/comment-audit/list')
      console.log('评论审核列表响应:', res)
      if (res.code === 0) {
        // 后端返回的数据结构是 { list: [...], total: ... }
        commentTableData.value = res.data.list || []
        console.log('处理后的commentTableData:', commentTableData.value)
      }
    } catch (error) {
      ElMessage.error('获取待审核评论列表失败')
    } finally {
      commentLoading.value = false
    }
  }
  
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
  
  // 通过帖子审核
  const passPostAudit = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确认通过帖子 ${row.id} 的审核吗？`,
        '审核确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      
      await request.post('/admin/audit/do', {
        id: row.id,
        act: 'pass'
      })
      
      ElMessage.success(`帖子 ${row.id} 审核通过`)
      getPostAuditList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('审核通过失败')
      }
    }
  }
  
  // 驳回帖子审核
  const rejectPostAudit = async (row) => {
    try {
      const { value } = await ElMessageBox.prompt(
        '请输入驳回原因',
        '驳回确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '请输入驳回原因'
        }
      )
      
      await request.post('/admin/audit/do', {
        id: row.id,
        act: 'reject',
        reason: value
      })
      
      ElMessage.success(`帖子 ${row.id} 审核驳回`)
      getPostAuditList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('审核驳回失败')
      }
    }
  }
  
  // 通过评论审核
  const passCommentAudit = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确认通过评论 ${row.id} 的审核吗？`,
        '审核确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      
      await request.post('/admin/comment-audit/do', {
        id: row.id,
        act: 'pass'
      })
      
      ElMessage.success(`评论 ${row.id} 审核通过`)
      getCommentAuditList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('审核通过失败')
      }
    }
  }
  
  // 驳回评论审核
  const rejectCommentAudit = async (row) => {
    try {
      const { value } = await ElMessageBox.prompt(
        '请输入驳回原因',
        '驳回确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '请输入驳回原因'
        }
      )
      
      await request.post('/admin/comment-audit/do', {
        id: row.id,
        act: 'reject',
        reason: value
      })
      
      ElMessage.success(`评论 ${row.id} 审核驳回`)
      getCommentAuditList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('审核驳回失败')
      }
    }
  }
  
  // 通过头像审核
  const passAvatarAudit = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确认通过用户 ${row.username} 的头像审核吗？`,
        '审核确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      
      await request.post('/admin/avatar-audit/do', {
        id: row.id,
        act: 'pass'
      })
      
      ElMessage.success(`用户 ${row.username} 头像审核通过`)
      getAvatarAuditList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('审核通过失败')
      }
    }
  }
  
  // 驳回头像审核
  const rejectAvatarAudit = async (row) => {
    try {
      const { value } = await ElMessageBox.prompt(
        '请输入驳回原因',
        '驳回确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '请输入驳回原因'
        }
      )
      
      await request.post('/admin/avatar-audit/do', {
        id: row.id,
        act: 'reject',
        reason: value
      })
      
      ElMessage.success(`用户 ${row.username} 头像审核驳回`)
      getAvatarAuditList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('审核驳回失败')
      }
    }
  }
  
  onMounted(() => {
    getPostAuditList()
  })
  </script>
  
  <style scoped>
  .audit-list-page {
    padding: 20px;
  }
  
  .student-id {
    font-size: 12px;
    color: #909399;
  }
  
  .image-preview {
    display: flex;
    align-items: center;
  }
  </style>
=======
  <div class="audit-list-page">
    <el-card class="audit-card">
      <div class="card-title">
        <h3>🔍 审核管理</h3>
      </div>
      <el-divider></el-divider>

      <el-tabs
        v-model="activeTab"
        @tab-click="handleTabClick"
        class="audit-tabs"
      >
        <!-- 帖子审核 -->
        <el-tab-pane label="帖子审核" name="post">
          <el-table
            :data="postTableData"
            border
            style="width: 100%"
            v-loading="postLoading"
            class="audit-table"
          >
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column label="发布者" width="150">
              <template #default="scope">
                <div>{{ scope.row.username }}</div>
                <div class="student-id">{{ scope.row.studentId }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="content"
              label="内容"
              min-width="300"
            ></el-table-column>
            <el-table-column label="图片" width="200">
              <template #default="scope">
                <div
                  v-if="scope.row.images && scope.row.images.length > 0"
                  class="image-preview"
                >
                  <el-image
                    v-for="(img, index) in scope.row.images.slice(0, 3)"
                    :key="index"
                    :src="getImageUrl(img)"
                    :preview-src-list="
                      scope.row.images.map((img) => getImageUrl(img))
                    "
                    :initial-index="index"
                    fit="cover"
                    style="
                      width: 50px;
                      height: 50px;
                      margin-right: 5px;
                      border-radius: 4px;
                    "
                    :preview-teleported="true"
                  />
                  <span
                    v-if="scope.row.images.length > 3"
                    style="font-size: 12px; color: #909399"
                  >
                    +{{ scope.row.images.length - 3 }}
                  </span>
                </div>
                <el-tag v-else type="info">无图片</el-tag>
              </template>
            </el-table-column>
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
            <el-table-column
              prop="createTime"
              label="发布时间"
              width="180"
            ></el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  round
                  @click="passPostAudit(scope.row)"
                  >通过</el-button
                >
                <el-button
                  type="danger"
                  size="small"
                  round
                  @click="rejectPostAudit(scope.row)"
                  >驳回</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="postTableData.length === 0 && !postLoading"
            description="暂无待审核帖子"
          ></el-empty>
        </el-tab-pane>

        <!-- 评论审核 -->
        <el-tab-pane label="评论审核" name="comment">
          <el-table
            :data="commentTableData"
            border
            style="width: 100%"
            v-loading="commentLoading"
            class="audit-table"
          >
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column label="评论者" width="150">
              <template #default="scope">
                <div>{{ scope.row.username }}</div>
                <div class="student-id">{{ scope.row.studentId }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="content"
              label="评论内容"
              min-width="300"
            ></el-table-column>
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
            <el-table-column
              prop="createTime"
              label="发布时间"
              width="180"
            ></el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  round
                  @click="passCommentAudit(scope.row)"
                  >通过</el-button
                >
                <el-button
                  type="danger"
                  size="small"
                  round
                  @click="rejectCommentAudit(scope.row)"
                  >驳回</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="commentTableData.length === 0 && !commentLoading"
            description="暂无待审核评论"
          ></el-empty>
        </el-tab-pane>

        <!-- 头像审核 -->
        <el-tab-pane label="头像审核" name="avatar">
          <el-table
            :data="avatarTableData"
            border
            style="width: 100%"
            v-loading="avatarLoading"
            class="audit-table"
          >
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column label="用户" width="150">
              <template #default="scope">
                <div>{{ scope.row.username }}</div>
                <div class="student-id">{{ scope.row.studentId }}</div>
              </template>
            </el-table-column>
            <el-table-column label="头像" width="150">
              <template #default="scope">
                <el-avatar
                  :size="80"
                  :src="
                    getImageUrl(scope.row.pendingAvatar || scope.row.avatar)
                  "
                >
                  {{ scope.row.username?.charAt(0) || "U" }}
                </el-avatar>
              </template>
            </el-table-column>
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
            <el-table-column
              prop="createTime"
              label="上传时间"
              width="180"
            ></el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  round
                  @click="passAvatarAudit(scope.row)"
                  >通过</el-button
                >
                <el-button
                  type="danger"
                  size="small"
                  round
                  @click="rejectAvatarAudit(scope.row)"
                  >驳回</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="avatarTableData.length === 0 && !avatarLoading"
            description="暂无待审核头像"
          ></el-empty>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request";

const activeTab = ref("post");

// 帖子审核相关
const postTableData = ref([]);
const postLoading = ref(false);

// 评论审核相关
const commentTableData = ref([]);
const commentLoading = ref(false);

// 头像审核相关
const avatarTableData = ref([]);
const avatarLoading = ref(false);

// 获取图片完整URL
const getImageUrl = (imgPath) => {
  console.log("getImageUrl 输入:", imgPath);
  console.log("imgPath 类型:", typeof imgPath);

  if (
    imgPath &&
    (imgPath.startsWith("http://") || imgPath.startsWith("https://"))
  ) {
    console.log("返回完整URL:", imgPath);
    return imgPath;
  }

  const serverUrl = "http://localhost:3000";
  const fullUrl = serverUrl + imgPath;
  console.log("生成的完整URL:", fullUrl);
  return fullUrl;
};

// 获取帖子审核状态文本
const getPostStatusText = (status) => {
  console.log("status:", status);
  const statusNum = parseInt(status) || 0;
  const statusMap = {
    0: "草稿",
    1: "AI审核中",
    2: "待人工审核",
    3: "已发布",
    4: "已驳回",
    5: "已删除",
  };
  return statusMap[statusNum] || "未知";
};

// 获取帖子审核状态标签类型
const getPostStatusType = (status) => {
  const statusNum = parseInt(status) || 0;
  if (statusNum === 2) return "warning";
  if (statusNum === 3) return "success";
  if (statusNum === 4) return "danger";
  return "info";
};

// 获取评论审核状态文本
const getCommentStatusText = (status) => {
  const statusNum = parseInt(status) || 0;
  const statusMap = {
    0: "已删除",
    1: "正常",
    2: "AI审核中",
    3: "待人工审核",
    4: "已驳回",
  };
  return statusMap[statusNum] || "未知";
};

// 获取评论审核状态标签类型
const getCommentStatusType = (status) => {
  const statusNum = parseInt(status) || 0;
  if (statusNum === 3) return "warning";
  if (statusNum === 1) return "success";
  if (statusNum === 4) return "danger";
  return "info";
};

// 获取头像审核状态文本
const getAvatarStatusText = (status) => {
  const statusNum = parseInt(status) || 0;
  const statusMap = {
    0: "未上传",
    1: "审核中",
    2: "已通过",
    3: "已驳回",
  };
  return statusMap[statusNum] || "未知";
};

// 获取头像审核状态标签类型
const getAvatarStatusType = (status) => {
  const statusNum = parseInt(status) || 0;
  if (statusNum === 1) return "warning";
  if (statusNum === 2) return "success";
  if (statusNum === 3) return "danger";
  return "info";
};

// 标签页切换
const handleTabClick = (tab) => {
  console.log("标签页切换:", tab);
  console.log("标签页名称:", tab.props.name);
  if (tab.props.name === "post") {
    console.log("调用 getPostAuditList()");
    getPostAuditList();
  } else if (tab.props.name === "comment") {
    console.log("调用 getCommentAuditList()");
    getCommentAuditList();
  } else if (tab.props.name === "avatar") {
    console.log("调用 getAvatarAuditList()");
    getAvatarAuditList();
  }
};

// 获取待审核帖子列表
const getPostAuditList = async () => {
  postLoading.value = true;
  try {
    const res = await request.get("/admin/audit/list");
    console.log("帖子审核列表响应:", res);
    if (res.code === 0) {
      postTableData.value = res.data.map((post) => ({
        ...post,
        images: post.images || [],
      }));
      console.log("处理后的postTableData:", postTableData.value);
    }
  } catch (error) {
    ElMessage.error("获取待审核帖子列表失败");
  } finally {
    postLoading.value = false;
  }
};

// 获取待审核评论列表
const getCommentAuditList = async () => {
  commentLoading.value = true;
  try {
    const res = await request.get("/admin/comment-audit/list");
    console.log("评论审核列表响应:", res);
    if (res.code === 0) {
      commentTableData.value = res.data.list || [];
      console.log("处理后的commentTableData:", commentTableData.value);
    }
  } catch (error) {
    ElMessage.error("获取待审核评论列表失败");
  } finally {
    commentLoading.value = false;
  }
};

// 获取待审核头像列表
const getAvatarAuditList = async () => {
  avatarLoading.value = true;
  try {
    const res = await request.get("/admin/avatar-audit/list");
    console.log("头像审核列表响应:", res);
    if (res.code === 0) {
      avatarTableData.value = (res.data.list || []).map((item) => ({
        id: item.id,
        studentId: item.student_id,
        username: item.username,
        avatar: item.avatar,
        pendingAvatar: item.pending_avatar,
        avatarStatus: item.avatar_status,
        avatarAuditUserId: item.avatar_audit_user_id,
        avatarRejectReason: item.avatar_reject_reason,
      }));
      console.log("处理后的avatarTableData:", avatarTableData.value);
    }
  } catch (error) {
    ElMessage.error("获取待审核头像列表失败");
  } finally {
    avatarLoading.value = false;
  }
};

// 通过帖子审核
const passPostAudit = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认通过帖子 ${row.id} 的审核吗？`,
      "审核确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      },
    );

    await request.post("/admin/audit/do", {
      id: row.id,
      act: "pass",
    });

    ElMessage.success(`帖子 ${row.id} 审核通过`);
    getPostAuditList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("审核通过失败");
    }
  }
};

// 驳回帖子审核
const rejectPostAudit = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入驳回原因", "驳回确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: /.+/,
      inputErrorMessage: "请输入驳回原因",
    });

    await request.post("/admin/audit/do", {
      id: row.id,
      act: "reject",
      reason: value,
    });

    ElMessage.success(`帖子 ${row.id} 审核驳回`);
    getPostAuditList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("审核驳回失败");
    }
  }
};

// 通过评论审核
const passCommentAudit = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认通过评论 ${row.id} 的审核吗？`,
      "审核确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      },
    );

    await request.post("/admin/comment-audit/do", {
      id: row.id,
      act: "pass",
    });

    ElMessage.success(`评论 ${row.id} 审核通过`);
    getCommentAuditList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("审核通过失败");
    }
  }
};

// 驳回评论审核
const rejectCommentAudit = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入驳回原因", "驳回确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: /.+/,
      inputErrorMessage: "请输入驳回原因",
    });

    await request.post("/admin/comment-audit/do", {
      id: row.id,
      act: "reject",
      reason: value,
    });

    ElMessage.success(`评论 ${row.id} 审核驳回`);
    getCommentAuditList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("审核驳回失败");
    }
  }
};

// 通过头像审核
const passAvatarAudit = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认通过用户 ${row.username} 的头像审核吗？`,
      "审核确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      },
    );

    await request.post("/admin/avatar-audit/do", {
      id: row.id,
      act: "pass",
    });

    ElMessage.success(`用户 ${row.username} 头像审核通过`);
    getAvatarAuditList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("审核通过失败");
    }
  }
};

// 驳回头像审核
const rejectAvatarAudit = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入驳回原因", "驳回确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: /.+/,
      inputErrorMessage: "请输入驳回原因",
    });

    await request.post("/admin/avatar-audit/do", {
      id: row.id,
      act: "reject",
      reason: value,
    });

    ElMessage.success(`用户 ${row.username} 头像审核驳回`);
    getAvatarAuditList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("审核驳回失败");
    }
  }
};

onMounted(() => {
  getPostAuditList();
});
</script>

<style scoped>
/* 页面容器 + 背景图 */
.audit-list-page {
  padding: 25px;
  min-height: 100vh;
  position: relative;

  /* 本地背景图：放在 src/assets/a.png */
  background-image: url("../../assets/a.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 虚化遮罩：不挡内容 */
.audit-list-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(3px);
  z-index: 0;
}

/* 卡片在最上层 */
.audit-card {
  position: relative;
  z-index: 10;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.92);
}

/* 标题 */
.card-title {
  text-align: center;
  margin-top: 10px;
}
.card-title h3 {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 标签栏 */
.audit-tabs {
  margin-top: 10px;
  --el-tabs-active-tab-color: #1677ff;
}

/* 表格样式 */
.audit-table {
  --el-table-row-hover-bg-color: #f8f9ff;
  margin-top: 10px;
  border-radius: 10px;
  overflow: hidden;
}

/* 学号小字 */
.student-id {
  font-size: 12px;
  color: #909399;
}

/* 图片预览 */
.image-preview {
  display: flex;
  align-items: center;
}
</style>
>>>>>>> zhe-chen
