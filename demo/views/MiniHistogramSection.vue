<template>
  <ComponentPage title="Mini Histogram" :demos="demos">
    <template #basic>
      <MiniHistogram :data="data" />
    </template>
    <template #with-clickable-bars>
      <MiniHistogram :data="data" :options="{ clickable: true }" @bar-click="onBarClick" />
    </template>
  </ComponentPage>
</template>

<script lang="ts" setup>
  import { NumberRouteParam, useRouteQueryParam } from '@prefecthq/vue-compositions'
  import { endOfWeek, startOfWeek } from 'date-fns'
  import { computed, ref } from 'vue'
  import ComponentPage from '../components/ComponentPage.vue'
  import { generateBarChartData } from '../data'
  import { MiniHistogramBar } from '@/components'
  import MiniHistogram from '@/components/MiniHistogram/MiniHistogram.vue'

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

    return items
  })

  const demos = [
    { title: 'Basic' },
    { title: 'With clickable bars' },
  ]

  function onBarClick(bar: MiniHistogramBar): void {
    console.log('Clicked bar:', bar)
  }
</script>