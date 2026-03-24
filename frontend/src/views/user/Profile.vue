<template>
  <div class="profile-page">
    <el-card class="user-info-card">
      <div class="user-info">
        <div class="avatar-section">
          <el-avatar :size="100" :src="getDisplayAvatar()" @click="handleAvatarClick">
            <img v-if="!getDisplayAvatar()" src="@/assets/default-avatar.png" alt="默认头像" />
          </el-avatar>
          <div class="avatar-status" v-if="userInfo.avatarStatus !== 2">
            <el-tag :type="getAvatarStatusTagType(userInfo.avatarStatus)" size="small">
              {{ getAvatarStatusText(userInfo.avatarStatus) }}
            </el-tag>
          </div>
          <input 
            ref="avatarInput" 
            type="file" 
            accept="image/*" 
            style="display: none" 
            @change="handleAvatarChange"
          />
          <div class="avatar-actions">
            <el-button size="small" @click="handleAvatarClick" :disabled="userInfo.avatarStatus === 1">
              {{ userInfo.avatarStatus === 1 ? '审核中' : '更换头像' }}
            </el-button>
          </div>
        </div>
        <div class="user-details">
          <h2>{{ userInfo.username }}</h2>
          <p>学号：{{ userInfo.studentId }}</p>
          <div class="avatar-reject-reason" v-if="userInfo.avatarStatus === 3 && userInfo.avatarRejectReason">
            <el-alert type="error" :closable="false" show-icon>
              <template #title>
                <span>头像驳回理由：{{ userInfo.avatarRejectReason }}</span>
              </template>
            </el-alert>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="content-card">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="历史浏览" name="history">
          <div v-if="historyLoading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="historyList.length === 0" class="empty-container">
            <el-empty description="暂无历史浏览记录"></el-empty>
          </div>
          <div v-else class="post-list">
            <div v-for="item in historyList" :key="item.id" class="post-item">
              <div class="post-title" @click="goToPost(item.postId)">
                <h4>{{ truncateContent(item.content) }}</h4>
              </div>
              <p class="post-content">{{ item.content }}</p>
              <div class="post-meta">
                <span>{{ formatDate(item.viewTime) }}</span>
                <el-button type="danger" size="small" @click="deleteViewHistory(item.postId)">删除</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的帖子" name="posts">
          <div class="filter-bar">
            <el-radio-group v-model="postsFilter" @change="handlePostsFilterChange" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="auditing">审核中</el-radio-button>
              <el-radio-button label="approved">审核通过</el-radio-button>
              <el-radio-button label="rejected">已驳回</el-radio-button>
              <el-radio-button label="deleted">已删除</el-radio-button>
            </el-radio-group>
          </div>
          <div v-if="postsLoading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="postsList.length === 0" class="empty-container">
            <el-empty description="暂无发布的帖子"></el-empty>
          </div>
          <div v-else class="post-list">
            <div v-for="item in postsList" :key="item.id" class="post-item">
              <div class="post-header">
                <h4 class="post-title" @click="goToPost(item.id)">{{ truncateContent(item.content) }}</h4>
                <el-tag :type="getStatusTagType(item.status)" size="small">
                  {{ getStatusText(item.status) }}
                </el-tag>
              </div>
              <div class="post-thumbnail" v-if="item.images && item.images.length > 0" @click="goToPost(item.id)">
                <img :src="getImageUrl(item.images[0])" alt="帖子缩略图" class="thumbnail-img">
                <span class="image-count" v-if="item.images.length > 1">+{{ item.images.length - 1 }}</span>
              </div>
              <div class="post-content">{{ item.content }}</div>
              <div class="post-reject-reason" v-if="item.rejectReason">
                <el-alert type="error" :closable="false" show-icon>
                  <template #title>
                    <span>驳回理由：{{ item.rejectReason }}</span>
                  </template>
                </el-alert>
              </div>
              <div class="post-meta">
                <span>{{ formatDate(item.createTime) }}</span>
                <div class="post-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="handleEditPost(item)"
                    v-if="item.status === 4 || item.status === 5"
                  >
                    编辑
                  </el-button>
                  <el-button size="small" @click="goToPost(item.id)">查看详情</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的评论" name="comments">
          <div class="filter-bar">
            <el-radio-group v-model="commentsFilter" @change="handleCommentsFilterChange" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="auditing">审核中</el-radio-button>
              <el-radio-button label="approved">审核通过</el-radio-button>
              <el-radio-button label="rejected">已驳回</el-radio-button>
              <el-radio-button label="deleted">已删除</el-radio-button>
            </el-radio-group>
          </div>
          <div v-if="commentsLoading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="commentsList.length === 0" class="empty-container">
            <el-empty description="暂无发布的评论"></el-empty>
          </div>
          <div v-else class="comment-list">
            <div v-for="item in commentsList" :key="item.id" class="comment-item">
              <div class="comment-header">
                <div class="comment-post-title" @click="goToPost(item.postId)">
                  帖子：{{ item.postTitle }}
                </div>
                <el-tag :type="getStatusTagType(item.status, 'comment')" size="small">
                  {{ getStatusText(item.status, 'comment') }}
                </el-tag>
              </div>
              <div class="comment-content">{{ item.content }}</div>
              <div class="comment-meta">
                <span>{{ formatDate(item.createTime) }}</span>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="deleteComment(item.id)"
                  v-if="item.status !== 0"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 头像预览对话框 -->
    <el-dialog v-model="avatarPreviewVisible" title="头像预览" width="400px">
      <div class="avatar-preview">
        <img :src="previewAvatarUrl" alt="头像预览" />
      </div>
      <template #footer>
        <el-button @click="avatarPreviewVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAvatarUpload">确认上传</el-button>
      </template>
    </el-dialog>

    <!-- 编辑帖子对话框 -->
    <el-dialog v-model="editPostVisible" title="编辑帖子" width="600px">
      <el-form :model="editPostForm" label-width="80px">
        <el-form-item label="帖子内容">
          <el-input
            v-model="editPostForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入帖子内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="图片上传">
          <el-upload
            v-model:file-list="editPostForm.imageList"
            :action="uploadUrl"
            list-type="picture-card"
            :on-success="handleImageUploadSuccess"
            :on-remove="handleImageRemove"
            :limit="9"
            :before-upload="beforeImageUpload"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editPostVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditPost" :loading="editPostLoading">确认编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getUserInfo, updateAvatar } from '@/api/auth'
import { getUserPosts, updatePost } from '@/api/post'
import { getUserComments, deleteComment as deleteCommentApi } from '@/api/comment'
import { getViewHistory, deleteViewHistory as deleteViewHistoryApi } from '@/api/viewHistory'
import { uploadAvatar } from '@/api/upload'

const router = useRouter()

// 用户信息
const userInfo = ref({
  username: '',
  studentId: '',
  avatar: ''
})
const defaultAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

// 当前激活的标签页
const activeTab = ref('history')

// 帖子筛选
const postsFilter = ref('all')

// 评论筛选
const commentsFilter = ref('all')

// 历史浏览
const historyList = ref([])
const historyLoading = ref(false)

// 我的帖子
const postsList = ref([])
const postsLoading = ref(false)

// 我的评论
const commentsList = ref([])
const commentsLoading = ref(false)

// 头像上传相关
const avatarInput = ref(null)
const avatarPreviewVisible = ref(false)
const previewAvatarUrl = ref('')
const selectedAvatarFile = ref(null)

// 编辑帖子相关
const editPostVisible = ref(false)
const editPostLoading = ref(false)
const editPostForm = ref({
  postId: null,
  content: '',
  imageList: [],
  images: []
})
const uploadUrl = ref('http://localhost:3000/upload/post')

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo()
    if (res.code === 0) {
      userInfo.value = res.data
    }
    console.log('获取用户信息成功')
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

// 获取历史浏览记录
const fetchHistory = async () => {
  historyLoading.value = true
  try {
    const res = await getViewHistory({ pageNum: 1, pageSize: 20 })
    if (res.code === 0) {
      historyList.value = res.data.list || []
    }
  } catch (error) {
    ElMessage.error('获取历史浏览失败')
  } finally {
    historyLoading.value = false
  }
}

// 获取我的帖子
const fetchPosts = async () => {
  postsLoading.value = true
  try {
    // 不传status参数，获取全部帖子
    const res = await getUserPosts({})
    console.log('获取我的帖子返回数据:', res)
    console.log('res.data:', res.data)
    console.log('res.data.list:', res.data?.list)
    if (res.code === 0) {
      let allPosts = res.data.list || []
      // 在前端根据筛选条件过滤
      if (postsFilter.value !== 'all') {
        if (postsFilter.value === 'auditing') {
          // 审核中：AI审核中(1) + 待人工审核(2)
          allPosts = allPosts.filter(post => post.status === 1 || post.status === 2)
        } else if (postsFilter.value === 'approved') {
          // 审核通过：已发布(3)
          allPosts = allPosts.filter(post => post.status === 3)
        } else if (postsFilter.value === 'rejected') {
          // 已驳回：已驳回(4)
          allPosts = allPosts.filter(post => post.status === 4)
        } else if (postsFilter.value === 'deleted') {
          // 已删除：已删除(5)
          allPosts = allPosts.filter(post => post.status === 5)
        }
      }
      postsList.value = allPosts
      console.log('postsList.value:', postsList.value)
    }
  } catch (error) {
    console.error('获取我的帖子失败:', error)
    ElMessage.error('获取我的帖子失败')
  } finally {
    postsLoading.value = false
  }
}

// 获取我的评论
const fetchComments = async () => {
  commentsLoading.value = true
  try {
    // 不传status参数，获取全部评论
    const res = await getUserComments({})
    console.log('获取我的评论返回数据:', res)
    console.log('res.data:', res.data)
    console.log('res.data.list:', res.data?.list)
    if (res.code === 0) {
      let allComments = res.data.list || []
      console.log('处理前的评论列表:', allComments)
      if (allComments.length > 0) {
        console.log('第一条评论:', allComments[0])
        console.log('第一条评论的status值:', allComments[0].status)
        console.log('第一条评论的status类型:', typeof allComments[0].status)
        console.log('第一条评论的status === 0:', allComments[0].status === 0)
        console.log('第一条评论的status === "0":', allComments[0].status === "0")
        console.log('第一条评论的status == 0:', allComments[0].status == 0)
        console.log('第一条评论的Number(status):', Number(allComments[0].status))
      }
      // 在前端根据筛选条件过滤
      if (commentsFilter.value !== 'all') {
        if (commentsFilter.value === 'auditing') {
          // 审核中：AI审核中(2) + 待人工审核(3)
          allComments = allComments.filter(comment => comment.status === 2 || comment.status === 3)
        } else if (commentsFilter.value === 'approved') {
          // 审核通过：正常(1)
          allComments = allComments.filter(comment => comment.status === 1)
        } else if (commentsFilter.value === 'rejected') {
          // 已驳回：已驳回(4)
          allComments = allComments.filter(comment => comment.status === 4)
        } else if (commentsFilter.value === 'deleted') {
          // 已删除：已删除(0)
          allComments = allComments.filter(comment => comment.status === 0)
        }
      }
      commentsList.value = allComments
      console.log('处理后的评论列表:', commentsList.value)
    }
  } catch (error) {
    console.error('获取我的评论失败:', error)
    ElMessage.error('获取我的评论失败')
  } finally {
    commentsLoading.value = false
  }
}

// 标签页切换
const handleTabClick = (tab) => {
  if (tab.name === 'history') {
    fetchHistory()
  } else if (tab.name === 'posts') {
    fetchPosts()
  } else if (tab.name === 'comments') {
    fetchComments()
  }
}

// 点击头像
const handleAvatarClick = () => {
  avatarInput.value.click()
}

// 头像文件选择
const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    // 清空文件选择
    event.target.value = ''
    return
  }

  // 验证文件大小（限制为2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB')
    // 清空文件选择
    event.target.value = ''
    return
  }

  // 释放之前的预览URL（如果存在）
  if (previewAvatarUrl.value) {
    URL.revokeObjectURL(previewAvatarUrl.value)
  }

  selectedAvatarFile.value = file
  previewAvatarUrl.value = URL.createObjectURL(file)
  avatarPreviewVisible.value = true
}

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

// 删除评论
const deleteComment = async (commentId) => {
  try {
    console.log('准备删除评论，评论ID:', commentId)
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    console.log('开始调用删除API')
    const res = await deleteCommentApi(commentId)
    console.log('删除API返回结果:', res)
    console.log('res.code:', res.code)
    console.log('res.msg:', res.msg)
    console.log('res.data:', res.data)
    
    if (res.code === 0) {
      ElMessage.success('删除成功')
      console.log('删除成功，准备重新加载评论列表')
      fetchComments() // 重新加载评论列表
    } else {
      console.error('删除失败，code不为0:', res)
      ElMessage.error('删除失败：' + (res.msg || '未知错误'))
    }
  } catch (error) {
    console.error('删除评论异常:', error)
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 删除浏览历史
const deleteViewHistory = async (postId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条浏览记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteViewHistoryApi(postId)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      fetchHistory() // 重新加载浏览历史列表
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 跳转到帖子详情
const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

// 格式化时间
const formatDate = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 处理帖子筛选变化
const handlePostsFilterChange = () => {
  fetchPosts()
}

// 处理评论筛选变化
const handleCommentsFilterChange = () => {
  fetchComments()
}

// 截取内容作为标题
const truncateContent = (content) => {
  if (!content) return '无标题'
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}

// 获取完整的图片URL
const getImageUrl = (url) => {
  if (!url) return ''
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 否则添加后端服务器地址
  return `http://localhost:3000${url}`
}

// 获取状态文本（支持帖子和评论）
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

// 获取状态标签类型（支持帖子和评论）
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

// 获取头像审核状态文本
const getAvatarStatusText = (status) => {
  const statusMap = {
    0: '未上传',
    1: '审核中',
    2: '已通过',
    3: '已驳回'
  }
  return statusMap[status] || '未知'
}

// 获取头像审核状态标签类型
const getAvatarStatusTagType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

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

// 处理编辑帖子
const handleEditPost = (post) => {
  editPostForm.value.postId = post.id
  editPostForm.value.content = post.content
  editPostForm.value.images = post.images || []
  editPostForm.value.imageList = post.images.map((url, index) => ({
    name: `image-${index}`,
    url: getImageUrl(url),
    response: { url: url }
  }))
  editPostVisible.value = true
}

// 图片上传成功
const handleImageUploadSuccess = (response, file, fileList) => {
  if (response.code === 0 && response.data && response.data.url) {
    editPostForm.value.images.push(response.data.url)
  }
}

// 图片删除
const handleImageRemove = (file, fileList) => {
  const index = editPostForm.value.images.indexOf(file.response?.url)
  if (index > -1) {
    editPostForm.value.images.splice(index, 1)
  }
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 确认编辑帖子
const confirmEditPost = async () => {
  if (!editPostForm.value.content.trim()) {
    ElMessage.warning('请输入帖子内容')
    return
  }

  editPostLoading.value = true
  try {
    const res = await updatePost({
      postId: editPostForm.value.postId,
      content: editPostForm.value.content,
      images: editPostForm.value.images
    })

    if (res.code === 0) {
      ElMessage.success('帖子编辑成功，已重新提交审核')
      editPostVisible.value = false
      // 重新加载帖子列表
      await fetchPosts()
    } else {
      ElMessage.error(res.msg || '编辑失败')
    }
  } catch (error) {
    console.error('编辑帖子失败:', error)
    ElMessage.error('编辑失败')
  } finally {
    editPostLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchUserInfo()
  fetchHistory()
  fetchPosts()
  fetchComments()  // 新增：自动加载评论数据
})
</script>

<style scoped>
.profile-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.user-info-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-status {
  margin-top: 5px;
}

.avatar-reject-reason {
  margin-top: 10px;
}

.avatar-actions {
  margin-top: 10px;
}

.user-details h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.user-details p {
  margin: 5px 0;
  color: #666;
}

.content-card {
  min-height: 500px;
}

.loading-container,
.empty-container {
  padding: 40px 0;
}

.post-list,
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-item,
.comment-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.post-item:hover,
.comment-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-title {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
  margin-right: 10px;
}

.post-title:hover {
  color: #409eff;
  text-decoration: underline;
}

.post-thumbnail {
  position: relative;
  display: inline-block;
  margin: 10px 0;
  cursor: pointer;
}

.thumbnail-img {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.image-count {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.post-reject-reason {
  margin: 10px 0;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.post-item h4,
.comment-post-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-title {
  color: #409eff;
  cursor: pointer;
}

.post-title:hover {
  text-decoration: underline;
}

.post-content,
.comment-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
}

.post-meta,
.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 12px;
}

.avatar-preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
}
</style>
