// Token 存储
const TOKEN_KEY = 'campus-wall-token'

export default {
  // 保存Token
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  // 获取Token
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  // 清除Token
  clearToken() {
    localStorage.removeItem(TOKEN_KEY)
  },
  // 判断是否登录
  isLogin() {
    return !!this.getToken()
  },
  // 权限校验
  hasPermission(role) {
    const userRole = localStorage.getItem('user-role') || 'user'
    return role.includes(userRole)
  },
  // 新增：保存用户信息
  setUser(user) {
    localStorage.setItem('user-info', JSON.stringify(user))
  },
  // 新增：获取用户信息
  getUser() {
    return JSON.parse(localStorage.getItem('user-info') || '{}')
  }
}