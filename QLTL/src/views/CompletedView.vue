<script setup>
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import SelectButton from 'primevue/selectbutton';
import DocumentStatusBadge from '../components/DocumentStatusBadge.vue';
import FolderManager from '../components/FolderManager.vue';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';

const initialCompletedDocuments = ref([
  // Mock data from Completed.tsx
  { id: "1", title: "Báo cáo tài chính Q3 2024", fileName: "baocao-taichinhQ3-2024.pdf", status: "approved", assignedTo: { name: "Trần Thị B" }, completedAt: new Date(2024, 10, 28), category: "Tài chính" },
  { id: "2", title: "Hợp đồng thương mại ABC Corp", fileName: "hopdong-ABC-corp.docx", status: "approved", assignedTo: { name: "Lê Văn C" }, completedAt: new Date(2024, 10, 24), category: "Hợp đồng" },
  { id: "3", title: "Đề xuất ngân sách 2025", fileName: "dexuat-ngangsach-2025.xlsx", status: "approved", assignedTo: { name: "Nguyễn Thị E" }, completedAt: new Date(2024, 10, 22), category: "Ngân sách" },
  { id: "4", title: "Báo cáo dự án phần mềm", fileName: "baocao-duan-phanmem.pdf", status: "approved", assignedTo: { name: "Hoàng Văn G" }, completedAt: new Date(2024, 10, 18), category: "Dự án" }
]);

const viewMode = ref('table');
const searchTerm = ref('');
const selectedFolder = ref(null);

const viewOptions = [
    { icon: 'pi pi-table', value: 'table', label: 'Bảng' },
    { icon: 'pi pi-folder', value: 'folder', label: 'Thư mục' }
];

const filteredDocuments = computed(() =>
  initialCompletedDocuments.value.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

const groupedDocuments = computed(() =>
    initialCompletedDocuments.value.reduce((acc, doc) => {
        const category = doc.category || "Chưa phân loại";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(doc);
        return acc;
    }, {})
);

const handleFolderCreate = (name) => {
    // In a real app, this would call an API. Here, we just log it.
    // The data structure would need to support empty folders.
    console.log('Create folder:', name);
};

const handleFolderRename = ({ oldName, newName }) => {
    initialCompletedDocuments.value = initialCompletedDocuments.value.map(doc =>
        doc.category === oldName ? { ...doc, category: newName } : doc
    );
};

const handleFolderDelete = (name) => {
    initialCompletedDocuments.value = initialCompletedDocuments.value.map(doc =>
        doc.category === name ? { ...doc, category: "Chưa phân loại" } : doc
    );
};

</script>

<template>
    <div class="space-y-6">
        <div class="page-header">
            <div>
                <h1 class="text-3xl font-bold">Đã hoàn thành</h1>
                <p>Danh sách các tài liệu đã được xử lý và phê duyệt</p>
            </div>
            <SelectButton v-model="viewMode" :options="viewOptions" optionValue="value" dataKey="value">
                <template #option="{ option }">
                    <i :class="option.icon" class="mr-2"></i>
                    <span>{{ option.label }}</span>
                </template>
            </SelectButton>
        </div>

         <div class="stats-grid">
            <Card><template #content><div class="flex items-center gap-3"><i class="pi pi-file-check text-2xl text-green-600"></i><div><p class="text-sm">Tổng số hoàn thành</p><p class="text-2xl font-bold">{{ initialCompletedDocuments.length }}</p></div></div></template></Card>
            <Card><template #content><div class="flex items-center gap-3"><i class="pi pi-calendar text-2xl text-blue-600"></i><div><p class="text-sm">Tháng này</p><p class="text-2xl font-bold">3</p></div></div></template></Card>
            <Card><template #content><div class="flex items-center gap-3"><i class="pi pi-users text-2xl text-purple-600"></i><div><p class="text-sm">Người xử lý</p><p class="text-2xl font-bold">4</p></div></div></template></Card>
        </div>

        <Card>
            <template #content>
                 <div class="flex gap-4">
                    <IconField class="flex-1">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchTerm" placeholder="Tìm kiếm tài liệu..." class="w-full" />
                    </IconField>
                    <Button label="Lọc" icon="pi pi-filter" outlined />
                    <Button label="Xuất danh sách" icon="pi pi-download" outlined />
                </div>
            </template>
        </Card>

        <Card>
            <template #content>
                <div v-if="viewMode === 'table'">
                    <DataTable :value="filteredDocuments" class="p-datatable-sm">
                        <Column header="Tài liệu">
                             <template #body="{ data }">
                                <p class="font-medium">{{ data.title }}</p>
                                <p class="text-sm text-gray-500">{{ data.fileName }}</p>
                            </template>
                        </Column>
                        <Column header="Trạng thái">
                            <template #body="{ data }">
                                <DocumentStatusBadge :status="data.status" />
                            </template>
                        </Column>
                        <Column field="assignedTo.name" header="Người xử lý"></Column>
                        <Column header="Ngày hoàn thành">
                            <template #body="{ data }">
                                {{ new Date(data.completedAt).toLocaleDateString('vi-VN') }}
                            </template>
                        </Column>
                        <Column field="category" header="Danh mục"></Column>
                         <Column header="Thao tác" headerStyle="text-align: right">
                            <template #body="{ data }">
                                <div class="flex gap-2 justify-end">
                                    <Button icon="pi pi-eye" text rounded />
                                    <Button icon="pi pi-download" text rounded />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <div v-if="selectedFolder">
                        <div class="flex items-center gap-2 mb-4">
                            <Button label="Quay lại" icon="pi pi-arrow-left" text @click="selectedFolder = null" />
                            <h3 class="text-lg font-semibold">{{ selectedFolder }}</h3>
                        </div>
                        <DataTable :value="groupedDocuments[selectedFolder]" class="p-datatable-sm">
                            <!-- Simplified table for folder view -->
                             <Column header="Tài liệu">
                                <template #body="{ data }">
                                    <p class="font-medium">{{ data.title }}</p>
                                    <p class="text-sm text-gray-500">{{ data.fileName }}</p>
                                </template>
                            </Column>
                             <Column header="Ngày hoàn thành">
                                <template #body="{ data }">
                                    {{ new Date(data.completedAt).toLocaleDateString('vi-VN') }}
                                </template>
                            </Column>
                             <Column header="Thao tác" headerStyle="text-align: right">
                                <template #body="{ data }">
                                    <div class="flex gap-2 justify-end">
                                        <Button icon="pi pi-eye" text rounded />
                                        <Button icon="pi pi-download" text rounded />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                    <FolderManager 
                        v-else
                        :groupedDocuments="groupedDocuments"
                        @folderSelect="selectedFolder = $event"
                        @folderCreate="handleFolderCreate"
                        @folderRename="handleFolderRename"
                        @folderDelete="handleFolderDelete"
                    />
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.space-y-6 > *:not(:last-child) { margin-bottom: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.gap-3 { gap: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-2xl { font-size: 1.5rem; }
.font-medium { font-weight: 500; }
.text-gray-500 { color: #6b7280; }
.text-green-600 { color: #16a34a; }
.text-blue-600 { color: #2563eb; }
.text-purple-600 { color: #9333ea; }
.w-full { width: 100%; }
.flex-1 { flex: 1; }
.gap-4 { gap: 1rem; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
.mr-2 { margin-right: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.text-lg { font-size: 1.125rem; }
</style>
