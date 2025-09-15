<script setup>
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
  visible: Boolean,
  existingFolders: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'confirm']);
const toast = useToast();
const folderName = ref('');

watch(() => props.visible, (isVisible) => {
    if (!isVisible) {
        folderName.value = '';
    }
});

const handleConfirm = () => {
    const trimmedName = folderName.value.trim();
    if (!trimmedName) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Tên thư mục không được để trống', life: 3000 });
        return;
    }
    if (props.existingFolders.includes(trimmedName)) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Tên thư mục đã tồn tại', life: 3000 });
        return;
    }
    emit('confirm', trimmedName);
    closeDialog();
};

const closeDialog = () => {
    emit('update:visible', false);
};
</script>

<template>
    <Dialog header="Tạo thư mục mới" :visible="visible" @update:visible="closeDialog" modal style="width: 425px">
        <p>Nhập tên cho thư mục mới. Tên thư mục phải là duy nhất.</p>
        <div class="field my-4">
            <label for="folder-name">Tên thư mục</label>
            <InputText id="folder-name" v-model="folderName" @keydown.enter="handleConfirm" autofocus placeholder="Nhập tên thư mục..."/>
        </div>
        <template #footer>
            <Button label="Hủy" severity="secondary" @click="closeDialog" />
            <Button label="Tạo thư mục" @click="handleConfirm" />
        </template>
    </Dialog>
</template>
<style scoped>
.field { display: flex; flex-direction: column; gap: 0.5rem; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
</style>
