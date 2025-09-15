<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import DatePicker from 'primevue/datepicker';
import apiClient from '@/api';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
  visible: Boolean,
  initialData: Object,
  title: String,
});

const emit = defineEmits(['update:visible', 'submit']);
const toast = useToast();

const defaultFormData = {
    name: "",
    description: "",
    handlerId: null,
    deadline: null
};

const formData = ref({ ...defaultFormData });
const users = ref([]);
const loadingUsers = ref(false);

// We are editing if initialData is provided
const isEditing = computed(() => !!props.initialData);

async function fetchUsers() {
  loadingUsers.value = true;
  try {
    const response = await apiClient.get('/users');
    users.value = response.data.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách người dùng.', life: 3000 });
  } finally {
    loadingUsers.value = false;
  }
}

watch(() => props.visible, (newValue) => {
  if (newValue) {
    fetchUsers();
    if (props.initialData) {
      // When editing, populate form with existing data
      formData.value = {
          ...props.initialData,
          // API might return full user object, ensure we only have the ID
          handlerId: props.initialData.handler?.id || props.initialData.handlerId,
          // Convert deadline string back to Date object for DatePicker
          deadline: props.initialData.deadline ? new Date(props.initialData.deadline) : null
      };
    } else {
      // When creating, reset to default (although this dialog is for editing only for now)
      formData.value = { ...defaultFormData };
    }
  }
});

const handleSubmit = () => {
  const dataToSend = {
    name: formData.value.name,
    description: formData.value.description,
    handlerId: formData.value.handlerId,
    deadline: formData.value.deadline ? formData.value.deadline.toISOString() : null
  };
  
  emit('submit', dataToSend);
  closeDialog();
};

const closeDialog = () => {
  emit('update:visible', false);
};
</script>

<template>
  <Dialog :header="title" :visible="visible" @update:visible="closeDialog" modal style="width: 500px">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="field">
        <label for="name">Tên tài liệu *</label>
        <InputText id="name" v-model="formData.name" required class="w-full" />
      </div>

       <div class="field">
          <label for="description">Mô tả</label>
          <Textarea id="description" v-model="formData.description" 
          placeholder="Nhập mô tả chi tiết về tài liệu..." rows="3" class="w-full" />
        </div>

      <div class="field">
          <label for="handler">Người xử lý *</label>
          <Dropdown 
            class="w-full"
            id="handler"
            v-model="formData.handlerId" 
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
            class="w-full"
            id="deadline"
            v-model="formData.deadline" 
            placeholder="Chọn ngày hết hạn"
            dateFormat="dd/mm/yy"
            showIcon
          />
        </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button label="Hủy" severity="secondary" @click="closeDialog" />
        <Button type="submit" :label="isEditing ? 'Cập nhật' : 'Tạo mới'" />
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 0.5rem; }
.space-y-4 > *:not(:last-child) { margin-bottom: 1rem; }
.w-full { width: 100%; }
.flex { display: flex; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
.mt-6 { margin-top: 1.5rem; }
</style>



