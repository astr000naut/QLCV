import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import Tooltip from 'primevue/tooltip';



import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

import 'primeicons/primeicons.css'


const app = createApp(App)

app.use(createPinia())

// Initialize auth store and try auto-login before router
const authStore = useAuthStore()
authStore.tryAutoLogin()
app.directive('tooltip', Tooltip);

app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.p-dark',
            cssLayer: false
        }
    }
});
app.use(ConfirmationService);
app.use(ToastService);

app.mount('#app')
