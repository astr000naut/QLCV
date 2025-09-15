<script setup>
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import Divider from 'primevue/divider';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const systemSettings = ref({
  companyName: "WorkDocMate Solutions",
  companyEmail: "admin@workdocmate.com",
  language: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  dateFormat: "DD/MM/YYYY",
  currency: "VND"
});

const notificationSettings = ref({
  emailNotifications: true,
  documentUploaded: true,
  taskAssigned: true,
  taskCompleted: false,
  systemMaintenance: true,
  weeklyReport: true
});

const securitySettings = ref({
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  sessionTimeout: 30,
  twoFactorAuth: false,
  loginAttempts: 5
});

const handleSave = (settingType) => {
    toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã lưu cài đặt ${settingType}`, life: 3000 });
}

</script>

<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-3xl font-bold">Cài đặt hệ thống</h1>
            <p>Quản lý cấu hình và tùy chỉnh hệ thống</p>
        </div>

        <TabView>
            <TabPanel>
                <template #header><i class="pi pi-cog mr-2"></i>Hệ thống</template>
                <Card>
                    <template #title>Cài đặt hệ thống</template>
                    <template #subtitle>Cấu hình thông tin công ty và tùy chỉnh giao diện</template>
                    <template #content>
                        <div class="grid md:grid-cols-2 gap-6">
                           <div class="field"><label>Tên công ty</label><InputText v-model="systemSettings.companyName" /></div>
                           <div class="field"><label>Email công ty</label><InputText type="email" v-model="systemSettings.companyEmail" /></div>
                           <div class="field"><label>Ngôn ngữ</label><Dropdown v-model="systemSettings.language" :options="[{label: 'Tiếng Việt', value: 'vi'}, {label: 'English', value: 'en'}]" optionLabel="label" optionValue="value" /></div>
                           <div class="field"><label>Múi giờ</label><Dropdown v-model="systemSettings.timezone" :options="[{label: 'GMT+7 (Việt Nam)', value: 'Asia/Ho_Chi_Minh'}, {label: 'UTC', value: 'UTC'}]" optionLabel="label" optionValue="value" /></div>
                           <div class="field"><label>Định dạng ngày</label><Dropdown v-model="systemSettings.dateFormat" :options="[{label: 'DD/MM/YYYY', value: 'DD/MM/YYYY'}, {label: 'MM/DD/YYYY', value: 'MM/DD/YYYY'}]" optionLabel="label" optionValue="value" /></div>
                           <div class="field"><label>Đơn vị tiền tệ</label><Dropdown v-model="systemSettings.currency" :options="[{label: 'VND (₫)', value: 'VND'}, {label: 'USD ($)', value: 'USD'}]" optionLabel="label" optionValue="value" /></div>
                        </div>
                        <Divider class="my-6" />
                        <div class="flex justify-end">
                            <Button label="Lưu cài đặt" @click="handleSave('hệ thống')" />
                        </div>
                    </template>
                </Card>
            </TabPanel>
             <TabPanel>
                <template #header><i class="pi pi-bell mr-2"></i>Thông báo</template>
                 <Card>
                    <template #title>Cài đặt thông báo</template>
                    <template #subtitle>Quản lý các loại thông báo</template>
                    <template #content>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center"><label>Thông báo qua email</label><InputSwitch v-model="notificationSettings.emailNotifications" /></div>
                            <Divider />
                            <h4 class="font-medium">Thông báo sự kiện</h4>
                            <div class="flex justify-between items-center"><label>Tài liệu được tải lên</label><InputSwitch v-model="notificationSettings.documentUploaded" /></div>
                            <div class="flex justify-between items-center"><label>Nhiệm vụ được giao</label><InputSwitch v-model="notificationSettings.taskAssigned" /></div>
                            <div class="flex justify-between items-center"><label>Nhiệm vụ hoàn thành</label><InputSwitch v-model="notificationSettings.taskCompleted" /></div>
                            <div class="flex justify-between items-center"><label>Bảo trì hệ thống</label><InputSwitch v-model="notificationSettings.systemMaintenance" /></div>
                            <div class="flex justify-between items-center"><label>Báo cáo hàng tuần</label><InputSwitch v-model="notificationSettings.weeklyReport" /></div>
                        </div>
                        <Divider class="my-6" />
                        <div class="flex justify-end">
                            <Button label="Lưu cài đặt" @click="handleSave('thông báo')" />
                        </div>
                    </template>
                </Card>
            </TabPanel>
            <TabPanel>
                <template #header><i class="pi pi-shield mr-2"></i>Bảo mật</template>
                <Card>
                    <template #title>Cài đặt bảo mật</template>
                    <template #subtitle>Quản lý chính sách bảo mật</template>
                    <template #content>
                        <div class="space-y-4">
                             <h4 class="font-medium">Chính sách mật khẩu</h4>
                             <div class="grid md:grid-cols-2 gap-4">
                                <div class="field"><label>Độ dài tối thiểu</label><Dropdown v-model="securitySettings.passwordPolicy.minLength" :options="[6, 8, 12]" /></div>
                                <div class="field"><label>Thời gian hết phiên (phút)</label><Dropdown v-model="securitySettings.sessionTimeout" :options="[15, 30, 60]" /></div>
                             </div>
                             <div class="flex justify-between items-center"><label>Yêu cầu chữ hoa</label><InputSwitch v-model="securitySettings.passwordPolicy.requireUppercase" /></div>
                             <div class="flex justify-between items-center"><label>Yêu cầu chữ thường</label><InputSwitch v-model="securitySettings.passwordPolicy.requireLowercase" /></div>
                             <div class="flex justify-between items-center"><label>Yêu cầu số</label><InputSwitch v-model="securitySettings.passwordPolicy.requireNumbers" /></div>
                             <div class="flex justify-between items-center"><label>Yêu cầu ký tự đặc biệt</label><InputSwitch v-model="securitySettings.passwordPolicy.requireSpecialChars" /></div>
                             <Divider />
                             <div class="flex justify-between items-center"><label>Xác thực hai yếu tố</label><InputSwitch v-model="securitySettings.twoFactorAuth" /></div>
                        </div>
                        <Divider class="my-6" />
                        <div class="flex justify-end">
                            <Button label="Lưu cài đặt" @click="handleSave('bảo mật')" />
                        </div>
                    </template>
                </Card>
            </TabPanel>
             <TabPanel>
                <template #header><i class="pi pi-database mr-2"></i>Sao lưu</template>
                <Card>
                    <template #title>Sao lưu & Phục hồi</template>
                    <template #subtitle>Quản lý sao lưu dữ liệu</template>
                    <template #content>
                        <p>Chức năng sao lưu và phục hồi sẽ được hiển thị ở đây.</p>
                    </template>
                </Card>
            </TabPanel>
        </TabView>
    </div>
</template>

<style scoped>
.space-y-6 > *:not(:last-child) { margin-bottom: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.grid { display: grid; }
.md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-6 { gap: 1.5rem; }
.flex { display: flex; }
.justify-end { justify-content: flex-end; }
.mr-2 { margin-right: 0.5rem; }
.field { display: flex; flex-direction: column; gap: 0.5rem; }
.space-y-4 > *:not(:last-child) { margin-bottom: 1rem; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.font-medium { font-weight: 500; }
.my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
</style>
