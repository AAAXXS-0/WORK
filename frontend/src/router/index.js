import { createRouter, createWebHistory } from 'vue-router'
import userRoutes from './user'
import adminRoutes from './admin'
import auth from '../utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...userRoutes,
    ...adminRoutes,
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

// 关键：必须用 default 导出
export default router