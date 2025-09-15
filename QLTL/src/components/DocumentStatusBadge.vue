<script setup>
import { defineProps, computed } from 'vue';
import Tag from 'primevue/tag';

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const statusConfig = computed(() => {
  switch (props.status) {
    case 'approved':
      return { label: 'Đã duyệt', severity: 'success' };
    case 'pending':
      return { label: 'Chờ duyệt', severity: 'warning' };
    case 'rejected':
      return { label: 'Bị từ chối', severity: 'danger' };
    default:
      return { label: props.status, severity: 'info' };
  }
});
</script>

<template>
  <Tag :value="statusConfig.label" :severity="statusConfig.severity" />
</template>
