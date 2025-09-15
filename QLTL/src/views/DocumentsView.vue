<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
import apiClient from '@/api';

// PrimeVue components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Tag from 'primevue/tag';
import Card from 'primevue/card';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";
import DocumentStatusBadge from '../components/DocumentStatusBadge.vue';
import DocumentCard from '../components/DocumentCard.vue';
import DocumentFormDialog from '../components/DocumentFormDialog.vue';
import SelectButton from 'primevue/selectbutton';


const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

// Reactive state
const documents = ref([]);
const loading = ref(true);
const error = ref(null);
const totalRecords = ref(0);
const lazyParams = ref({
  first: 0,
  rows: 10,
  page: 1,
});
const searchTerm = ref("");
const statusFilter = ref(null); // Use null for 'all'
const viewMode = ref('table');

// Dialog state
const isDialogVisible = ref(false);
const editingDocument = ref(null);

const viewOptions = [
    { icon: 'pi pi-list', value: 'table' },
    { icon: 'pi pi-th-large', value: 'grid' }
];

// Fetch documents function
async function fetchDocuments() {
  loading.value = true;
  error.value = null;

  const params = {
    page: lazyParams.value.page,
    limit: lazyParams.value.rows,
    search: searchTerm.value,
    status: statusFilter.value
  };
  
  // Remove null/empty params
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === '') {
      delete params[key];
    }
  });

  try {
    const response = await apiClient.get('/documents', { params });
    documents.value = response.data.data;
    totalRecords.value = response.data.pagination.total;
  } catch (err) {
    console.error('Failed to fetch documents:', err);
    error.value = 'Không thể tải danh sách tài liệu.';
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.value, life: 3000 });
  } finally {
    loading.value = false;
  }
}

// Watch for changes in filters and pagination
watch(
  [() => lazyParams.value.page, () => lazyParams.value.rows, searchTerm, statusFilter],
  () => {
    fetchDocuments();
  },
  { deep: true }
);

// Event handlers
function onPage(event) {
  lazyParams.value.page = event.page + 1;
  lazyParams.value.rows = event.rows;
  lazyParams.value.first = event.first;
}

function onFilterStatus(status) {
    statusFilter.value = status;
    lazyParams.value.page = 1;
    lazyParams.value.first = 0;
}

const navigateToDocument = (id) => {
    router.push({ name: 'document-detail', params: { id } });
}

// CRUD Handlers
function openEditDialog(doc) {
    editingDocument.value = { ...doc };
    isDialogVisible.value = true;
}

async function handleSaveDocument(documentData) {
    if (!editingDocument.value) return;

    try {
        const response = await apiClient.put(`/documents/${editingDocument.value.id}`, documentData);
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật tài liệu.', life: 3000 });
        await fetchDocuments();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật tài liệu.', life: 3000 });
    } finally {
        isDialogVisible.value = false;
    }
}


function handleDeleteDocument(doc) {
    confirm.require({
        message: `Bạn có chắc chắn muốn xóa tài liệu "${doc.name}"?`,
        header: 'Xác nhận xóa',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Xóa',
        rejectLabel: 'Hủy',
        accept: async () => {
            try {
                await apiClient.delete(`/documents/${doc.id}`);
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa tài liệu.', life: 3000 });
                await fetchDocuments();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa tài liệu.', life: 3000 });
            }
        },
    });
}

// Lifecycle hook
onMounted(() => {
  fetchDocuments();
});

const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return format(new Date(dateTime), 'dd/MM/yyyy HH:mm');
};
</script>

<template>
  <div class="documents-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-bold">Quản lý Tài liệu</h1>
      </div>
      <Button label="Tải lên" icon="pi pi-upload" @click="router.push('/upload')" />
    </div>

    <!-- Filters and Search -->
    <Card class="filter-card">
      <template #content>
        <div class="filter-content">
          <!-- Status Filter Badges -->
          <div class="status-filters">
             <Tag @click="onFilterStatus(null)" :severity="statusFilter === null ? 'primary' : 'secondary'" class="cursor-pointer">Tất cả</Tag>
             <Tag @click="onFilterStatus('pending')" :severity="statusFilter === 'pending' ? 'warning' : 'secondary'" class="cursor-pointer">Chờ duyệt</Tag>
             <Tag @click="onFilterStatus('approved')" :severity="statusFilter === 'approved' ? 'success' : 'secondary'" class="cursor-pointer">Đã duyệt</Tag>
             <Tag @click="onFilterStatus('rejected')" :severity="statusFilter === 'rejected' ? 'danger' : 'secondary'" class="cursor-pointer">Bị từ chối</Tag>
          </div>

          <!-- Search and Controls -->
          <div class="search-controls">
            <IconField>
              <InputIcon class="pi pi-search" />
                <InputText v-model.lazy="searchTerm" placeholder="Tìm kiếm theo tên tài liệu..." @keyup.enter="fetchDocuments"/>
            </IconField>
             <SelectButton v-model="viewMode" :options="viewOptions" optionValue="value" dataKey="value">
                <template #option="slotProps">
                    <i :class="slotProps.option.icon"></i>
                </template>
            </SelectButton>
          </div>
        </div>
      </template>
    </Card>

    <!-- Documents Table/Grid -->
    <div class="content-area">
       <!-- Table View -->
      <div v-if="viewMode === 'table'" class="table-container">
        <DataTable 
          :value="documents" 
          :loading="loading"
          @page="onPage($event)"
          :totalRecords="totalRecords"
          :rows="lazyParams.rows"
          :first="lazyParams.first"
          @rowClick="(event) => navigateToDocument(event.data.id)"
          class="p-datatable-sm w-full" 
          rowHover 
          scrollable 
          scrollHeight="flex" 
          paginator 
          lazy
          :rowsPerPageOptions="[10, 20, 50]"
        >
            <template #paginatorstart>
                <span class="paginator-total">Tổng cộng {{ totalRecords }} tài liệu</span>
            </template>
            <Column field="name" header="Tài liệu" style="min-width: 300px">
                <template #body="slotProps">
                    <div class="document-info">
                        <i class="pi pi-file document-icon"></i>
                        <div>
                            <p class="font-medium">{{ slotProps.data.name }}</p>
                        </div>
                    </div>
                </template>
            </Column>
            <Column field="status" header="Trạng thái">
                <template #body="slotProps">
                    <DocumentStatusBadge :status="slotProps.data.status" />
                </template>
            </Column>
            <Column field="uploader.name" header="Người tải lên"></Column>
            <Column field="handler.name" header="Người xử lý"></Column>
            <Column field="deadline" header="Hạn xử lý">
                <template #body="slotProps">
                    {{ formatDateTime(slotProps.data.deadline) }}
                </template>
            </Column>
            <Column field="uploadedAt" header="Ngày tải lên">
                <template #body="slotProps">
                    {{ formatDateTime(slotProps.data.uploadedAt) }}
                </template>
            </Column>
            <Column header="Thao tác" bodyClass="text-center">
                <template #body="slotProps">
                    <div @click.stop>
                        <Button icon="pi pi-eye" text rounded @click="navigateToDocument(slotProps.data.id)" v-tooltip.top="'Xem chi tiết'" />
                        <Button icon="pi pi-pencil" text rounded class="text-primary" @click="openEditDialog(slotProps.data)" v-tooltip.top="'Chỉnh sửa'" />
                        <Button icon="pi pi-trash" text rounded class="text-danger" @click="handleDeleteDocument(slotProps.data)" v-tooltip.top="'Xóa'" />
                    </div>
                </template>
            </Column>

            <template #empty>
                <div v-if="!loading" class="empty-state">Không tìm thấy tài liệu nào.</div>
            </template>
        </DataTable>
      </div>

       <!-- Grid View -->
        <div v-else class="grid-view">
             <DocumentCard 
              v-for="doc in documents" 
              :key="doc.id" 
              :document="doc"
              @view="navigateToDocument"
            />
            <!-- Grid view would also need pagination, simplified here for brevity -->
        </div>

      <!-- Empty State for initial load or severe filter -->
      <div v-if="!loading && documents.length === 0 && (searchTerm || statusFilter)" class="empty-state">
        <Card>
          <template #content>
              <div class="text-center">
                  <i class="pi pi-filter-slash" style="font-size: 3rem"></i>
                  <h3 class="text-lg font-medium">Không tìm thấy tài liệu</h3>
                  <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
          </template>
        </Card>
      </div>
    </div>

     <DocumentFormDialog
        :visible="isDialogVisible"
        @update:visible="isDialogVisible = $event"
        @submit="handleSaveDocument"
        :initialData="editingDocument"
        title="Chỉnh sửa thông tin tài liệu"
    />
  </div>
</template>

<style scoped>
/* Keeping existing styles, adding a few more */
.documents-page {
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
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }

.filter-card .filter-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
@media (min-width: 768px) {
    .filter-card .filter-content {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
}

.status-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.search-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}
.document-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
.document-icon {
    font-size: 1.5rem;
    color: var(--p-primary-color);
}
.font-medium { font-weight: 500; }
.text-sm { font-size: 0.875rem; }
.text-gray-500 { color: #6b7280; }

.empty-state {
    margin-top: 2rem;
    text-align: center;
    color: var(--p-text-color-secondary);
}
.text-center { text-align: center; }
.text-lg { font-size: 1.125rem; }
.cursor-pointer { cursor: pointer; }

.grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
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

.text-primary .pi {
    color: var(--p-primary-color);
}
.text-danger .pi {
    color: var(--p-danger-color);
}

</style>
