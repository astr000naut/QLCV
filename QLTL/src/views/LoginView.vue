<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          Đăng nhập
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Chào mừng bạn quay trở lại!
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm">
          <div>
            <InputText 
              type="email" 
              v-model="email" 
              placeholder="Địa chỉ email" 
              class="w-full" 
            />
          </div>
          <div class="mt-4">
            <InputText 
              type="password" 
              v-model="password" 
              placeholder="Mật khẩu" 
              class="w-full" 
            />
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-500 text-sm">
            {{ errorMessage }}
        </div>

        <div>
          <Button 
            type="submit" 
            label="Đăng nhập" 
            class="w-full" 
            :loading="loading" 
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const authStore = useAuthStore()

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    await authStore.login({ username: email.value, password: password.value })
    // The store will redirect to '/' on success
  } catch (error) {
    errorMessage.value = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
