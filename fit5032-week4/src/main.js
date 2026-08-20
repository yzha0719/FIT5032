import './assets/main.css'
import './style.css'

import { createApp } from 'vue'
import App from './App.vue'

// import bootstrape css
import 'bootstrap/dist/css/bootstrap.min.css'
// import './style.css'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional


const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

createApp(App).mount('#app')