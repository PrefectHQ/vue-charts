<template>
  <div>
    <LineChart :data="data" style="height: 400px" />
  </div>
</template>

<script lang="ts" setup>
  import { NumberRouteParam, useRouteQueryParam } from '@prefecthq/vue-compositions'
  import { endOfWeek, startOfWeek } from 'date-fns'
  import { computed, ref } from 'vue'
  import ComponentPage from '../components/ComponentPage.vue'
  import { DemoBarChartItem, generateBarChartData } from '../data'
  import LineChart from '@/components/LineChart/LineChart.vue'
  import { LineChartDataPoint } from '@/components/LineChart/types'

  const today = new Date()
  const start = ref(startOfWeek(today))
  const end = ref(endOfWeek(today))
  const buckets = useRouteQueryParam('buckets', NumberRouteParam, 100)

  const data = computed(() => {
    const { items } = generateBarChartData({
      buckets: buckets.value,
      intervalEnd: end.value,
      intervalStart: start.value,
    })

    return items.map(point => getPointPosition(point))
  })

  function getPointPosition(point: DemoBarChartItem): LineChartDataPoint {
    const x = new Date((point.intervalStart.getTime() + point.intervalEnd.getTime()) / 2)
    const y = point.value

    return [x, y]
  }
</script>