<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import apiClient from '@/api';

const route = useRoute();
const toast = useToast();
const taskId = route.params.id;

const task = ref(null);
const loading = ref(true);
const messageText = ref('');
const sending = ref(false);

async function fetchTask() {
  loading.value = true;
  try {
    const { data } = await apiClient.get(`/tasks/${taskId}`);
    task.value = data;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải chi tiết công việc', life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function sendMessage() {
  if (!messageText.value.trim()) return;
  sending.value = true;
  try {
    await apiClient.post(`/tasks/${taskId}/messages`, { message: messageText.value.trim() });
    messageText.value = '';
    await fetchTask();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Gửi tin nhắn thất bại', life: 3000 });
  } finally {
    sending.value = false;
  }
}

onMounted(fetchTask);
</script>

<template>
  <div class="bg-slate-50 p-4 h-full flex flex-col" v-if="task">
    <div class="max-w-screen-2xl mx-auto w-full flex flex-col flex-grow">
      <!-- Header -->
      <header class="flex flex-wrap items-center justify-between gap-4 mb-4 flex-shrink-0">
        <div class="flex items-center gap-3">
          <Button icon="pi pi-arrow-left" text rounded @click="$router.back()" aria-label="Quay lại" />
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ task.name }}</h1>
            <p class="text-sm text-gray-500">
              Tạo bởi <span class="font-medium text-gray-600">{{ task.createdBy?.name || '—' }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <Tag :value="task.status" />
          <div v-if="task.dueDate" class="text-sm text-gray-600">Hạn: {{ new Date(task.dueDate).toLocaleString() }}</div>
        </div>
      </header>

      <div class="grid lg:grid-cols-12 gap-4 flex-grow min-h-0">
        <!-- Left Column: Task Info & History -->
        <div class="lg:col-span-3 h-full">
          <div class="bg-white p-4 rounded-lg shadow-sm h-full overflow-y-auto">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Thông tin chi tiết</h2>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-1">Người xử lý</p>
                <p class="font-medium text-gray-700">{{ task.assignee?.name || 'Chưa có' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Mô tả</p>
                <p class="font-medium text-gray-700 whitespace-pre-line">{{ task.description || 'Không có mô tả.' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Người phê duyệt</p>
                <ul class="list-disc pl-4">
                  <li v-for="ap in task.approvers" :key="ap.id">{{ ap.name }}</li>
                  <li v-if="!task.approvers || task.approvers.length === 0">—</li>
                </ul>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Tài liệu đính kèm</p>
                <ul class="list-disc pl-4">
                  <li v-for="doc in task.documents" :key="doc.id">{{ doc.name }} <Tag :value="doc.status" severity="secondary" /></li>
                  <li v-if="!task.documents || task.documents.length === 0">—</li>
                </ul>
              </div>
            </div>

            <hr class="my-4 border-gray-200" />

            <h2 class="text-lg font-semibold text-gray-800 mb-3">Lịch sử xử lý</h2>
            <ul class="history">
              <li v-for="h in task.history" :key="h.id">
                <div class="row">
                  <div class="time">{{ new Date(h.timestamp).toLocaleString() }}</div>
                  <div class="content"><strong>{{ h.action }}</strong> <span v-if="h.actor_name">bởi {{ h.actor_name }}</span><span v-if="h.comment"> — {{ h.comment }}</span></div>
                </div>
              </li>
              <li v-if="!task.history || task.history.length === 0">—</li>
            </ul>
          </div>
        </div>

        <!-- Center Column: First Document Preview -->
        <div class="lg:col-span-6 h-full">
          <div class="bg-white rounded-lg shadow-sm h-full flex flex-col">
            <div class="p-4 border-b border-gray-200 flex-shrink-0">
              <h2 class="text-lg font-semibold text-gray-800">Xem trước tài liệu</h2>
              <div class="text-sm text-gray-500" v-if="task.documents && task.documents.length">{{ task.documents[0].name }}</div>
            </div>
            <div class="p-2 flex-grow relative">
              <template v-if="task.documents && task.documents.length && task.documents[0].fileUrl">
                <iframe :src="task.documents[0].fileUrl" frameborder="0" class="w-full h-full rounded-b-lg absolute top-0 left-0"></iframe>
              </template>
              <div v-else class="w-full h-full absolute top-0 left-0 flex items-center justify-center text-gray-500">Không có tài liệu để xem trước</div>
            </div>
          </div>
        </div>

        <!-- Right Column: Messages -->
        <div class="lg:col-span-3 h-full">
          <div class="bg-white rounded-lg shadow-sm h-full flex flex-col">
            <h2 class="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">Thảo luận</h2>
            <div class="flex-1 space-y-4 overflow-y-auto p-4">
              <div v-for="m in task.messages" :key="m.id" class="border rounded p-2">
                <div class="text-xs text-gray-500">{{ m.sender_name || 'Người dùng' }} • {{ new Date(m.sentAt).toLocaleString() }}</div>
                <div class="text-sm">{{ m.message }}</div>
              </div>
              <div v-if="!task.messages || task.messages.length === 0" class="text-sm text-gray-500">Chưa có tin nhắn</div>
            </div>
            <div class="p-4 border-t border-gray-200 flex gap-2">
              <Textarea v-model="messageText" rows="2" class="w-full" placeholder="Nhập tin nhắn..." />
              <Button label="Gửi" :loading="sending" @click="sendMessage" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">Đang tải...</div>
</template>

<style scoped>
.task-detail-page { display: flex; flex-direction: column; gap: 1rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.meta { display: flex; gap: .5rem; align-items: center; margin-top: .25rem; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.col-span-2 { grid-column: span 2; }
.list { margin: 0; padding-left: 1rem; }
.history .row { display: flex; gap: .75rem; }
.history .time { color: #6b7280; min-width: 200px; }
.messages { display: flex; flex-direction: column; gap: .75rem; max-height: 300px; overflow: auto; }
.message .meta { color: #6b7280; font-size: .875rem; }
.composer { display: flex; gap: .5rem; margin-top: .5rem; }
.w-full { width: 100%; }
.loading { padding: 2rem; text-align: center; }
.mt-2 { margin-top: .5rem; }
.whitespace-pre-line { white-space: pre-line; }
@media (max-width: 900px) {
  .grid-2 { grid-template-columns: 1fr; }
  .col-span-2 { grid-column: auto; }
}
</style>


