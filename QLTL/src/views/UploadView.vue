<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import DatePicker from 'primevue/datepicker';
import { useToast } from 'primevue/usetoast';
import apiClient from '@/api';

const toast = useToast();
const router = useRouter();

// Form state
const name = ref('');
const description = ref('');
const handlerId = ref(null);
const fileToUpload = ref(null);
const deadline = ref(null);

// User list state
const users = ref([]);
const loadingUsers = ref(true);

// Fetch users on component mount
onMounted(async () => {
  try {
    const response = await apiClient.get('/users');
    users.value = response.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách người dùng.', life: 3000 });
  } finally {
    loadingUsers.value = false;
  }
});

const onFileSelect = (event) => {
    // We only support single file uploads for this form
    if (event.files && event.files.length > 0) {
        fileToUpload.value = event.files[0];
    }
};

const onFileRemove = () => {
    fileToUpload.value = null;
}

const handleSubmit = async () => {
    if (!name.value || !handlerId.value || !fileToUpload.value) {
        toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng điền đầy đủ thông tin, chọn người xử lý và tệp.', life: 3000 });
        return;
    }

    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('description', description.value);
    formData.append('handlerId', handlerId.value);
    formData.append('file', fileToUpload.value);

    if (deadline.value) {
        formData.append('deadline', deadline.value.toISOString());
    }

    try {
        const response = await apiClient.post('/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Tài liệu đã được tải lên.', life: 3000 });
        // Redirect to the new document's detail page
        router.push({ name: 'document-detail', params: { id: response.data.id } });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Tải lên thất bại.', life: 3000 });
    }
};
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Tải lên tài liệu Mới</h1>
      <p>Điền thông tin và chọn tệp để tải lên hệ thống.</p>
    </div>

    <Card>
      <template #content>
        <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="field">
                <label for="file_upload">Tệp tin *</label>
                <FileUpload 
                    name="document_file" 
                    @select="onFileSelect"
                    @remove="onFileRemove"
                    :multiple="false"
                    :showUploadButton="false"
                    :showCancelButton="false"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.ppt,.pptx" 
                    :maxFileSize="50000000"
                >
                    <template #empty>
                        <div class="text-center p-4 border-2 border-dashed rounded-md">
                            <i class="pi pi-upload text-4xl mb-2"></i>
                            <p>Kéo thả hoặc nhấn để chọn tệp.</p>
                        </div>
                    </template>
                </FileUpload>
            </div>

            <div class="field">
              <label for="name">Tên tài liệu *</label>
              <InputText id="name" v-model="name" placeholder="Ví dụ: Báo cáo Quý 1 năm 2024" required />
            </div>

            <div class="field">
              <label for="description">Mô tả</label>
              <Textarea id="description" v-model="description" 
              placeholder="Nhập mô tả chi tiết về tài liệu..." rows="3" />
            </div>
            
            
            <div class="field">
              <label for="handler">Người xử lý *</label>
              <Dropdown 
                class="w-[320px]"
                id="handler"
                v-model="handlerId" 
                :options="users" 
                optionLabel="name" 
                optionValue="id" 
                placeholder="Chọn người xử lý"
                :loading="loadingUsers"
                required
              />
            </div>

            <div class="field">
              <label for="deadline">Hạn xử lý</label>
              <DatePicker 
                class="w-[320px]"
                id="deadline"
                v-model="deadline" 
                placeholder="Chọn ngày hết hạn"
                dateFormat="dd/mm/yy"
                showIcon
                size="small"
              />
            </div>

            <Button type="submit" label="Tải lên tài liệu" icon="pi pi-upload" class="w-full" />
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.max-w-xl { max-width: 42rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.space-y-6 > *:not(:last-child) { margin-bottom: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.field { display: flex; flex-direction: column; gap: 0.5rem; }
.w-full { width: 100%; }
.text-center { text-align: center; }
.p-4 { padding: 1rem; }
.border-2 { border-width: 2px; }
.border-dashed { border-style: dashed; }
.rounded-md { border-radius: 0.375rem; }
.text-4xl { font-size: 2.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
</style>
