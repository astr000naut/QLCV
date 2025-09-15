<script setup>
import Card from 'primevue/card';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const reportStats = [
    { title: "Tổng tài liệu", value: "1,248", change: "+12%", icon: 'pi pi-file', color: "text-blue-600" },
    { title: "Đã xử lý tháng này", value: "156", change: "+8%", icon: 'pi pi-check-square', color: "text-green-600" },
    { title: "Người dùng hoạt động", value: "24", change: "+4%", icon: 'pi pi-users', color: "text-purple-600" },
    { title: "Tỷ lệ duyệt", value: "87%", change: "+3%", icon: 'pi pi-chart-line', color: "text-orange-600" }
];
</script>

<template>
    <div class="space-y-6">
        <div class="page-header">
            <div>
                <h1 class="text-3xl font-bold">Báo cáo</h1>
                <p>Thống kê và báo cáo chi tiết về hệ thống</p>
            </div>
            <Button label="Xuất báo cáo" icon="pi pi-download" />
        </div>

        <div class="stats-grid">
            <Card v-for="(stat, index) in reportStats" :key="index">
                <template #content>
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm">{{ stat.title }}</p>
                            <div class="flex items-center gap-2">
                                <h3 class="text-2xl font-bold">{{ stat.value }}</h3>
                                <span class="text-xs text-green-600 font-medium">{{ stat.change }}</span>
                            </div>
                        </div>
                        <i :class="[stat.icon, stat.color]" class="text-2xl"></i>
                    </div>
                </template>
            </Card>
        </div>

        <TabView>
            <TabPanel header="Tổng quan">
                <div class="grid lg:grid-cols-2 gap-6">
                    <Card>
                        <template #title><div class="flex items-center gap-2"><i class="pi pi-chart-bar"></i> Tài liệu theo trạng thái</div></template>
                        <template #content>
                            <div class="space-y-4">
                                <div class="flex justify-between"><span>Chờ duyệt</span><span class="font-medium">24</span></div>
                                <div class="flex justify-between"><span>Đang xử lý</span><span class="font-medium">18</span></div>
                                <div class="flex justify-between"><span>Đã hoàn thành</span><span class="font-medium">156</span></div>
                            </div>
                        </template>
                    </Card>
                    <Card>
                        <template #title><div class="flex items-center gap-2"><i class="pi pi-calendar"></i> Hoạt động theo thời gian</div></template>
                        <template #content><p class="text-center py-8">Biểu đồ hoạt động sẽ được hiển thị ở đây</p></template>
                    </Card>
                </div>
            </TabPanel>
            <TabPanel header="Tài liệu"><Card><template #content><p>Báo cáo chi tiết về tài liệu sẽ được hiển thị ở đây</p></template></Card></TabPanel>
            <TabPanel header="Người dùng"><Card><template #content><p>Thống kê về hoạt động người dùng sẽ được hiển thị ở đây</p></template></Card></TabPanel>
            <TabPanel header="Hiệu suất"><Card><template #content><p>Các chỉ số hiệu suất hệ thống sẽ được hiển thị ở đây</p></template></Card></TabPanel>
        </TabView>
    </div>
</template>

<style scoped>
.space-y-6 > *:not(:last-child) { margin-bottom: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.text-sm { font-size: 0.875rem; }
.text-2xl { font-size: 1.5rem; }
.font-medium { font-weight: 500; }
.text-green-600 { color: #16a34a; }
.text-blue-600 { color: #2563eb; }
.text-purple-600 { color: #9333ea; }
.text-orange-600 { color: #ea580c; }
.grid { display: grid; }
.lg\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-6 { gap: 1.5rem; }
.space-y-4 > *:not(:last-child) { margin-bottom: 1rem; }
.text-center { text-align: center; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
</style>
