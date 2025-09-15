<script setup>
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import CreateFolderDialog from './CreateFolderDialog.vue';

const props = defineProps({
  groupedDocuments: Object,
});

const emit = defineEmits(['folderSelect', 'folderCreate', 'folderRename', 'folderDelete']);

const confirm = useConfirm();
const toast = useToast();

const editingFolder = ref(null);
const editValue = ref('');
const showCreateDialog = ref(false);
const menu = ref();
const selectedFolderMenu = ref(null);

const menuItems = ref([
    { label: 'Xem tài liệu', icon: 'pi pi-eye', command: () => emit('folderSelect', selectedFolderMenu.value) },
    { label: 'Đổi tên', icon: 'pi pi-pencil', command: () => handleRenameStart(selectedFolderMenu.value) },
    { label: 'Xóa thư mục', icon: 'pi pi-trash', command: () => confirmDeleteFolder(selectedFolderMenu.value) }
]);

const toggleMenu = (event, folderName) => {
    selectedFolderMenu.value = folderName;
    menu.value.toggle(event);
};

const handleRenameStart = (folderName) => {
    editingFolder.value = folderName;
    editValue.value = folderName;
};

const handleRenameConfirm = () => {
    if (editingFolder.value && editValue.value.trim() && editValue.value !== editingFolder.value) {
        if (props.groupedDocuments[editValue.value]) {
            toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Tên thư mục đã tồn tại', life: 3000 });
            return;
        }
        emit('folderRename', { oldName: editingFolder.value, newName: editValue.value.trim() });
    }
    editingFolder.value = null;
    editValue.value = '';
};

const confirmDeleteFolder = (folderName) => {
    confirm.require({
        message: `Bạn có chắc chắn muốn xóa thư mục "${folderName}"? Các tài liệu sẽ được chuyển về "Chưa phân loại".`,
        header: 'Xác nhận xóa',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            emit('folderDelete', folderName);
        }
    });
};
</script>

<template>
    <div>
        <div class="mb-6">
            <Button label="Tạo thư mục mới" icon="pi pi-folder-plus" @click="showCreateDialog = true" />
        </div>

        <div class="grid-view">
            <Card v-for="(docs, category) in groupedDocuments" :key="category" class="folder-card">
                <template #content>
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3 flex-1 min-w-0" @click="!editingFolder && emit('folderSelect', category)">
                             <i class="pi pi-folder text-4xl text-primary"></i>
                            <div class="min-w-0 flex-1">
                                <InputText v-if="editingFolder === category" v-model="editValue" @blur="handleRenameConfirm" @keydown.enter="handleRenameConfirm" autofocus />
                                <h3 v-else class="font-semibold truncate">{{ category }}</h3>
                                <p class="text-sm text-gray-500">{{ docs.length }} tài liệu</p>
                            </div>
                        </div>
                        <Button icon="pi pi-ellipsis-v" text rounded @click="toggleMenu($event, category)" />
                        <Menu ref="menu" :model="menuItems" :popup="true" />
                    </div>
                </template>
            </Card>
        </div>

        <CreateFolderDialog 
            v-model:visible="showCreateDialog" 
            :existingFolders="Object.keys(groupedDocuments)"
            @confirm="(name) => emit('folderCreate', name)"
        />
    </div>
</template>

<style scoped>
.mb-6 { margin-bottom: 1.5rem; }
.grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.folder-card { cursor: pointer; transition: box-shadow .2s; }
.folder-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.flex { display: flex; }
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-3 { gap: 0.75rem; }
.flex-1 { flex: 1; }
.min-w-0 { min-width: 0; }
.text-4xl { font-size: 2.25rem; }
.text-primary { color: #3b82f6; }
.font-semibold { font-weight: 600; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.text-sm { font-size: 0.875rem; }
.text-gray-500 { color: #6b7280; }
</style>
