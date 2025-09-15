<script setup>
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import DocumentStatusBadge from '../components/DocumentStatusBadge.vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const pendingDocuments = ref([
    // Mock data from Pending.tsx
    { id: "1", title: "Báo cáo tài chính Q3 2024", fileName: "baocao-taichinhQ3-2024.pdf", status: "waiting_approval", assignedTo: { name: "Trần Thị B" }, submittedAt: new Date(2024, 10, 26, 14, 30), dueDate: new Date(2024, 10, 30), priority: "high" },
    { id: "2", title: "Đề xuất ngân sách marketing 2025", fileName: "dexuat-marketing-2025.pptx", status: "waiting_approval", assignedTo: { name: "Lê Văn C" }, submittedAt: new Date(2024, 10, 26, 16, 45), dueDate: new Date(2024, 10, 28), priority: "urgent" },
    { id: "3", title: "Hợp đồng đối tác chiến lược", fileName: "hopdong-doitac-2024.docx", status: "waiting_approval", assignedTo: { name: "Nguyễn Thị E" }, submittedAt: new Date(2024, 10, 26, 10, 15), dueDate: new Date(2024, 10, 27), priority: "high" },
]);

const stats = computed(() => ({
    total: pendingDocuments.value.length,
    dueSoon: pendingDocuments.value.filter(doc => (new Date(doc.dueDate).getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000).length,
    urgent: pendingDocuments.value.filter(doc => doc.priority === 'urgent').length,
    avgWaitingTime: "1.2 ngày"
}));

const selectedDocument = ref(null);
const rejectReason = ref('');
const showRejectDialog = ref(false);

const handleApprove = (doc) => {
    toast.add({ severity: 'success', summary: 'Đã duyệt', detail: `Đã duyệt tài liệu: ${doc.title}`, life: 3000 });
    // remove from list
    pendingDocuments.value = pendingDocuments.value.filter(d => d.id !== doc.id);
};

const openRejectDialog = (doc) => {
    selectedDocument.value = doc;
    rejectReason.value = '';
    showRejectDialog.value = true;
};

const handleReject = () => {
    toast.add({ severity: 'warn', summary: 'Đã từ chối', detail: `Đã từ chối tài liệu: ${selectedDocument.value.title}`, life: 3000 });
    pendingDocuments.value = pendingDocuments.value.filter(d => d.id !== selectedDocument.value.id);
    showRejectDialog.value = false;
};

const getPriorityLabel = (priority) => ({ low: "Thấp", medium: "TB", high: "Cao", urgent: "KHẨN CẤP" }[priority]);
const getPrioritySeverity = (priority) => ({ high: 'warning', urgent: 'danger' }[priority] || 'info');

</script>

<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-3xl font-bold">Chờ Phê Duyệt</h1>
            <p>Xem xét và phê duyệt các tài liệu đã được xử lý</p>
        </div>

        <div class="stats-grid">
            <Card><template #content><div class="flex items-center gap-3"><i class="pi pi-clock text-2xl text-orange-600"></i><div><p class="text-sm">Chờ duyệt</p><p class="text-2xl font-bold">{{ stats.total }}</p></div></div></template></Card>
            <Card><template #content><div class="flex items-center gap-3"><i class="pi pi-calendar-times text-2xl text-red-600"></i><div><p class="text-sm">Sắp đến hạn</p><p class="text-2xl font-bold">{{ stats.dueSoon }}</p></div></div></template></Card>
            <Card><template #content><div class="flex items-center gap-3"><i class="pi pi-exclamation-circle text-2xl text-red-600"></i><div><p class="text-sm">Khẩn cấp</p><p class="text-2xl font-bold">{{ stats.urgent }}</p></div></div></template></Card>
            <Card><template #content><div class="flex items-center gap-3"><i class="pi pi-stopwatch text-2xl text-blue-600"></i><div><p class="text-sm">Thời gian chờ TB</p><p class="text-2xl font-bold">{{ stats.avgWaitingTime }}</p></div></div></template></Card>
        </div>

        <Card>
            <template #title>Tài liệu chờ phê duyệt</template>
            <template #content>
                <DataTable :value="pendingDocuments" class="p-datatable-sm">
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
                    <Column field="submittedAt" header="Ngày nộp">
                        <template #body="{ data }">
                            {{ new Date(data.submittedAt).toLocaleDateString('vi-VN') }}
                        </template>
                    </Column>
                    <Column field="dueDate" header="Hạn duyệt">
                         <template #body="{ data }">
                            {{ new Date(data.dueDate).toLocaleDateString('vi-VN') }}
                        </template>
                    </Column>
                     <Column header="Ưu tiên">
                        <template #body="{ data }">
                            <Tag :value="getPriorityLabel(data.priority)" :severity="getPrioritySeverity(data.priority)" />
                        </template>
                    </Column>
                    <Column header="Thao tác" headerStyle="text-align: right">
                        <template #body="{ data }">
                            <div class="flex gap-2 justify-end">
                                <Button label="Duyệt" icon="pi pi-check" size="small" @click="handleApprove(data)" />
                                <Button label="Từ chối" icon="pi pi-times" severity="danger" size="small" @click="openRejectDialog(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <Dialog header="Từ chối tài liệu" v-model:visible="showRejectDialog" modal style="width: 450px">
            <p>Vui lòng nhập lý do từ chối để gửi phản hồi cho người xử lý.</p>
            <div v-if="selectedDocument" class="my-4">
                <p class="font-medium">{{ selectedDocument.title }}</p>
                <p class="text-sm text-gray-500">Xử lý bởi: {{ selectedDocument.assignedTo.name }}</p>
            </div>
            <Textarea v-model="rejectReason" rows="4" class="w-full" placeholder="Nhập lý do..."/>
            <template #footer>
                <Button label="Hủy" severity="secondary" @click="showRejectDialog = false" />
                <Button label="Từ chối" severity="danger" @click="handleReject" :disabled="!rejectReason.trim()" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
/* Basic styles for layout */
.space-y-6 > *:not(:last-child) { margin-bottom: 1.5rem; }
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
.text-orange-600 { color: #ea580c; }
.text-red-600 { color: #dc2626; }
.text-blue-600 { color: #2563eb; }
.w-full { width: 100%; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
</style>
