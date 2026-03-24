import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './app.vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')