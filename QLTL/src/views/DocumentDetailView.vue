<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Avatar from 'primevue/avatar';
import Timeline from 'primevue/timeline';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import DocumentStatusBadge from '../components/DocumentStatusBadge.vue';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import apiClient from '@/api';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const document = ref(null);
const loading = ref(true);
const error = ref(null);

const comments = ref([
    {
        id: 1,
        user: { name: 'Văn A', avatar: null },
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        text: 'Tài liệu này cần xem xét kỹ hơn ở mục 3.2.'
    },
    {
        id: 2,
        user: { name: 'Thị B', avatar: null },
        timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
        text: 'Đã xem, tôi sẽ cập nhật lại số liệu.'
    },
]);
const newComment = ref('');

async function fetchDocument() {
    loading.value = true;
    error.value = null;
    try {
        const response = await apiClient.get(`/documents/${route.params.id}`);
        document.value = response.data;
    } catch (err) {
        console.error("Failed to fetch document:", err);
        error.value = "Không tìm thấy tài liệu hoặc đã có lỗi xảy ra.";
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.value, life: 3000 });
    } finally {
        loading.value = false;
    }
}

onMounted(fetchDocument);


const showRejectDialog = ref(false);
const rejectReason = ref('');

async function updateStatus(status, comment = '') {
    try {
        await apiClient.post(`/documents/${document.value.id}/status`, { status, comment });
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Trạng thái tài liệu đã được cập nhật.', life: 3000 });
        showRejectDialog.value = false;
        rejectReason.value = '';
        await fetchDocument(); // Refresh document data
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật trạng thái.', life: 3000 });
    }
}

const postComment = () => {
    if(newComment.value.trim()){
        comments.value.push({
            id: comments.value.length + 1,
            user: { name: authStore.user.name, avatar: null },
            timestamp: new Date(),
            text: newComment.value.trim()
        });
        newComment.value = '';
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã gửi bình luận.', life: 2000 });
    }
}

const formatDateTime = (dateString) => dateString ? format(new Date(dateString), 'p, dd/MM/yyyy', { locale: vi }) : 'N/A';
const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

const isPreviewableImage = computed(() => {
    if (!document.value?.fileUrl) return false;
    const imageUrl = document.value.fileUrl.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'];
    return imageExtensions.some(ext => imageUrl.endsWith(ext));
});
</script>

<template>
    <div class="bg-slate-50 p-4 h-full flex flex-col">
        <div v-if="loading" class="text-center p-4">Đang tải chi tiết tài liệu...</div>
        <div v-else-if="error" class="bg-white rounded-lg shadow-sm p-6">{{ error }}</div>
        <div v-else-if="document" class="max-w-screen-2xl mx-auto w-full flex flex-col flex-grow">
            <!-- Header -->
            <header class="flex flex-wrap items-center justify-between gap-4 mb-4 flex-shrink-0">
                <div class="flex items-center gap-3">
                    <Button icon="pi pi-arrow-left" text rounded @click="router.back()" aria-label="Quay lại" />
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800">{{ document.name }}</h1>
                        <p class="text-sm text-gray-500">
                            Tải lên bởi <span class="font-medium text-gray-600">{{ document.uploader.name }}</span> vào lúc {{ formatDateTime(document.uploadedAt) }}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <DocumentStatusBadge :status="document.status" />
                    <div v-if="document.status === 'pending' && authStore.user.role === 'admin'" class="flex items-center gap-2">
                        <Button label="Từ chối" severity="danger" outlined @click="showRejectDialog = true" />
                        <Button label="Phê duyệt" severity="success" @click="updateStatus('approved', 'Đã được phê duyệt.')" />
                    </div>
                </div>
            </header>
            
            <div class="grid lg:grid-cols-12 gap-4 flex-grow min-h-0">
                <!-- Left Column: Document Info -->
                <div class="lg:col-span-3 h-full">
                    <div class="bg-white p-4 rounded-lg shadow-sm h-full overflow-y-auto">
                        <h2 class="text-lg font-semibold text-gray-800 mb-3">Thông tin chi tiết</h2>
                        <div class="space-y-3 text-sm">
                            <div>
                                <p class="text-xs text-gray-500 mb-1">Tên tài liệu</p>
                                <p class="font-medium text-gray-700">{{ document.name }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 mb-1">Mô tả</p>
                                <p class="font-medium text-gray-700">{{ document.description || 'Không có mô tả.' }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 mb-1">Người xử lý</p>
                                <p class="font-medium text-gray-700">{{ document.handler?.name || 'Chưa có' }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 mb-1">Hạn xử lý</p>
                                <p class="font-medium text-gray-700">{{ formatDateTime(document.deadline) }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 mb-1">Tên file</p>
                                <a :href="document.fileUrl" target="_blank" class="font-medium text-blue-600 hover:underline break-all">{{ document.name }}</a>
                            </div>
                        </div>

                        <hr class="my-4 border-gray-200" />
                        
                        <h2 class="text-lg font-semibold text-gray-800 mb-3">Lịch sử xử lý</h2>
                        <Timeline :value="document.history" align="left" class="customized-timeline">
                            <template #marker="slotProps">
                                <span class="custom-marker">
                                    <i class="pi pi-check text-xs"></i>
                                </span>
                            </template>
                            <template #content="slotProps">
                                <p class="font-medium text-sm text-gray-700">{{ slotProps.item.action }} bởi {{ slotProps.item.user }}</p>
                                <small class="text-gray-500 text-xs">{{ formatDateTime(slotProps.item.timestamp) }}</small>
                                <p v-if="slotProps.item.comment" class="text-sm mt-1 p-2 bg-gray-100 rounded">{{ slotProps.item.comment }}</p>
                            </template>
                        </Timeline>
                    </div>
                </div>

                <!-- Center Column: Document Preview -->
                <div class="lg:col-span-6 h-full">
                    <div class="bg-white rounded-lg shadow-sm h-full flex flex-col">
                       <div class="p-4 border-b border-gray-200 flex-shrink-0">
                           <h2 class="text-lg font-semibold text-gray-800">Xem trước tài liệu</h2>
                       </div>
                        <div class="p-2 flex-grow relative">
                            <img v-if="isPreviewableImage" :src="document.fileUrl" class="w-full h-full object-contain absolute top-0 left-0" alt="Xem trước tài liệu" />
                             <iframe v-else :src="document.fileUrl" frameborder="0" class="w-full h-full rounded-b-lg absolute top-0 left-0"></iframe>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Chat/Comments -->
                <div class="lg:col-span-3 h-full">
                    <div class="bg-white rounded-lg shadow-sm h-full flex flex-col">
                        <h2 class="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">Thảo luận</h2>
                        <!-- Comment List -->
                        <div class="flex-1 space-y-5 overflow-y-auto p-4">
                            <div v-for="comment in comments" :key="comment.id" class="flex items-start gap-3">
                                <Avatar :label="getInitials(comment.user.name)" shape="circle" class="mt-1" />
                                <div class="flex-1">
                                    <div class="bg-gray-100 rounded-lg rounded-tl-none p-3">
                                        <p class="font-semibold text-sm text-gray-800">{{ comment.user.name }}</p>
                                        <p class="text-sm text-gray-700">{{ comment.text }}</p>
                                    </div>
                                    <small class="text-gray-400 text-xs">{{ timeAgo(comment.timestamp) }}</small>
                                </div>
                            </div>
                        </div>
                        <!-- Comment Input -->
                        <div class="p-4 border-t border-gray-200">
                            <div class="flex items-center gap-2">
                                <Avatar :label="getInitials(authStore.user?.name || 'U')" shape="circle" />
                                <InputText v-model="newComment" placeholder="Viết bình luận..." class="flex-1 !text-sm" @keyup.enter="postComment" />
                                <Button icon="pi pi-send" rounded @click="postComment" :disabled="!newComment.trim()" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog header="Từ chối tài liệu" v-model:visible="showRejectDialog" modal style="width: 450px">
                <div class="flex flex-col gap-3">
                    <label for="rejectReason">Vui lòng nhập lý do từ chối:</label>
                    <Textarea id="rejectReason" v-model="rejectReason" rows="4" />
                </div>
                <template #footer>
                    <Button label="Hủy" text @click="showRejectDialog = false" />
                    <Button label="Xác nhận từ chối" severity="danger" @click="updateStatus('rejected', rejectReason)" :disabled="!rejectReason.trim()" />
                </template>
            </Dialog>
        </div>
        <div v-else>
            <div class="bg-white rounded-lg shadow-sm p-6">Không tìm thấy tài liệu</div>
        </div>
    </div>
</template>

<style scoped>
.custom-marker {
    display: flex;
    width: 1.5rem;
    height: 1.5rem;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    border-radius: 50%;
    background-color: var(--p-primary-color);
    border: 2px solid var(--p-primary-50);
}

:deep(.p-timeline-event-opposite) {
    display: none;
}

:deep(.p-timeline-event-content),
:deep(.p-timeline-event-marker) {
    padding-top: 0;
}

:deep(.p-inputtext) {
    width: 100%;
}
</style>
