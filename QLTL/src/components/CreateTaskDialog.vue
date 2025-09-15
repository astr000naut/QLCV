<script setup>
import { ref, onMounted, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import MultiSelect from 'primevue/multiselect';
import Dropdown from 'primevue/dropdown';
import DatePicker from 'primevue/datepicker';
import { useToast } from 'primevue/usetoast';
import apiClient from '@/api';

const props = defineProps({ visible: Boolean });
const emit = defineEmits(['update:visible', 'created']);
const toast = useToast();

const name = ref('');
const description = ref('');
const assigneeId = ref(null);
const approverIds = ref([]);
const dueDate = ref(null);
const documentIds = ref([]);

const users = ref([]);
const documents = ref([]);
const loading = ref(false);

const loadUsers = async () => {
  try { const res = await apiClient.get('/users'); users.value = res.data.data; } catch {}
};
const loadDocuments = async () => {
  try { const res = await apiClient.get('/documents', { params: { limit: 100 } }); documents.value = res.data.data; } catch {}
};

watch(() => props.visible, (v) => { if (v) { name.value=''; description.value=''; assigneeId.value=null; approverIds.value=[]; dueDate.value=null; documentIds.value=[]; loadUsers(); loadDocuments(); } });

const close = () => emit('update:visible', false);

const submit = async () => {
  if (!name.value) { toast.add({ severity:'warn', summary:'Thiếu thông tin', detail:'Vui lòng nhập tên công việc', life:3000 }); return; }
  loading.value = true;
  try {
    await apiClient.post('/tasks', {
      name: name.value,
      description: description.value,
      assigneeId: assigneeId.value,
      approverIds: approverIds.value,
      dueDate: dueDate.value ? dueDate.value.toISOString() : null,
      documentIds: documentIds.value
    });
    toast.add({ severity:'success', summary:'Thành công', detail:'Đã tạo công việc', life:3000 });
    emit('created');
    close();
  } catch (e) {
    toast.add({ severity:'error', summary:'Lỗi', detail:'Không thể tạo công việc', life:3000 });
  } finally { loading.value = false; }
};
</script>

<template>
  <Dialog header="Tạo công việc" :visible="visible" @update:visible="close" modal style="width: 640px">
    <div class="space-y-4">
      <div class="field">
        <label for="task-name">Tên công việc *</label>
        <InputText id="task-name" v-model="name" class="w-full" />
      </div>
      <div class="field">
        <label for="task-desc">Mô tả</label>
        <Textarea id="task-desc" v-model="description" rows="3" class="w-full" />
      </div>
      <div class="field">
        <label for="assignee">Người xử lý</label>
        <Dropdown id="assignee" v-model="assigneeId" :options="users" optionLabel="name" optionValue="id" class="w-full" placeholder="Chọn người xử lý" />
      </div>
      <div class="field">
        <label for="approvers">Người phê duyệt</label>
        <MultiSelect id="approvers" v-model="approverIds" :options="users" optionLabel="name" optionValue="id" class="w-full" placeholder="Chọn người phê duyệt" display="chip" />
      </div>
      <div class="field">
        <label for="due">Hạn xử lý</label>
        <DatePicker id="due" v-model="dueDate" class="w-full" showIcon />
      </div>
      <div class="field">
        <label for="docs">Đính kèm tài liệu</label>
        <MultiSelect id="docs" v-model="documentIds" :options="documents" optionLabel="name" optionValue="id" class="w-full" placeholder="Chọn tài liệu" display="chip" />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Hủy" severity="secondary" @click="close" />
        <Button label="Tạo công việc" :loading="loading" @click="submit" />
      </div>
    </div>
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


