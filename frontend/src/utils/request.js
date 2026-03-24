import axios from 'axios'
import { ElMessage } from 'element-plus'
import auth from './auth'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000 // 将默认超时时间从5秒改为30秒，以支持文件上传
})

// 请求拦截器：自动添加 Token
request.interceptors.request.use(
  (config) => {
    const token = auth.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => {
    // 如果是文件下载请求（responseType为blob），直接返回响应数据
    if (response.config.responseType === 'blob') {
      return response
    }
    
    const res = response.data
    if (res.code !== 0) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(res)
    }
    return res
  },
  (error) => {
    ElMessage.error(error.message || '服务器异常')
    return Promise.reject(error)
  }
)

// 关键：必须用 default 导出
export default request