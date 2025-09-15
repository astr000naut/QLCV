<template>
  <Card class="h-full">
    <template #title>
      <div class="text-lg font-semibold">Tài liệu gần đây</div>
    </template>
    <template #content>
      <DataTable :value="documents" stripedRows showGridlines paginator :rows="5" responsiveLayout="scroll">
        <Column field="name" header="Tên tài liệu"></Column>
        <Column field="uploader.name" header="Người tải lên"></Column>
        <Column field="uploadedAt" header="Ngày tải lên">
            <template #body="slotProps">
                {{ formatDateTime(slotProps.data.uploadedAt) }}
            </template>
        </Column>
         <Column header="Hành động">
            <template #body="slotProps">
                <Button icon="pi pi-eye" text rounded @click="viewDocument(slotProps.data.id)" />
            </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { format } from 'date-fns';

const props = defineProps({
    documents: {
        type: Array,
        required: true
    }
});

const router = useRouter();

const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return format(new Date(dateTime), 'dd/MM/yyyy HH:mm');
};

const viewDocument = (id) => {
    router.push({ name: 'document-detail', params: { id } });
}
</script>

<style scoped>
.text-lg {
    font-size: 1.125rem;
}
.font-semibold {
    font-weight: 600;
}
.h-full {
    height: 100%;
}
</style>
