import request from '@/utils/request'

export default {
  // 校园身份认证（学号+一卡通）
  auth(data) {
    return request.post('/auth/student', data)
  },
  // 登录
  login(data) {
    return request.post('/auth/login', data)
  },
  // 退出登录
  logout() {
    return request.post('/auth/logout')
  },
  // 获取用户信息
  getUserInfo() {
    return request.get('/auth/info')
  },
  // 更新用户头像
  updateAvatar(data) {
    return request.post('/auth/avatar', data)
  }
}

// 导出单独的函数以便在setup中使用
export const getUserInfo = () => {
  return request.get('/auth/info')
}

export const updateAvatar = (data) => {
  return request.post('/auth/avatar', data)
}