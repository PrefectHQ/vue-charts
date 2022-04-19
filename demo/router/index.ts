import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
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
    path: '/timeline',
    name: 'Timeline',
    component: () => import('../views/Timeline.vue'),
  },
  {
    path: '/scatter-plot',
    name: 'Scatter Plot',
    component: () => import('../views/ScatterPlot.vue'),
  },
  {
    path: '/heatmap',
    name: 'Heat Map',
    component: () => import('../views/Heatmap.vue'),
  },
  {
    path: '/',
    redirect: '/bar-chart',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
