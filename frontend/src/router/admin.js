import AdminLayout from '../layouts/AdminLayout.vue'

export default [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'dashboard', component: () => import('../views/admin/Dashboard.vue'), name: 'AdminDashboard' },
      { path: 'audit', component: () => import('../views/admin/AuditList.vue'), name: 'AdminAudit' },
      { path: 'log', component: () => import('../views/admin/AuditLog.vue'), name: 'AdminAuditLog' },
      { path: 'user', component: () => import('../views/admin/UserManage.vue'), name: 'AdminUser' },
      { path: 'roster', component: () => import('../views/admin/RosterManage.vue'), name: 'AdminRoster' },
      { path: 'post', component: () => import('../views/admin/PostManage.vue'), name: 'AdminPost' },
      { path: 'comment', component: () => import('../views/admin/CommentManage.vue'), name: 'AdminComment' },
      { path: 'config', component: () => import('../views/admin/SystemConfig.vue'), name: 'AdminConfig' }
    ]
  }
]