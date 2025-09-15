<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Menu from 'primevue/menu';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const allNavigationItems = [
  // Báo cáo
  { label: 'Báo cáo', icon: 'pi pi-chart-line', to: '/reports', requiredPermission: 'reports:overview' },
  
  // Tài liệu
  { label: 'Tài liệu', icon: 'pi pi-file', to: '/documents', requiredPermission: 'documents:list' },
  { label: 'Tải lên', icon: 'pi pi-upload', to: '/upload', requiredPermission: 'documents:upload' },
  { label: 'Chờ duyệt', icon: 'pi pi-clock', to: '/pending', requiredPermission: 'documents:approve' },
  
  // Công việc
  { label: 'Công việc của tôi', icon: 'pi pi-check-square', to: '/my-tasks' },
  { label: 'Đã hoàn thành', icon: 'pi pi-check-square', to: '/completed' },

  // Quản trị
  { label: 'Quản lý người dùng', icon: 'pi pi-users', to: '/users', requiredPermission: 'admin:users:manage', group: 'Quản trị' },
  { label: 'Vai trò & Phân quyền', icon: 'pi pi-key', to: '/roles', requiredPermission: 'admin:settings', group: 'Quản trị' },
  { label: 'Cài đặt', icon: 'pi pi-cog', to: '/settings', requiredPermission: 'admin:settings', group: 'Quản trị' },
];

const menuItems = computed(() => {
    const hasPermission = (permission) => authStore.hasPermission(permission);

    const mainItems = allNavigationItems
        .filter(item => !item.group)
        .filter(item => !item.requiredPermission || hasPermission(item.requiredPermission));
        
    const adminItems = allNavigationItems
        .filter(item => item.group === 'Quản trị')
        .filter(item => !item.requiredPermission || hasPermission(item.requiredPermission));
        
    const menu = [];
    
    if (mainItems.length > 0) {
        menu.push({
            label: 'Chức năng chính',
            items: mainItems
        });
    }
    
    if (adminItems.length > 0) {
        menu.push({
            label: 'Quản trị',
            items: adminItems
        });
    }
    
    return menu;
});
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
        <i class="pi pi-file" style="font-size: 1.5rem"></i>
        <h2 class="logo-text">Document Manager</h2>
    </div>
    <Menu :model="menuItems" class="sidebar-menu">
      <template #item="{ item, props }">
        <router-link v-if="item.to" :to="item.to" class="p-menuitem-link" :class="{'active-link': route.path === item.to}">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
            <span :class="item.icon" />
            <span>{{ item.label }}</span>
        </a>
      </template>
    </Menu>
  </div>
</template>

<style scoped>
.sidebar {
  width: 256px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.logo-text {
    font-weight: 600;
}

.sidebar-menu {
    width: 100%;
    border: none;
    background-color: transparent;
}

.p-menuitem-link {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: 0.75rem 1rem;
    color: #495057;
    text-decoration: none;
    border-radius: 6px;
    margin: 0.25rem 0.5rem;
}

.p-menuitem-link:hover {
    background-color: #e9ecef;
}

.active-link {
    background-color: #e9ecef;
    font-weight: 600;
    color: #3b82f6;
}

</style>
