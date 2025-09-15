<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import DocumentStatusBadge from '../components/DocumentStatusBadge.vue';
import apiClient from '@/api';
import { useToast } from 'primevue/usetoast';
import { format } from 'date-fns';

const router = useRouter();
const toast = useToast();

const allTasks = ref([]);
const loading = ref(true);
const error = ref(null);
const lazyParams = ref({
    first: 0,
    rows: 10,
});

async function fetchTasks() {
    loading.value = true;
    error.value = null;
    try {
        const response = await apiClient.get('/tasks');
        allTasks.value = response.data;
    } catch (err) {
        console.error("Failed to fetch tasks:", err);
        error.value = "Không thể tải danh sách công việc.";
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

const totalRecords = computed(() => allTasks.value.length);

const navigateToDocument = (id) => {
    router.push({ name: 'document-detail', params: { id } });
}

const formatDateTime = (dateString) => dateString ? format(new Date(dateString), 'dd/MM/yyyy HH:mm') : 'N/A';
</script>

<template>
  <div class="my-tasks-page">
    <div>
      <h1 class="text-3xl font-bold">Công việc của tôi</h1>
      <p>Danh sách các tài liệu đang chờ bạn xử lý.</p>
    </div>

    <Card class="table-card">
      <template #content>
        <DataTable 
        :value="allTasks" 
        :loading="loading" 
        class="p-datatable-sm w-full" 
        scrollable 
        scrollHeight="flex"
        paginator
        :rows="lazyParams.rows"
        :totalRecords="totalRecords"
        :first="lazyParams.first"
        @page="onPage($event)"
        :rowsPerPageOptions="[10, 20, 50]"
        >
            <template #paginatorstart>
                <span class="paginator-total">Tổng cộng {{ totalRecords }} công việc</span>
            </template>
            <template #header>
                <div class="text-lg font-medium">Tài liệu chờ duyệt ({{ totalRecords }})</div>
            </template>
            <Column field="name" header="Tên tài liệu"></Column>
            <Column field="uploader.name" header="Người gửi"></Column>
            <Column header="Ngày gửi">
                <template #body="{ data }">
                    {{ formatDateTime(data.uploadedAt) }}
                </template>
            </Column>
            <Column header="Trạng thái">
                <template #body="{ data }">
                    <DocumentStatusBadge :status="data.status" />
                </template>
            </Column>
            <Column header="Thao tác">
                <template #body="{ data }">
                    <Button label="Xem chi tiết" icon="pi pi-eye" outlined size="small" @click="navigateToDocument(data.id)" />
                </template>
            </Column>
            <template #empty>
                <div class="text-center py-12">
                    <i class="pi pi-check-circle text-4xl text-gray-400"></i>
                    <h3 class="text-lg font-medium mt-2">Tuyệt vời!</h3>
                    <p>Bạn không có công việc nào cần xử lý.</p>
                </div>
            </template>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.my-tasks-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
}
.table-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}
:deep(.table-card .p-card-body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0;
    max-height: 100%;
}
:deep(.table-card .p-card-content) {
    display: flex;
    flex-direction: column;
    max-height: 100%;
    flex: 1;
}
.paginator-total { color: #6b7280; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.text-lg { font-size: 1.125rem; }
.font-medium { font-weight: 500; }
.text-center { text-align: center; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.text-4xl { font-size: 2.25rem; }
.text-gray-400 { color: #9ca3af; }
.mt-2 { margin-top: 0.5rem; }
</style>
