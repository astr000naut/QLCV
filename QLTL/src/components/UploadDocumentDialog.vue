<script setup>
import { ref, onMounted, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import DatePicker from 'primevue/datepicker';
import { useToast } from 'primevue/usetoast';
import apiClient from '@/api';

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['update:visible', 'uploaded']);
const toast = useToast();

// Form state
const name = ref('');
const description = ref('');
const handlerId = ref(null);
const fileToUpload = ref(null);
const deadline = ref(null);

// User list state
const users = ref([]);
const loadingUsers = ref(true);

// Use FileUpload header slot chooseCallback per docs
const chooseCb = ref(null);
const bindChooseCb = (cb) => {
  chooseCb.value = cb;
};
const openPicker = () => {
  if (typeof chooseCb.value === 'function') chooseCb.value();
};

const resetForm = () => {
  name.value = '';
  description.value = '';
  handlerId.value = null;
  fileToUpload.value = null;
  deadline.value = null;
};

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const response = await apiClient.get('/users');
    users.value = response.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách người dùng.', life: 3000 });
  } finally {
    loadingUsers.value = false;
  }
};

watch(() => props.visible, (v) => {
  if (v) {
    loadUsers();
    resetForm();
  }
});

const onFileSelect = (event) => {
  if (event.files && event.files.length > 0) {
    fileToUpload.value = event.files[0];
  }
};

const onFileRemove = () => {
  fileToUpload.value = null;
};

const closeDialog = () => emit('update:visible', false);

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
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Tài liệu đã được tải lên.', life: 3000 });
    emit('uploaded', response.data.id);
    closeDialog();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Tải lên thất bại.', life: 3000 });
  }
};
</script>

<template>
  <Dialog header="Tải lên tài liệu" :visible="visible" @update:visible="closeDialog" modal style="width: 600px">
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
          <template #header="{ chooseCallback }">
            <span style="display:none">{{ bindChooseCb(chooseCallback) }}</span>
          </template>
          <template #empty>
            <div class="text-center p-4 border-2 border-dashed rounded-md cursor-pointer" @click="openPicker">
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
        <Textarea id="description" v-model="description" placeholder="Nhập mô tả chi tiết về tài liệu..." rows="3" />
      </div>

      <div class="field">
        <label for="handler">Người xử lý *</label>
        <Dropdown 
          id="handler"
          v-model="handlerId" 
          :options="users" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Chọn người xử lý"
          :loading="loadingUsers"
          class="w-full"
          required
        />
      </div>

      <div class="field">
        <label for="deadline">Hạn xử lý</label>
        <DatePicker 
          id="deadline"
          v-model="deadline" 
          placeholder="Chọn ngày hết hạn"
          dateFormat="dd/mm/yy"
          showIcon
          class="w-full"
        />
      </div>

      <div class="flex justify-end gap-2 mt-2">
        <Button label="Hủy" severity="secondary" @click="closeDialog" />
        <Button type="submit" label="Tải lên tài liệu" icon="pi pi-upload" />
      </div>
    </form>
  </Dialog>
  
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 0.5rem; }
.space-y-6 > *:not(:last-child) { margin-bottom: 1.5rem; }
.text-center { text-align: center; }
.p-4 { padding: 1rem; }
.border-2 { border-width: 2px; }
.border-dashed { border-style: dashed; }
.rounded-md { border-radius: 0.375rem; }
.text-4xl { font-size: 2.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.cursor-pointer { cursor: pointer; }
.w-full { width: 100%; }
.flex { display: flex; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
.mt-2 { margin-top: 0.5rem; }
/* Hide PrimeVue FileUpload default choose/header buttons */
:deep(.p-fileupload-header) { display: none; }
:deep(.p-fileupload-file-badge) { display: none; }
:deep(.p-fileupload-content) {padding-top: 18px;}
</style>


