import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/bar-chart',
    name: 'BarChart',
    component: () => import('../views/BarChart.vue'),
  },
  {
    path: '/diverging-bar-chart',
    name: 'DivergingBarChart',
    component: () => import('../views/DivergingBarChart.vue'),
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
