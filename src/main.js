import { createApp } from 'vue'
import pinia from './stores/counter'

import App from './App.vue'
import router from './router'

import 'normalize.css'
import Buefy from '@ntohq/buefy-next'
import 'buefy/dist/buefy.css'
import '@/utils/commonCss/global.scss'
import '@mdi/font/css/materialdesignicons.min.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Buefy)

app.mount('#app')
