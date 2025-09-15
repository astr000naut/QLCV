<script setup>
import { computed } from 'vue';
import { format } from 'date-fns';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DocumentStatusBadge from './DocumentStatusBadge.vue';

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view', 'download']);

const fileIcon = computed(() => {
    switch (props.document.fileType) {
        case "pdf": return 'pi pi-file-pdf';
        case "docx": return 'pi pi-file-word';
        case "xlsx": return 'pi pi-file-excel';
        case "pptx": return 'pi pi-file-powerpoint';
        case "zip":
        case "rar": return 'pi pi-file-zip';
        case "jpg":
        case "jpeg":
        case "png":
        case "gif": return 'pi pi-image';
        default: return 'pi pi-file';
    }
});

const fileIconColor = computed(() => {
    switch (props.document.fileType) {
        case "pdf": return 'text-red-500';
        case "docx": return 'text-blue-500';
        case "xlsx": return 'text-green-500';
        case "pptx": return 'text-orange-500';
        default: return 'text-gray-500';
    }
});
</script>

<template>
  <Card class="document-card">
    <template #content>
      <div class="card-header">
        <div class="file-info">
          <i :class="[fileIcon, fileIconColor]" style="font-size: 1.5rem"></i>
          <div class="file-details">
            <h3 class="font-semibold text-sm truncate" :title="document.title">{{ document.title }}</h3>
            <p class="text-xs text-muted-foreground truncate" :title="document.fileName">{{ document.fileName }}</p>
          </div>
        </div>
        <DocumentStatusBadge :status="document.status" />
      </div>

      <div class="document-meta">
        <div v-if="document.assignedTo" class="meta-item">
          <i class="pi pi-user"></i>
          <span>Người xử lý: {{ document.assignedTo.name }}</span>
        </div>
        <div class="meta-item">
          <i class="pi pi-upload"></i>
          <span>Tải lên: {{ format(document.uploadedAt, 'dd/MM/yyyy') }}</span>
        </div>
      </div>

      <div class="card-actions">
        <Button label="Xem" icon="pi pi-eye" outlined size="small" @click="emit('view', document.id)" />
        <Button label="Tải" icon="pi pi-download" outlined size="small" @click="emit('download', document.id)" />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.document-card { transition: box-shadow 0.2s; }
.document-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}
.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}
.file-details {
  min-width: 0;
  flex: 1;
}
.font-semibold { font-weight: 600; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.text-muted-foreground { color: #6b7280; }
.document-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.card-actions > * {
  flex: 1;
}
.text-red-500 { color: #ef4444; }
.text-blue-500 { color: #3b82f6; }
.text-green-500 { color: #22c55e; }
.text-orange-500 { color: #f97316; }
.text-gray-500 { color: #6b7280; }
</style>
