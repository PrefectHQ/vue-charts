import '@/styles/style.css'
// Prefect styles need to be imported after the demo styles so the
// tailwind base styles don't override prefect component CSS selectors.
import '@prefecthq/prefect-design/dist/style.css'

import { plugin as PrefectDesign } from '@prefecthq/prefect-design'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(PrefectDesign)
app.use(router)

app.config.performance = true

app.mount('#app')
