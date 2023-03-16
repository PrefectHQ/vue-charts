<template>
  <div ref="chart" class="chart-selection">
    <slot />
    <div class="chart-selection__selection" :style="selectionStyles" />
    <div ref="label" class="chart-selection__label" :style="labelStyles">
      <template v-if="selectionStart && selectionEnd">
        {{ formatDate(selectionStart) }} - {{ formatDate(selectionEnd) }}
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { toPixels } from '@prefecthq/prefect-design'
  import { useElementRect } from '@prefecthq/vue-compositions'
  import { select, drag, pointer, ScaleTime } from 'd3'
  import { format } from 'date-fns'
  import { computed, onMounted, ref, toRefs } from 'vue'
  import { ChartSelection } from '@/components/ChartSelection/types'
  import { sortByDate } from '@/utilities/sortByDate'

  type HTMLMouseEvent = MouseEvent & { target: HTMLElement }
  type DragEvent = { x: number, dx: number, sourceEvent: HTMLMouseEvent }

  const props = defineProps<{
    xScale: ScaleTime<number, number>,
    selectionStart: Date | null,
    selectionEnd: Date | null,
  }>()

  const emit = defineEmits<{
    (event: 'selection', value: ChartSelection): void,
    (event: 'update:selectionStart' | 'update:selectionEnd', value: Date | null): void,
  }>()

  onMounted(() => {
    init()
  })

  const { xScale } = toRefs(props)
  const chart = ref<Element>()
  const { width: chartWidth } = useElementRect(chart)
  const label = ref<Element>()
  const { width: labelWidth } = useElementRect(label)

  const selectionStart = computed(() => props.selectionStart ?? null)
  const selectionEnd = computed(() => props.selectionEnd ?? null)
  const dragStart = ref<Date | null>(null)
  const dragStop = ref<Date | null>(null)

  const selection = computed<ChartSelection | null>(() => {
    if (!selectionStart.value || !selectionEnd.value) {
      return null
    }

    return sortByDate([selectionStart.value, selectionEnd.value]) as ChartSelection
  })

  const selectionStyles = computed(() => {
    if (!dragStart.value || !dragStop.value) {
      return {
        display: 'none',
      }
    }

    const [start, stop] = sortByDate([dragStart.value, dragStop.value])
    const left = xScale.value(start)
    const right = chartWidth.value - xScale.value(stop)

    return {
      left: toPixels(left),
      right: toPixels(right),
    }
  })

  const labelStyles = computed(() => {
    if (!dragStart.value || !dragStop.value) {
      return {
        display: 'none',
      }
    }

    const startValue = xScale.value(dragStart.value)
    const stopValue = xScale.value(dragStop.value)
    const middle = (startValue + stopValue) / 2
    const halfOfLabel = labelWidth.value / 2
    let left = middle - halfOfLabel

    if (left < 0) {
      left = 0
    }

    if (left + labelWidth.value > chartWidth.value) {
      left = chartWidth.value - labelWidth.value
    }

    return {
      left: toPixels(left),
    }
  })

  function init(): void {
    if (!chart.value) {
      return
    }

    const dragSelection = drag()
      .on('start', onDragStart)
      .on('drag', onDrag)
      .on('end', onDragEnd)

    select(chart.value).call(dragSelection)
  }

  function onDragStart(event: DragEvent): void {
    dragStart.value = null
    dragStop.value = null

    const [mouseX] = pointer(event, chart.value)
    dragStart.value = xScale.value.clamp(true).invert(mouseX)

    update()
  }

  function onDrag(event: DragEvent): void {
    const [mouseX] = pointer(event, chart.value)
    const value = xScale.value.clamp(true).invert(mouseX)

    dragStop.value = value

    update()
  }

  function onDragEnd(): void {
    if (!selection.value) {
      return
    }

    emit('selection', selection.value)
  }

  function update(): void {
    if (!dragStart.value || !dragStop.value) {
      emit('update:selectionStart', null)
      emit('update:selectionEnd', null)

      return
    }

    const [start, stop] = sortByDate([dragStart.value, dragStop.value])
    emit('update:selectionStart', start)
    emit('update:selectionEnd', stop)
  }

  function formatDate(value: Date): string {
    return format(value, 'MMM do, hh:mm a')
  }
</script>

<style>
.chart-selection { @apply
  grid
  grid-cols-1
  relative
}

.chart-selection__selection { @apply
  absolute
  top-0
  bottom-0
  border-sky-500
  bg-sky-500
  border-l-[1px]
  border-r-[1px]
  bg-opacity-25
  pointer-events-none
}

.chart-selection__label { @apply
  absolute
  top-0
  whitespace-nowrap;
  transform: translateY(calc(-100% - theme('spacing.2')))
}
</style>