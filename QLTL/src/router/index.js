import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layout/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'

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
        { path: '', redirect: 'documents' },
        { path: 'reports', component: () => import('../views/ReportsView.vue'), name: 'reports', meta: { permission: PERMISSIONS.REPORTS_OVERVIEW } },
        { path: 'documents', component: () => import('../views/DocumentsView.vue'), name: 'documents', meta: { permission: PERMISSIONS.DOCUMENTS_LIST } },
        // upload route removed; handled as dialog in documents view
        { path: 'my-tasks', component: () => import('../views/MyTasksView.vue'), name: 'my-tasks' },
        { path: 'tasks', component: () => import('../views/TasksManagementView.vue'), name: 'tasks' },
        { path: 'task/:id', component: () => import('../views/TaskDetailView.vue'), name: 'task-detail' },
        { path: 'pending', component: () => import('../views/PendingView.vue'), name: 'pending', meta: { permission: PERMISSIONS.DOCUMENTS_APPROVE } },
        { path: 'completed', component: () => import('../views/CompletedView.vue'), name: 'completed' },
        { path: 'users', component: () => import('../views/UsersView.vue'), name: 'users', meta: { permission: PERMISSIONS.ADMIN_USERS_MANAGE } },
        { path: 'roles', component: () => import('../views/RolesView.vue'), name: 'roles', meta: { permission: PERMISSIONS.ADMIN_SETTINGS } },
        { path: 'settings', component: () => import('../views/SettingsView.vue'), name: 'settings', meta: { permission: PERMISSIONS.ADMIN_SETTINGS } },
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
  const getFirstAccessibleRouteName = () => {
    const order = [
      { name: 'documents', perm: PERMISSIONS.DOCUMENTS_LIST },
      { name: 'reports', perm: PERMISSIONS.REPORTS_OVERVIEW },
      // upload removed from direct navigation
      { name: 'pending', perm: PERMISSIONS.DOCUMENTS_APPROVE },
      { name: 'my-tasks' },
      { name: 'completed' },
      { name: 'users', perm: PERMISSIONS.ADMIN_USERS_MANAGE },
      { name: 'roles', perm: PERMISSIONS.ADMIN_SETTINGS },
      { name: 'settings', perm: PERMISSIONS.ADMIN_SETTINGS },
    ]
    for (const r of order) {
      if (!r.perm || authStore.hasPermission(r.perm)) return r.name
    }
    return 'not-found'
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: getFirstAccessibleRouteName() })
  } else if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    next({ name: getFirstAccessibleRouteName() })
  } else {
    next()
  }
})

export default router
