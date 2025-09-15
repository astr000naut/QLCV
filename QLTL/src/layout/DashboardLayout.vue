<script setup>
import AppSidebar from '../components/AppSidebar.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { useAuthStore } from '@/stores/auth';
import Button from 'primevue/button';

const authStore = useAuthStore();
</script>

<template>
  <div class="layout-wrapper">
    <Toast />
    <ConfirmDialog />
    <AppSidebar />
    <div class="layout-main-container">
      <header class="layout-topbar">
        <div class="flex-grow-1"></div>
        <div class="flex align-items-center gap-2">
          <span class="font-bold leading-[38px]">{{ authStore.user?.name }}</span>
          <Button icon="pi pi-sign-out" text rounded @click="authStore.logout()" v-tooltip.bottom="'Đăng xuất'" />
        </div>
      </header>
      <div class="layout-main">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.layout-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent this container from showing scrollbars */
}

.layout-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.layout-main {
  flex: 1;
  padding: 1rem;
  max-height: calc(100vh - 57px);
  display: flex; /* Use flexbox */
  flex-direction: column; /* Stack children vertically */
  min-height: 0; /* Important for flex children with overflow */
}
</style>
