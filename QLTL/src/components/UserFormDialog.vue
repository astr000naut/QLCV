<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import apiClient from '@/api';

const props = defineProps({
  visible: Boolean,
  initialData: Object,
  title: String,
});

const emit = defineEmits(['update:visible', 'submit']);

const defaultFormData = {
    name: "",
    email: "",
    role: "viewer",
    password: ""
};

const formData = ref({ ...defaultFormData });

// We are editing if initialData is provided
const isEditing = computed(() => !!props.initialData);

const roleOptions = ref([]);

async function fetchRoles() {
  try {
    const response = await apiClient.get('/roles');
    // Assuming the API returns roles with `name` for the label and `value` for the value field.
    // If the properties are different, you might need to adjust the mapping.
    roleOptions.value = response.data.data.map(role => ({
      label: role.name,
      value: role.value || role.name, // Fallback to name if value is not present
    }));
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    // Optionally, show a toast message to the user
  }
}

watch(() => props.visible, (newValue) => {
  if (newValue) {
    if (props.initialData) {
      // When editing, populate form with existing data
      formData.value = { ...props.initialData, password: '' }; // Password is not sent back, so clear it
    } else {
      // When creating, reset to default
      formData.value = { ...defaultFormData };
    }
  }
});

onMounted(fetchRoles);

const handleSubmit = () => {
  // Only send relevant fields to the parent
  const dataToSend = {
    name: formData.value.name,
    email: formData.value.email,
    role: formData.value.role,
  };

  if (!isEditing.value) {
    dataToSend.password = formData.value.password;
  }
  
  // For editing, API only accepts name and role, but we send email too.
  // The parent component logic will handle what to send to the API.
  // Let's send a cleaner object for PUT requests.
  if(isEditing.value) {
      const { email, password, ...updateData } = dataToSend;
      emit('submit', updateData);
  } else {
      emit('submit', dataToSend);
  }

  closeDialog();
};

const closeDialog = () => {
  emit('update:visible', false);
};
</script>

<template>
  <Dialog :header="title" :visible="visible" @update:visible="closeDialog" modal style="width: 425px">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="field">
        <label for="name">Họ và tên *</label>
        <InputText id="name" v-model="formData.name" required class="w-full" />
      </div>
      <div class="field">
        <label for="email">Email *</label>
        <InputText id="email" type="email" v-model="formData.email" :disabled="isEditing" required class="w-full" />
      </div>
       <div class="field" v-if="!isEditing">
        <label for="password">Mật khẩu *</label>
        <InputText id="password" type="password" v-model="formData.password" required class="w-full" />
      </div>
      <div class="field">
          <label>Vai trò</label>
          <Dropdown v-model="formData.role" :options="roleOptions" optionLabel="label" optionValue="value" class="w-full" />
      </div>
      <div class="flex justify-end gap-2">
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
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-4 { gap: 1rem; }
.flex { display: flex; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
</style>
