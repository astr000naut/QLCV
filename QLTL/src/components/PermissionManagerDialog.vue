<script setup>
import { ref, watch, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import apiClient from '@/api';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
  visible: Boolean,
  role: Object,
});

const emit = defineEmits(['update:visible', 'save']);
const toast = useToast();

const allPermissions = ref([]);
const selectedPermissions = ref(new Set());
const loading = ref(false);

const groupedPermissions = computed(() => {
    const groups = {};
    for (const p of allPermissions.value) {
        const groupKey = p.id.split(':')[0] || 'general';
        if (!groups[groupKey]) {
            groups[groupKey] = {
                name: getGroupName(groupKey),
                permissions: []
            };
        }
        groups[groupKey].permissions.push(p);
    }
    return Object.values(groups);
});

function getGroupName(key) {
    const names = {
        'reports': 'Báo cáo',
        'documents': 'Tài liệu',
        'admin': 'Quản trị',
    };
    return names[key] || 'Khác';
}


watch(() => props.visible, async (newValue) => {
  if (newValue && props.role) {
    loading.value = true;
    try {
      const [allPermsResponse, rolePermsResponse] = await Promise.all([
        apiClient.get('/permissions'),
        apiClient.get(`/roles/${props.role.id}/permissions`)
      ]);
      
      allPermissions.value = allPermsResponse.data.data;
      const assignedPerms = rolePermsResponse.data.data;
      selectedPermissions.value = new Set(assignedPerms.map(p => p.id));

    } catch (error) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu quyền', life: 3000 });
      closeDialog();
    } finally {
      loading.value = false;
    }
  }
});

const handleSave = () => {
  const permissionIds = Array.from(selectedPermissions.value);
  emit('save', permissionIds);
  closeDialog();
};

const closeDialog = () => {
  emit('update:visible', false);
};
</script>

<template>
  <Dialog header="Phân quyền cho vai trò" :visible="visible" @update:visible="closeDialog" modal style="width: 700px">
    <div v-if="role">
        <p class="mb-4">Thiết lập quyền cho vai trò: <strong>{{ role.name }}</strong></p>
        <div v-if="loading" class="text-center">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>
        <div v-else class="permission-groups">
            <div v-for="group in groupedPermissions" :key="group.name" class="permission-group">
                <h3 class="group-name">{{ group.name }}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div v-for="permission in group.permissions" :key="permission.id" class="flex items-center">
                        <Checkbox v-model="selectedPermissions" :inputId="permission.id" :value="permission.id" />
                        <label :for="permission.id" class="ml-2">{{ permission.name }}</label>
                    </div>
                </div>
            </div>
        </div>
    </div>
     <div class="flex justify-end gap-2 mt-4">
        <Button label="Hủy" severity="secondary" @click="closeDialog" />
        <Button label="Lưu lại" @click="handleSave" />
      </div>
  </Dialog>
</template>

<style scoped>
.permission-groups {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 1rem; /* for scrollbar */
}
.permission-group {
    margin-bottom: 1.5rem;
}
.group-name {
    font-weight: bold;
    margin-bottom: 1rem;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.5rem;
}

.grid {
    display: grid;
}
.grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
}
@media (min-width: 768px) {
    .md\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
.gap-x-8 {
    column-gap: 2rem;
}
.gap-y-4 {
    row-gap: 1rem;
}

.flex { display: flex; }
.items-center { align-items: center; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.ml-2 { margin-left: 0.5rem; }
.text-center { text-align: center; }
</style>
