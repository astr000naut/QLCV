import { defineStore } from 'pinia'
import apiClient from '@/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    permissions: new Set(JSON.parse(localStorage.getItem('permissions')) || [])
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    hasPermission: (state) => (permissionId) => state.permissions.has(permissionId),
  },

  actions: {
    async login(credentials) {
      try {
        const response = await apiClient.post('/auth/login', credentials)
        const { token, user } = response.data

        this.token = token
        this.user = user
        this.permissions = new Set(user.permissions || [])

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('permissions', JSON.stringify(Array.from(this.permissions)))

        // apiClient's header will be updated by the interceptor
        
        await router.push('/')
      } catch (error) {
        console.error('Login failed:', error)
        // You might want to throw the error to handle it in the component
        throw error
      }
    },

    logout() {
      // It's good practice to inform the backend, even if it's a mock server
      // apiClient.post('/auth/logout').catch(() => {})

      this.user = null
      this.token = null
      this.permissions = new Set()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
      router.push('/login')
    },

    async fetchUser() {
        if(!this.token) return;
        try {
            const response = await apiClient.get('/auth/me')
            this.user = response.data
            this.permissions = new Set(this.user.permissions || [])
            localStorage.setItem('user', JSON.stringify(this.user))
            localStorage.setItem('permissions', JSON.stringify(Array.from(this.permissions)))
        } catch (error) {
            console.error('Failed to fetch user:', error)
            this.logout()
        }
    },

    tryAutoLogin() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        // The interceptor will now use this token
        this.fetchUser()
      }
    }
  }
})
