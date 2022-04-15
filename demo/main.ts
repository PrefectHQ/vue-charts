import MiterDesign from '@prefecthq/miter-design'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

// Add global miter styles
import '@prefecthq/miter-design/dist/style.css'

const app = createApp(App)
app.use(MiterDesign)
app.use(router)

app.config.performance = true

app.config.errorHandler = (err, vm, info) => {
  // err: error trace
  // vm: component in which error occured
  // info: Vue specific error information such as lifecycle hooks, events etc.
  // TODO: Perform any custom logic or log to server
  console.log(err, vm, info)
}


app.mount('#app')
