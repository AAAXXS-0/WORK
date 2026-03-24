import UserLayout from '../layouts/UserLayout.vue'

export default [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('../views/user/Home.vue'), name: 'Home' },
      { path: '/publish', component: () => import('../views/user/Publish.vue'), name: 'Publish' },
      { path: '/profile', component: () => import('../views/user/Profile.vue'), name: 'Profile' },
      { path: '/post/:id', component: () => import('../views/user/PostDetail.vue'), name: 'PostDetail' }
    ]
  },
  {
    path: '/login',
    component: () => import('../views/user/Login.vue'),
    name: 'Login'
  },
  {
    path: '/register',
    component: () => import('../views/user/Register.vue'),
    name: 'Register'
  }
]