<script setup>
import { ref, onMounted, computed } from 'vue';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import apiClient from '@/api';
import { useToast } from 'primevue/usetoast';
import { format } from 'date-fns';
import CreateTaskDialog from '@/components/CreateTaskDialog.vue';

const toast = useToast();
const tasks = ref([]);
const loading = ref(true);
const error = ref(null);
const isCreateVisible = ref(false);
const lazyParams = ref({ first: 0, rows: 10 });

async function fetchTasks() {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('/tasks', { params: { scope: 'created' } });
    tasks.value = response.data.data;
  } catch (err) {
    error.value = 'Không thể tải danh sách công việc.';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.value, life: 3000 });
  } finally {
    loading.value = false;
  }
}

onMounted(fetchTasks);

function onPage(event) {
  lazyParams.value.first = event.first;
  lazyParams.value.rows = event.rows;
}

const totalRecords = computed(() => tasks.value.length);
const formatDateTime = (dateString) => (dateString ? format(new Date(dateString), 'dd/MM/yyyy HH:mm') : '');
</script>

<template>
  <div class="tasks-mgmt-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold">Quản lý công việc</h1>
      <Button label="Tạo công việc" icon="pi pi-plus" @click="isCreateVisible = true" />
    </div>

    <Card class="table-card">
      <template #content>
        <DataTable :value="tasks" :loading="loading" class="p-datatable-sm w-full" scrollable scrollHeight="flex" paginator :rows="lazyParams.rows" :totalRecords="totalRecords" :first="lazyParams.first" @page="onPage($event)" :rowsPerPageOptions="[10, 20, 50]" @rowDblclick="(e)=>$router.push({ name: 'task-detail', params: { id: e.data.id } })">
          <template #paginatorstart>
            <span class="paginator-total">Tổng cộng {{ totalRecords }} công việc</span>
          </template>
          <Column field="name" header="Tên"></Column>
          <Column field="status" header="Trạng thái"></Column>
          <Column header="Hạn xử lý"><template #body="{ data }">{{ formatDateTime(data.duedate) }}</template></Column>
          <Column header="Chi tiết">
            <template #body="{ data }">
              <Button icon="pi pi-eye" text rounded @click="$router.push({ name: 'task-detail', params: { id: data.id } })" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <CreateTaskDialog :visible="isCreateVisible" @update:visible="isCreateVisible = $event" @created="fetchTasks" />
  </div>
</template>

<style scoped>
.tasks-mgmt-page { display: flex; flex-direction: column; gap: 1.5rem; flex: 1; min-height: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.table-card { flex: 1; display: flex; flex-direction: column; min-height: 0; }
:deep(.table-card .p-card-body) { display: flex; flex-direction: column; flex: 1; padding: 0; max-height: 100%; }
:deep(.table-card .p-card-content) { display: flex; flex-direction: column; max-height: 100%; flex: 1; }
.paginator-total { color: #6b7280; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
</style>


