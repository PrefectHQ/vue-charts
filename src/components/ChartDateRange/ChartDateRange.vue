<template>
  <div ref="chart" class="chart-date-range">
    <slot v-bind="{ startDate, endDate }" />
    <p-key-value label="Start date" :value="startDate" />
    <p-key-value label="End date" :value="endDate" />
  </div>
</template>

<script lang="ts" setup>
  import { useElementRect } from '@prefecthq/vue-compositions'
  import { select, scaleTime, zoom, D3ZoomEvent } from 'd3'
  import { onMounted, ref, toRefs, watch } from 'vue'
  import { ChartDateRangeOptions, DateRange } from '@/components/ChartDateRange/types'

  const props = defineProps<{
    startDate: Date | null,
    endDate: Date | null,
    options?: ChartDateRangeOptions,
  }>()

  const emit = defineEmits<{
    (event: 'update:startDate' | 'update:endDate', value: Date): void,
    (event: 'updated', value: DateRange): void,
  }>()

  const { startDate, endDate } = toRefs(props)
  const chart = ref<Element>()
  const { width: chartWidth } = useElementRect(chart)

  const xScale = scaleTime().domain([])

  watch([startDate, endDate, chartWidth], ([start, end, width]) => {
    xScale.range([0, width])

    const domainUnset = xScale.domain().length === 0

    if (domainUnset && start && end) {
      xScale.domain([start, end])
    }

  }, { immediate: true })

  onMounted(() => {
    init()
  })

  function init(): void {
    if (!chart.value) {
      return
    }

    const zoomed = zoom()
      .on('zoom', onZoom)
      .on('end', onZoomEnd)

    select(chart.value).call(zoomed)
  }

  function onZoom(event: D3ZoomEvent<Element, Date>): void {
    const scale = event.transform.rescaleX(xScale)
    const [startDate, endDate] = scale.domain()

    emit('update:startDate', startDate)
    emit('update:endDate', endDate)
  }

  function onZoomEnd(event: D3ZoomEvent<Element, Date>): void {
    const scale = event.transform.rescaleX(xScale)
    const [startDate, endDate] = scale.domain()

    emit('updated', { startDate, endDate })
  }
</script>