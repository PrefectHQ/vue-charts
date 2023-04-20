<template>
  <div ref="chart" class="chart-zoom">
    <slot v-bind="{ startDate, endDate }" />
  </div>
</template>

<script lang="ts" setup>
  import { useElementRect } from '@prefecthq/vue-compositions'
  import { select, scaleTime, zoom, D3ZoomEvent, zoomIdentity } from 'd3'
  import { computed, onMounted, ref, toRefs, watch } from 'vue'
  import { ChartZoomOptions, DateRange } from '@/components/ChartZoom/types'

  const props = defineProps<{
    startDate: Date,
    endDate: Date,
    options?: ChartZoomOptions,
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

    scale.domain([startDate.value, endDate.value])
    scale.range([0, chartWidth.value])

    return scale
  })

  let zoomChanged = false
  let identityChanged = false

  watch(xScale, () => {
    if (chart.value && zoomChanged) {
      resetZoomIdentity()
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
    if (identityChanged) {
      identityChanged = false
      return
    }

    const scale = event.transform.rescaleX(xScale.value)
    const [startDate, endDate] = scale.domain()
    const range = restrictRange({ startDate, endDate })

    if (range === null) {
      resetZoomIdentity()
      return
    }

    emit('update:startDate', range.startDate)
    emit('update:endDate', range.endDate)

    zoomChanged = ''
  }

  function onZoomEnd(): void {
    emit('updated', {
      startDate: props.startDate,
      endDate: props.endDate,
    })
  }

  function resetZoomIdentity(): void {
    if (chart.value) {
      select(chart.value).call(zoomed.transform, zoomIdentity)
      identityChanged = true
    }
  }

  function restrictRange({ startDate: requestedStartDate, endDate: requestedEndDate }: DateRange): DateRange | null {
    const {
      minRangeInSeconds = -Infinity,
      maxRangeInSeconds = Infinity,
    } = props.options ?? {}

    let startDateInMilliseconds = requestedStartDate.getTime()
    let endDateInMilliseconds = requestedEndDate.getTime()

    const requestedRange = endDateInMilliseconds - startDateInMilliseconds
    const currentRange = props.endDate.getTime() - props.startDate.getTime()
    const minDateInMilliseconds = props.options?.minDate?.getTime() ?? -Infinity
    const maxDateInMilliseconds = props.options?.maxDate?.getTime() ?? Infinity
    const minRangeInMilliseconds = minRangeInSeconds * 1000
    const maxRangeInMilliseconds = maxRangeInSeconds * 1000
    const alreadyZoomedToMin = requestedRange < currentRange && currentRange <= minRangeInMilliseconds
    const alreadyZoomedToMax = requestedRange > currentRange && currentRange >= maxRangeInMilliseconds

    if (alreadyZoomedToMin || alreadyZoomedToMax) {
      return null
    }

    if (requestedRange > maxRangeInMilliseconds) {
      const difference = requestedRange - maxRangeInMilliseconds
      const millisecondsToMove = difference / 2

      startDateInMilliseconds = startDateInMilliseconds + millisecondsToMove
      endDateInMilliseconds = endDateInMilliseconds - millisecondsToMove
    }

    if (requestedRange < minRangeInMilliseconds) {
      const difference = minRangeInMilliseconds - requestedRange
      const secondsToMove = difference / 2

      startDateInMilliseconds = startDateInMilliseconds - secondsToMove
      endDateInMilliseconds = endDateInMilliseconds + secondsToMove
    }

    if (startDateInMilliseconds < minDateInMilliseconds) {
      const difference = minDateInMilliseconds - startDateInMilliseconds

      startDateInMilliseconds = startDateInMilliseconds + difference
      endDateInMilliseconds = endDateInMilliseconds + difference
    }

    if (endDateInMilliseconds > maxDateInMilliseconds) {
      const difference = endDateInMilliseconds - maxDateInMilliseconds

      startDateInMilliseconds = startDateInMilliseconds - difference
      endDateInMilliseconds = endDateInMilliseconds - difference
    }

    return {
      startDate: new Date(startDateInMilliseconds),
      endDate: new Date(endDateInMilliseconds),
    }
  }
</script>