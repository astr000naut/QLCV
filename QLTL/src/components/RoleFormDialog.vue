<script setup>
import { ref, watch, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';

const props = defineProps({
  visible: Boolean,
  initialData: Object,
  title: String,
});

const emit = defineEmits(['update:visible', 'submit']);

const defaultFormData = {
    name: "",
    description: "",
};

const formData = ref({ ...defaultFormData });

const isEditing = computed(() => !!props.initialData);

watch(() => props.visible, (newValue) => {
  if (newValue) {
    formData.value = props.initialData ? { ...props.initialData } : { ...defaultFormData };
  }
});

const handleSubmit = () => {
  emit('submit', { ...formData.value });
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
        <label for="name">Tên vai trò *</label>
        <InputText id="name" v-model="formData.name" required class="w-full" />
      </div>
      <div class="field">
        <label for="description">Mô tả</label>
        <Textarea id="description" v-model="formData.description" class="w-full" autoResize rows="3" />
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
.flex { display: flex; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
</style>
