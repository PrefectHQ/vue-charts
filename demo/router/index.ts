import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/bar-chart',
    name: 'BarChart',
    component: () => import('../views/BarChart.vue'),
  },
  {
    path: '/',
    redirect: '/bar-chart'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
