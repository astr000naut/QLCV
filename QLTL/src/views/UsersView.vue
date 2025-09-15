<script setup>
import { ref, watch, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import UserFormDialog from '../components/UserFormDialog.vue';
import apiClient from '@/api';
import { format } from 'date-fns';


// Composables
const confirm = useConfirm();
const toast = useToast();

// API and Table State
const users = ref([]);
const loading = ref(true);
const totalRecords = ref(0);
const searchTerm = ref('');
const lazyParams = ref({
  first: 0,
  rows: 10,
  page: 1,
});

// Dialog State
const isUserFormVisible = ref(false);
const editingUser = ref(null);

// Fetching Data
async function fetchUsers() {
  loading.value = true;
  try {
    const params = {
      page: lazyParams.value.page,
      limit: lazyParams.value.rows,
      search: searchTerm.value,
    };
    const response = await apiClient.get('/users', { params });
    users.value = response.data.data;
    totalRecords.value = response.data.pagination.total;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách người dùng', life: 3000 });
  } finally {
    loading.value = false;
  }
}

// Watchers
watch([() => lazyParams.value.page, () => lazyParams.value.rows, searchTerm], () => {
  fetchUsers();
}, { deep: true });

onMounted(fetchUsers);

// CRUD Handlers
async function handleSaveUser(userData) {
  try {
    if (editingUser.value) {
      // Update user
      const response = await apiClient.put(`/users/${editingUser.value.id}`, userData);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật người dùng', life: 3000 });
    } else {
      // Create user
      const response = await apiClient.post('/users', userData);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo người dùng mới', life: 3000 });
    }
    await fetchUsers();
  } catch (error) {
    const action = editingUser.value ? 'cập nhật' : 'tạo';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: `Không thể ${action} người dùng`, life: 3000 });
  }
}

function handleDeleteUser(user) {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa người dùng ${user.name}?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await apiClient.delete(`/users/${user.id}`);
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa người dùng', life: 3000 });
        await fetchUsers();
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa người dùng', life: 3000 });
      }
    },
  });
}

// Dialog Management
function openCreateDialog() {
  editingUser.value = null;
  isUserFormVisible.value = true;
}

function openEditDialog(user) {
  editingUser.value = { ...user };
  isUserFormVisible.value = true;
}

// Pagination
function onPage(event) {
  lazyParams.value.page = event.page + 1;
  lazyParams.value.rows = event.rows;
  lazyParams.value.first = event.first;
}

// UI Helpers
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
const formatDateTime = (dateString) => dateString ? format(new Date(dateString), 'dd/MM/yyyy HH:mm') : 'N/A';
const getRoleLabel = (role) => ({ admin: "Quản trị viên", editor: "Biên tập viên", viewer: "Người xem" }[role] || role);
const getRoleSeverity = (role) => ({ admin: 'info', editor: 'success' }[role] || 'secondary');
</script>

<template>
  <div class="users-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Quản lý người dùng</h1>
        <p>Quản lý tài khoản và phân quyền người dùng</p>
      </div>
      <Button label="Thêm người dùng" icon="pi pi-user-plus" @click="openCreateDialog" />
    </div>

    <!-- Filters and Search -->
    <Card class="filter-card">
      <template #content>
        <div class="filter-content">
          <!-- This div is for potential future filters -->
          <div class="flex-grow"></div>
          <div class="search-controls">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model.lazy="searchTerm" placeholder="Tìm kiếm theo tên, email..." @keyup.enter="fetchUsers" />
            </IconField>
          </div>
        </div>
      </template>
    </Card>

    <!-- Content Area -->
    <div class="content-area">
      <div class="table-container">
        <DataTable
          :value="users"
          :loading="loading"
          @page="onPage($event)"
          :totalRecords="totalRecords"
          :rows="lazyParams.rows"
          :first="lazyParams.first"
          class="p-datatable-sm w-full"
          paginator lazy
          :rowsPerPageOptions="[5, 10, 20]"
          rowHover
          scrollable
          scrollHeight="flex"
        >
          <Column header="Người dùng" style="min-width: 250px">
            <template #body="slotProps">
              <div class="user-info">
                <Avatar :label="getInitials(slotProps.data.name)" shape="circle" />
                <div>
                  <div class="user-name">{{ slotProps.data.name }}</div>
                  <div class="user-email">{{ slotProps.data.email }}</div>
                </div>
              </div>
            </template>
          </Column>
          <Column header="Vai trò">
            <template #body="slotProps">
              <Tag :value="getRoleLabel(slotProps.data.role)" :severity="getRoleSeverity(slotProps.data.role)" />
            </template>
          </Column>
          <Column header="Thao tác" bodyClass="text-center" headerClass="flex justify-center">
            <template #body="slotProps">
              <div class="actions">
                <Button icon="pi pi-pencil" text rounded @click="openEditDialog(slotProps.data)" v-tooltip.top="'Chỉnh sửa'" />
                <Button icon="pi pi-trash" text rounded severity="danger" @click="handleDeleteUser(slotProps.data)" v-tooltip.top="'Xóa'" />
              </div>
            </template>
          </Column>
          <template #paginatorstart>
            <span class="paginator-total">Tổng cộng {{ totalRecords }} người dùng</span>
          </template>
          <template #empty>
            <div v-if="!loading" class="empty-state">Không tìm thấy người dùng.</div>
          </template>
        </DataTable>
      </div>
    </div>

    <UserFormDialog
        :visible="isUserFormVisible"
        @update:visible="isUserFormVisible = $event"
        @submit="handleSaveUser"
        :initialData="editingUser"
        :title="editingUser ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'"
    />
  </div>
</template>

<style scoped>
.users-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-header h1 {
    font-size: 1.875rem;
    font-weight: 700;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-label {
    font-size: 0.875rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
}

.filter-card .filter-content {
    display: flex;
    align-items: center;
}

.search-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-container {
  flex: 1;
  display: flex;
  min-height: 0;
}

:deep(.p-datatable .p-paginator) {
    justify-content: space-between !important;
}
.paginator-total { color: #6b7280; }

.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-name {
    font-weight: 500;
}

.user-email {
    font-size: 0.875rem;
    color: #6b7280;
}

.actions {
    display: flex;
    justify-content: center;
}

.empty-state {
    padding: 1rem 0;
    text-align: center;
    color: var(--p-text-color-secondary);
}

.text-right {
    text-align: right;
}

.text-center {
  text-align: center;
}

.flex-grow {
  flex-grow: 1;
}
</style>
