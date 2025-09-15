<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import apiClient from '@/api';
import RoleFormDialog from '@/components/RoleFormDialog.vue';
import PermissionManagerDialog from '@/components/PermissionManagerDialog.vue';

const toast = useToast();
const confirm = useConfirm();

const roles = ref([]);
const loading = ref(true);

const isRoleFormVisible = ref(false);
const editingRole = ref(null);

const isPermissionDialogVisible = ref(false);
const selectedRoleForPermissions = ref(null);

async function fetchRoles() {
  loading.value = true;
  try {
    const response = await apiClient.get('/roles');
    roles.value = response.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách vai trò', life: 3000 });
  } finally {
    loading.value = false;
  }
}

onMounted(fetchRoles);

function openCreateDialog() {
  editingRole.value = null;
  isRoleFormVisible.value = true;
}

function openEditDialog(role) {
  editingRole.value = { ...role };
  isRoleFormVisible.value = true;
}

function openPermissionDialog(role) {
  selectedRoleForPermissions.value = role;
  isPermissionDialogVisible.value = true;
}

async function handleSavePermissions(permissionIds) {
  try {
    const roleId = selectedRoleForPermissions.value.id;
    await apiClient.put(`/roles/${roleId}/permissions`, { permissions: permissionIds });
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật quyền cho vai trò', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật quyền', life: 3000 });
  }
}

function handleDeleteRole(role) {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await apiClient.delete(`/roles/${role.id}`);
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa vai trò', life: 3000 });
        await fetchRoles();
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa vai trò', life: 3000 });
      }
    },
  });
}

async function handleSaveRole(roleData) {
  try {
    if (editingRole.value) {
      await apiClient.put(`/roles/${editingRole.value.id}`, roleData);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật vai trò', life: 3000 });
    } else {
      await apiClient.post('/roles', roleData);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo vai trò mới', life: 3000 });
    }
    await fetchRoles();
  } catch (error) {
    const action = editingRole.value ? 'cập nhật' : 'tạo';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: `Không thể ${action} vai trò`, life: 3000 });
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-bold">Vai trò & Phân quyền</h1>
        <p>Quản lý vai trò và thiết lập quyền cho người dùng</p>
      </div>
      <Button label="Thêm vai trò" icon="pi pi-plus" @click="openCreateDialog" />
    </div>

    <!-- Roles Table -->
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
            <span>Danh sách vai trò</span>
        </div>
      </template>
      <template #content>
        <DataTable :value="roles" :loading="loading" class="p-datatable-sm">
          <Column field="name" header="Tên vai trò" style="min-width: 200px"></Column>
          <Column field="description" header="Mô tả"></Column>
          <Column header="Thao tác" bodyClass="text-center" headerClass="flex justify-center">
              <template #body="slotProps">
                  <div class="text-center">
                    <Button icon="pi pi-lock" text rounded  @click="openPermissionDialog(slotProps.data)" v-tooltip.top="'Phân quyền'" />
                    <Button icon="pi pi-pencil" text rounded @click="openEditDialog(slotProps.data)" v-tooltip.top="'Sửa'" />
                    <Button icon="pi pi-trash" text rounded severity="danger" @click="handleDeleteRole(slotProps.data)" v-tooltip.top="'Xóa'" />
                  </div>
              </template>
          </Column>
           <template #empty>
                <div class="text-center py-4">Không tìm thấy vai trò nào.</div>
            </template>
        </DataTable>
      </template>
    </Card>

    <RoleFormDialog
        :visible="isRoleFormVisible"
        @update:visible="isRoleFormVisible = $event"
        @submit="handleSaveRole"
        :initialData="editingRole"
        :title="editingRole ? 'Sửa vai trò' : 'Thêm vai trò mới'"
    />

    <PermissionManagerDialog
        :visible="isPermissionDialogVisible"
        @update:visible="isPermissionDialogVisible = $event"
        :role="selectedRoleForPermissions"
        @save="handleSavePermissions"
    />
  </div>
</template>

<style scoped>
.space-y-6 > *:not(:last-child) { margin-bottom: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.text-right { text-align: right; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.text-center { text-align: center; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
</style>
