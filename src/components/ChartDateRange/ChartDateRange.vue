<template>
  <div ref="chart" class="chart-date-range">
    <slot v-bind="{ startDate, endDate }" />
  </div>
</template>

<script lang="ts" setup>
  import { useElementRect } from '@prefecthq/vue-compositions'
  import { select, scaleTime, zoom, D3ZoomEvent, zoomIdentity } from 'd3'
  import { computed, onMounted, ref, toRefs, watch } from 'vue'
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

  const zoomed = zoom()
    .on('zoom', onZoom)
    .on('end', onZoomEnd)

  const xScale = computed(() => {
    const scale = scaleTime()

    scale.domain([startDate.value!, endDate.value!])
    scale.range([0, chartWidth.value])

    return scale
  })

  let zoomChanged = false

  watch(xScale, () => {
    if (chart.value && zoomChanged) {
      select(chart.value).call(zoomed.transform, zoomIdentity)
      zoomChanged = false
    }
  })

  onMounted(() => {
    init()
  })

  function init(): void {
    if (!chart.value) {
      return
    }

    select(chart.value).call(zoomed)
  }

  function onZoom(event: D3ZoomEvent<Element, Date>): void {
    const scale = event.transform.rescaleX(xScale.value)
    const [startDate, endDate] = scale.domain()

    emit('update:startDate', startDate)
    emit('update:endDate', endDate)

    zoomChanged = true
  }

  function onZoomEnd(event: D3ZoomEvent<Element, Date>): void {
    const scale = event.transform.rescaleX(xScale.value)
    const [startDate, endDate] = scale.domain()

    emit('updated', { startDate, endDate })

    zoomChanged = true
  }
</script>