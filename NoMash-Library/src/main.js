// import './assets/main.css'
// import '@/assets/style.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
// import DataTable from 'primevue/datatable'
// import Column from 'primevue/Column'

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

// app.component('DataTable', DataTable)
// app.component('Column', Column)

app.mount('#app')

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvpU0VNZ6BAcSBOVytfIV9SeDAbLr2B5c",
  authDomain: "fit5032-4eeab.firebaseapp.com",
  projectId: "fit5032-4eeab",
  storageBucket: "fit5032-4eeab.firebasestorage.app",
  messagingSenderId: "781450846986",
  appId: "1:781450846986:web:6c806cddb4d7948f4b10f3"
};

// Initialize Firebase
initializeApp(firebaseConfig);