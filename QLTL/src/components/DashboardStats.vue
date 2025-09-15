<script setup>
import { defineProps, computed } from 'vue';
import Card from 'primevue/card';

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
});

const statItems = computed(() => [
    { title: "Tổng tài liệu", value: props.stats.totalDocuments, icon: 'pi pi-file' },
    { title: "Chờ duyệt", value: props.stats.pendingDocuments, icon: 'pi pi-clock' },
    { title: "Đã duyệt", value: props.stats.approvedDocuments, icon: 'pi pi-check-circle' },
    { title: "Bị từ chối", value: props.stats.rejectedDocuments, icon: 'pi pi-times-circle' },
    { title: "Tổng người dùng", value: props.stats.totalUsers, icon: 'pi pi-users' },
]);
</script>

<template>
  <div class="stats-grid">
    <Card v-for="item in statItems" :key="item.title">
      <template #title>
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-500">{{ item.title }}</span>
          <i :class="item.icon" class="text-primary"></i>
        </div>
      </template>
      <template #content>
        <div class="text-2xl font-bold">{{ item.value }}</div>
        <!-- Trend data removed as it's not in the API response -->
      </template>
    </Card>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
.text-primary {
  color: #3b82f6;
}
.text-gray-500 {
    color: #6b7280;
}
.text-green-500 {
    color: #22c55e;
}
.text-red-500 {
    color: #ef4444;
}
.justify-between {
    justify-content: space-between;
}
.items-center {
    align-items: center;
}
.flex {
    display: flex;
}
.font-medium {
    font-weight: 500;
}
.text-sm {
    font-size: 0.875rem;
}
.font-bold {
    font-weight: 700;
}
.text-2xl {
    font-size: 1.5rem;
}
.text-xs {
    font-size: 0.75rem;
}
.mt-1 {
    margin-top: 0.25rem;
}
.ml-1 {
    margin-left: 0.25rem;
}
</style>
