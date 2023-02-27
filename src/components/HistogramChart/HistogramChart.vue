<template>
  <div v-if="data.length" class="histogram-chart" :class="classes.root">
    <div ref="chart" class="histogram-chart__chart">
      <template v-if="showSelection">
        <div ref="selection" class="histogram-chart__selection" :class="classes.selection" :style="selectionStyles">
          <div ref="selectionLeft" class="histogram-chart__selection-resize histogram-chart__selection-resize--left" />
          <div ref="selectionRight" class="histogram-chart__selection-resize histogram-chart__selection-resize--right" />
        </div>
      </template>

      <svg class="histogram-chart__svg" :width="chartWidth" :height="chartHeight" :viewbox="`0 0 ${chartWidth} ${chartHeight}`">
        <path ref="path" class="histogram-chart__path" :class="classes.path" :d="pathData!" />
      </svg>

      <template v-for="(bar, index) in bars" :key="index">
        <slot name="bar" v-bind="bar">
          <div class="histogram-chart__bar" :class="classes.bar" :style="bar.styles" />
        </slot>
      </template>
    </div>

    <template v-if="options.showYAxis">
      <div class="histogram-chart__axis-y">
        <div class="histogram-chart__label histogram-chart__label-y histogram-chart__label-y--min">
          <slot name="label-y" :value="maxScaleValue">
            <span class="histogram-chart__value-label">{{ maxScaleValue }}</span>
          </slot>
        </div>
        <div class="histogram-chart__label histogram-chart__label-y histogram-chart__label-y--max">
          <slot name="label-y" :value="0">
            <span class="histogram-chart__value-label">{{ 0 }}</span>
          </slot>
        </div>
      </div>
    </template>

    <template v-if="options.showXAxis">
      <div class="histogram-chart__axis-x">
        <div class="histogram-chart__label histogram-chart__label-x histogram-chart__label-x--start">
          <slot name="label-x" :value="startDate">
            <span class="histogram-chart__date-label">{{ formatDateLabel(startDate) }}</span>
            <span class="histogram-chart__time-label">{{ formatTimeLabel(startDate) }}</span>
          </slot>
        </div>
        <div class="histogram-chart__label histogram-chart__label-x histogram-chart__label-x--end">
          <slot name="label-x" :value="endDate">
            <span class="histogram-chart__date-label">{{ formatDateLabel(endDate) }}</span>
            <span class="histogram-chart__time-label">{{ formatTimeLabel(endDate) }}</span>
          </slot>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { Pixels, toPixels } from '@prefecthq/prefect-design'
  import { useElementRect } from '@prefecthq/vue-compositions'
  import * as d3 from 'd3'
  import { addSeconds, differenceInSeconds, format, isAfter, isBefore, subSeconds } from 'date-fns'
  import { computed, onMounted, ref, watch, watchEffect } from 'vue'
  import { defaultHistogramChartOptions, HistogramBar, HistogramBarStyles, HistogramChartOptions, HistogramData, HistogramDataPoint } from '@/components/HistogramChart'
  import { roundUpToIncrement } from '@/utilities/roundUpToIncrement'
  import { sortByDateProperty } from '@/utilities/sortByDate'

  type PointPosition = [x: number, y: number]
  type SelectionStyles = { left: Pixels, right: Pixels }
  type Selection = { selectionStart: Date, selectionEnd: Date }
  type DragEvent = { x: number, dx: number, sourceEvent: HTMLMouseEvent }
  type HTMLMouseEvent = MouseEvent & { target: HTMLElement }

  const props = defineProps<{
    data: HistogramData,
    smooth?: boolean,
    options?: HistogramChartOptions,
    startDate?: Date,
    endDate?: Date,
    selectionStart?: Date,
    selectionEnd?: Date,
  }>()

  const emit = defineEmits<{
    (event: 'update:selectionStart' | 'update:selectionEnd', value: Date | undefined): void,
    (event: 'selection', value: Selection): void,
  }>()

  const options = computed<Required<HistogramChartOptions>>(() => ({
    ...defaultHistogramChartOptions,
    ...props.options,
  }))

  const data = computed(() => sortByDateProperty(props.data, 'intervalStart'))
  const transitionDurationString = computed(() => `${options.value.transitionDuration}ms`)
  const showBars = computed(() => !props.smooth)
  const showSmooth = computed(() => props.smooth)
  const showSelection = computed(() => props.selectionEnd && props.selectionStart)
  const movingSelection = ref(false)
  const pathRendered = ref(false)

  const unwatchShowSelection = watch(showSelection, show => {
    if (show) {
      initSelectionDrag()
      unwatchShowSelection()
    }
  })

  onMounted(() => {
    if (showSelection.value) {
      unwatchShowSelection()
      initSelectionDrag()
    }
  })

  const path = ref<SVGElement>()
  const { width: pathWidth } = useElementRect(path)

  const chart = ref<Element>()
  const { width: chartWidth, height: chartHeight, x: chartX } = useElementRect(chart)

  const selection = ref<Element>()
  const selectionLeft = ref<Element>()
  const selectionRight = ref<Element>()

  const unwatchPathWidth = watch(pathWidth, width => {
    if (width > 0 && chartWidth.value > 0 && width >= chartWidth.value) {
      pathRendered.value = true
      unwatchPathWidth()
    }
  })

  watchEffect(() => document.body.classList.toggle('histogram-chart--dragging', movingSelection.value))

  const startDate = computed<Date>(() => {
    if (props.startDate) {
      return props.startDate
    }

    const firstDataPoint = data.value.at(0)!

    return firstDataPoint.intervalStart
  })

  const endDate = computed<Date>(() => {
    if (props.endDate) {
      return props.endDate
    }

    const lastDataPoint = data.value.at(-1)!

    return lastDataPoint.intervalEnd
  })

  const maxScaleValue = computed<number>(() => {
    const allValues = data.value.map(point => point.value)
    const max = Math.max(...allValues, 0)

    return roundUpToIncrement(max)
  })

  const xScale = computed(() => {
    const scale = d3.scaleTime()

    scale.domain([startDate.value, endDate.value])
    scale.range([0, chartWidth.value])

    return scale
  })

  const yScale = computed(() => {
    const scale = d3.scaleLinear()

    scale.domain([0, maxScaleValue.value])
    scale.range([0, chartHeight.value])

    return scale
  })

  const bars = computed(() => data.value.map(point => getBar(point)))

  const positions = computed<PointPosition[]>(() => {
    const points = data.value.map(point => getPointPosition(point))
    const [, firstY = 0] = points.shift() ?? []
    const [, lastY = firstY] = points.pop() ?? []
    const firstPoint: PointPosition = [0, firstY]
    const lastPoint: PointPosition = [chartWidth.value, lastY]

    // offset by 1 to make sure stroke isn't visible because of curving
    const bottomLeftCorner: PointPosition = [-1, chartHeight.value + 1]
    const bottomRightCorner: PointPosition = [chartWidth.value + 1, chartHeight.value + 1]

    const positions: PointPosition[] = [
      bottomLeftCorner,
      firstPoint,
      ...points,
      lastPoint,
      bottomRightCorner,
    ]

    if (!pathRendered.value || !showSmooth.value) {
      return positions.map(([x]) => [x, chartHeight.value])
    }

    return positions
  })

  const pathData = computed(() => {
    const line = d3.line()

    line.curve(options.value.curve)

    return line(positions.value)
  })

  const selectionStyles = computed<SelectionStyles | undefined>(() => {
    const { selectionStart: start, selectionEnd: end } = props

    if (!start || !end) {
      return undefined
    }

    const left = xScale.value(start)
    const right = chartWidth.value - xScale.value(end)

    return {
      left: `${left}px`,
      right: `${right}px`,
    }
  })

  const classes = computed(() => ({
    root: {
      'histogram-chart--x-axis': options.value.showXAxis,
      'histogram-chart--y-axis': options.value.showYAxis,
    },
    selection: {
      'histogram-chart__selection--moving': movingSelection.value,
    },
    bar: {
      'histogram-chart__bar--transitioned': options.value.transition,
      'histogram-chart__bar--visible': pathRendered.value && showBars.value,
    },
    path: {
      'histogram-chart__path--transitioned': options.value.transition,
      'histogram-chart__path--visible': pathRendered.value && showSmooth.value,
    },
  }))

  function getBar(point: HistogramDataPoint): HistogramBar {
    const top = yScale.value(point.value)
    const left = xScale.value(point.intervalStart)
    const right = xScale.value(point.intervalEnd)
    const width = right - left
    const height = top

    const styles: HistogramBarStyles = {
      left: toPixels(left),
      width: toPixels(width),
      height: toPixels(height),
      bottom: toPixels(0),
    }

    if (!pathRendered.value || !showBars.value) {
      styles.height = toPixels(0)
    }

    return { ...point, styles }
  }

  function getPointPosition(point: HistogramDataPoint): PointPosition {
    const middle = new Date((point.intervalStart.getTime() + point.intervalEnd.getTime()) / 2)
    const x = xScale.value(middle)

    // explain this
    const y = chartHeight.value - yScale.value(point.value)

    return [x, y]
  }

  function formatDateLabel(value: Date): string {
    return format(value, 'MMM do, yyyy')
  }

  function formatTimeLabel(value: Date): string {
    return format(value, 'hh:mm a')
  }

  function keepSelectionInRange({ selectionStart, selectionEnd }: Selection): Selection {
    const min = startDate.value
    const max = endDate.value
    const difference = differenceInSeconds(selectionEnd, selectionStart)

    const startBeforeMin = isBefore(selectionStart, min)

    if (startBeforeMin) {
      return {
        selectionStart: min,
        selectionEnd: addSeconds(min, difference),
      }
    }

    const endAfterMax = isAfter(selectionEnd, max)

    if (endAfterMax) {
      return {
        selectionStart: subSeconds(max, difference),
        selectionEnd: max,
      }
    }

    return { selectionStart, selectionEnd }
  }

  function selectionDragStart(): void {
    movingSelection.value = true
  }

  function selectionDragEnd(): void {
    movingSelection.value = false

    emit('selection', {
      selectionStart: props.selectionStart!,
      selectionEnd: props.selectionEnd!,
    })
  }

  function getNewSelectionForEvent({ dx: difference }: DragEvent): { selectionStart: Date, selectionEnd: Date } {
    const startDateValue = xScale.value(props.selectionStart!)
    const endDateValue = xScale.value(props.selectionEnd!)
    const selectionStart = xScale.value.invert(startDateValue + difference)
    const selectionEnd = xScale.value.invert(endDateValue + difference)

    return { selectionStart, selectionEnd }
  }

  function selectionDrag(event: DragEvent): void {
    if (dragReenteredChart(event)) {
      return
    }

    const selection = getNewSelectionForEvent(event)
    const selectionInRange = keepSelectionInRange(selection)

    updateSelection(selectionInRange)
  }

  function selectionLeftDrag(event: DragEvent): void {
    if (dragReenteredChart(event)) {
      return
    }

    const [mouseX] = d3.pointer(event, chart.value)
    let selectionStart = xScale.value.invert(mouseX)

    if (isBefore(selectionStart, startDate.value)) {
      selectionStart = startDate.value
    }

    const maximum = subSeconds(props.selectionEnd!, options.value.selectionMaximumSeconds)

    if (isBefore(selectionStart, maximum)) {
      selectionStart = maximum
    }

    const minimum = subSeconds(props.selectionEnd!, options.value.selectionMinimumSeconds)

    if (isAfter(selectionStart, minimum)) {
      selectionStart = minimum
    }

    updateSelection({
      selectionStart,
    })
  }

  function selectionRightDrag(event: DragEvent): void {
    if (dragReenteredChart(event)) {
      return
    }

    const [mouseX] = d3.pointer(event, chart.value)
    let selectionEnd = xScale.value.invert(mouseX)

    if (isAfter(selectionEnd, endDate.value)) {
      selectionEnd = endDate.value
    }

    const maximum = addSeconds(props.selectionStart!, options.value.selectionMaximumSeconds)

    if (isAfter(selectionEnd, maximum)) {
      selectionEnd = maximum
    }

    const minimum = addSeconds(props.selectionStart!, options.value.selectionMinimumSeconds)

    if (isBefore(selectionEnd, minimum)) {
      selectionEnd = minimum
    }

    updateSelection({
      selectionEnd,
    })
  }

  function dragReenteredChart(event: DragEvent): boolean {
    const difference = event.dx
    const chartXLeft = chartX.value
    const chartXRight = chartX.value + chartWidth.value
    const mouseX = event.sourceEvent.clientX
    const previousMouseX = mouseX - difference
    const mouseEnteredChartFromLeft = chartXLeft >= previousMouseX
    const mouseEnteredChartFromRight = chartXRight <= previousMouseX

    if (mouseEnteredChartFromLeft || mouseEnteredChartFromRight) {
      return true
    }

    return false
  }

  function updateSelection({ selectionStart, selectionEnd }: Partial<Selection>): void {
    if (selectionStart) {
      emit('update:selectionStart', selectionStart)
    }

    if (selectionEnd) {
      emit('update:selectionEnd', selectionEnd)
    }
  }

  function initSelectionDrag(): void {
    if (!chart.value || !selection.value || !selectionLeft.value || !selectionRight.value) {
      return
    }

    // d3s types are a little wonky
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartSelection = d3.select(chart.value) as any

    const dragSelection = d3.drag()
      .on('start', selectionDragStart)
      .on('drag', selectionDrag)
      .on('end', selectionDragEnd)

    const dragSelectionLeft = d3.drag()
      .container(chartSelection)
      .on('start', selectionDragStart)
      .on('drag', selectionLeftDrag)
      .on('end', selectionDragEnd)

    const dragSelectionRight = d3.drag()
      .container(chartSelection)
      .on('start', selectionDragStart)
      .on('drag', selectionRightDrag)
      .on('end', selectionDragEnd)

    d3.select(selection.value).call(dragSelection)
    d3.select(selectionLeft.value).call(dragSelectionLeft)
    d3.select(selectionRight.value).call(dragSelectionRight)
  }
</script>

<style>
.histogram-chart--dragging { @apply
  cursor-move
  select-none
}

.histogram-chart { @apply
  grid
  gap-2;
  grid-template-rows: minmax(56px, 1fr);
  grid-template-areas: "chart";
}

.histogram-chart--x-axis {
  grid-template-rows: minmax(56px, 1fr) min-content;
  grid-template-areas: "chart"
  "xAxis";
}

.histogram-chart--y-axis {
  grid-template-columns: min-content 1fr;
  grid-template-areas: "yAxis chart";
}

.histogram-chart--x-axis.histogram-chart--y-axis {
  grid-template-areas: "yAxis chart"
                       ".     xAxis";
}

.histogram-chart__chart { @apply
  w-full
  relative;
  grid-area: chart
}

.histogram-chart__drag { @apply
  absolute
  top-0
  bottom-0
  z-20
  block
  opacity-5
  cursor-move
  bg-danger
}

.histogram-chart__selection { @apply
  cursor-move
  block
  absolute
  opacity-50
  border
  border-white
  bg-slate-500
  transition-opacity
  top-0
  bottom-0
  rounded-sm
  z-10
  hover:opacity-60
}

.histogram-chart__selection--moving .histogram-chart__selection-resize,
.histogram-chart__selection:hover .histogram-chart__selection-resize { @apply
  opacity-100
}

.histogram-chart__selection-resize { @apply
  block
  absolute
  w-2
  h-8
  border
  border-white
  bg-slate-500
  rounded-sm
  opacity-0
  cursor-col-resize;
  top: 50%;
}

.histogram-chart__selection-resize--left { @apply
  left-0;
  transform: translate(-50%, -50%)
}

.histogram-chart__selection-resize--right { @apply
  right-0;
  transform: translate(50%, -50%)
}

.histogram-chart__selection--moving { @apply
  !opacity-70
}

.histogram-chart__bar { @apply
  absolute
  block
  bg-prefect-500
  border
  border-prefect-300
  opacity-0
}

.histogram-chart__bar--transitioned { @apply
  transition-all;

  transition-property: height, opacity;
  transition-duration: v-bind(transitionDurationString);
}

.histogram-chart__bar--visible { @apply
  opacity-100
}

.histogram-chart__svg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.histogram-chart__smooth {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.histogram-chart__path { @apply
  fill-prefect-500
  stroke-prefect-300
  opacity-0
}

.histogram-chart__path--transitioned { @apply
  transition-all;
  transition-duration: v-bind(transitionDurationString);
}

.histogram-chart__path--visible { @apply
  opacity-100
}

.histogram-chart__axis-x { @apply
  flex
  justify-between;

  grid-area: xAxis;
}

.histogram-chart__axis-y { @apply
  flex
  flex-col
  items-end
  justify-between
  border-r
  border-foreground-100
  pr-2;

  grid-area: yAxis;
}

.histogram-chart__label-x { @apply
  flex
  flex-col
  gap-1
}

.histogram-chart__label-x--end { @apply
  items-end
}

.histogram-chart__date-label { @apply
  text-sm
  text-foreground
}

.histogram-chart__time-label { @apply
  text-xs
  text-foreground-200
}

.histogram-chart__value-label { @apply
  text-foreground-200
}
</style>