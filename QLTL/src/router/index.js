import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layout/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: 'reports' },
        { path: 'reports', component: () => import('../views/ReportsView.vue'), name: 'reports' },
        { path: 'documents', component: () => import('../views/DocumentsView.vue'), name: 'documents' },
        { path: 'upload', component: () => import('../views/UploadView.vue'), name: 'upload' },
        { path: 'my-tasks', component: () => import('../views/MyTasksView.vue'), name: 'my-tasks' },
        { path: 'pending', component: () => import('../views/PendingView.vue'), name: 'pending' },
        { path: 'completed', component: () => import('../views/CompletedView.vue'), name: 'completed' },
        { path: 'users', component: () => import('../views/UsersView.vue'), name: 'users' },
        { path: 'roles', component: () => import('../views/RolesView.vue'), name: 'roles' },
        { path: 'settings', component: () => import('../views/SettingsView.vue'), name: 'settings' },
        { path: 'document/:id', component: () => import('../views/DocumentDetailView.vue'), name: 'document-detail' },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
