<template>
  <p-layout-default>
    <p-content class="histogram-chart-section">
      <div class="histogram-chart-section__controls">
        <p-label label="Start Date">
          <p-date-input v-model="start" />
        </p-label>
        <p-label label="End Date">
          <p-date-input v-model="end" />
        </p-label>
        <p-label label="Buckets">
          <p-number-input v-model="buckets" />
        </p-label>
      </div>

      <Histogram :data="data.items" />
    </p-content>
  </p-layout-default>
</template>

<script lang="ts" setup>
  import { endOfWeek, startOfWeek } from 'date-fns'
  import { computed, ref } from 'vue'
  import { generateBarChartData } from '../data'
  import Histogram, { HistogramData } from '@/components/HistogramChart.vue'

  const today = new Date()
  const start = ref(startOfWeek(today))
  const end = ref(endOfWeek(today))
  const buckets = ref(20)

  const data = computed(() => generateBarChartData({
    buckets: buckets.value,
    intervalStart: start.value,
    intervalEnd: end.value,
  }))
</script>

<style>
.histogram-chart-section__controls { @apply
  flex
  gap-2
}
</style>