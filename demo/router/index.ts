import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/bar-chart',
    name: 'Bar Chart',
    component: () => import('../views/BarChart.vue'),
  },
  {
    path: '/diverging-bar-chart',
    name: 'Diverging Bar Chart',
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
    path: '/histogram-chart',
    name: 'Histogram',
    component: () => import('../views/HistogramChartSection.vue'),
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
