<template>
  <div ref="container" class="scatter-plot">
    <svg :id="id" ref="chart" class="scatter-plot__svg">
      <g class="scatter-plot__x-axis-group" />
      <g class="scatter-plot__y-axis-group" />
    </svg>

    <template v-for="item in items" :key="item.id">
      <div :style="calculateDotPosition(item)" class="scatter-plot__dot" :class="item.itemClass">
        <slot :item="item" />
      </div>
    </template>

    <template v-if="showNowLine && calculateNowPosition()">
      <div class="scatter-plot__now" :style="calculateNowPosition()!" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import * as d3 from 'd3'
import { NumberValue } from 'd3'
import { ref, computed, onMounted, watch, CSSProperties } from 'vue'
import { useBaseChart } from './Base'
import { GroupSelection, TransitionSelection, ScatterPlotItem } from './types'
import { extentUndefined } from './utils/extent'
import formatLabel from './utils/formatLabel'

const props = withDefaults(defineProps<{
  items: ScatterPlotItem[],
  startDate?: Date,
  endDate?: Date,
  showNowLine?: boolean,
  chartPadding?: {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
  },
}>(),
  {
    chartPadding: () => {
      return { top: 30, left: 70, bottom: 50, right: 20 }
    }

  }
)

const container = ref<HTMLElement>()
const xScale = ref(d3.scaleTime())
const yScale = ref(d3.scaleLog())
const dotDiameter = 14

const items = computed(() => props.items.map(item => ({ ...item, y: item.y || 0.1 })))


// SETUP BASE
const handleResize = (): void => {
  updateScales()
}
const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
const { id } = baseChart


// xAXIS
let xAxisGroup: GroupSelection | undefined

const xTicks = computed(() => {
  if (!props.items.length) return 1
  const ticks = Math.floor(props.items.length * ((baseChart.width.value - baseChart.paddingX) / (props.items.length * 150)))
  return Math.max(ticks, 1)
})

const xAxis = (g: GroupSelection): GroupSelection | TransitionSelection => g
  .call(d3.axisBottom(xScale.value)
    .tickPadding(10)
    .tickSizeInner(5)
    .tickSizeOuter(0)
    .ticks(xTicks.value)
    .tickFormat(formatLabel)
  )

// yAXIS
let yAxisGroup: GroupSelection | undefined

const formatYAxis = (value: NumberValue): string => {
  if (typeof value !== 'number') {
    return `${value}`
  }

  const formatter = d3.format(".0f")
  const decimalFormat = d3.format('.2f')

  if (value < 1) {
    return `${decimalFormat(value)}s`
  }

  return `${formatter(value)}s`
}

const yAxis = (g: GroupSelection): GroupSelection | TransitionSelection => g
  .call(d3.axisLeft(yScale.value)
    .tickPadding(10)
    .tickSizeInner(-(baseChart.width.value - baseChart.paddingX))
    .tickFormat(d => formatYAxis(d))
    .tickValues(yScale.value.ticks().concat(yScale.value.domain()))
  )

const xAccessor = (d: ScatterPlotItem) => d.x
const yAccessor = (d: ScatterPlotItem) => d.y

const calculateDotPosition = (item: ScatterPlotItem): CSSProperties => {
  const top = yScale.value(item.y) + baseChart.padding.top - dotDiameter / 2
  const left = xScale.value(item.x)
  return {
    height: `${dotDiameter}px`,
    width: `${dotDiameter}px`,
    left: `${left}px`,
    top: `${top}px`,
  }
}

const calculateNowPosition = (): CSSProperties | null => {
  const [start, end] = getXExtent()
  const now = new Date()

  if (start > now || end < now) {
    return null
  }

  const left = xScale.value(now) + dotDiameter

  return {
    left: `${left}px`
  }

}

const getXExtent = (): [Date, Date] => {
  let extent = d3.extent(items.value, xAccessor)

  if (extentUndefined(extent)) {
    let dateNow = new Date
    let offset = dateNow.setDate(dateNow.getDate() - 1)
    let dayAgo = new Date(offset)
    extent = [dayAgo, dateNow]
  }

  if (props.startDate) {
    extent[0] = props.startDate
  }

  if (props.endDate) {
    extent[1] = props.endDate
  }

  return extent
}

const updateScales = (): void => {
  updateXScale()
  updateYScale()

  if (xAxisGroup) {
    xAxisGroup.call(xAxis)
    xAxisGroup
      .attr("transform", `translate(${dotDiameter}, ${baseChart.height.value - baseChart.padding.bottom + dotDiameter})`)
      .attr('font-family', 'input-sans')
      .attr('font-size', '11')
    xAxisGroup.select('.domain').style('opacity', '0')

  }

  if (yAxisGroup) {
    yAxisGroup.call(yAxis)
    yAxisGroup
      .attr("transform", `translate(${baseChart.padding.left}, ${baseChart.padding.top})`)
      .attr('font-family', 'input-sans')
      .attr('font-size', '11')

    yAxisGroup.selectAll('.tick line').style('stroke', '#cacccf')
    yAxisGroup.select('.domain').style('opacity', '0')
  }
}

const updateXScale = (): void => {
  const extentX = getXExtent()

  xScale.value = d3
    .scaleTime()
    .domain(extentX)
    .rangeRound([baseChart.padding.left, baseChart.width.value - baseChart.paddingX - baseChart.padding.right])
}

const updateYScale = (): void => {
  let extentY = d3.extent(items.value, yAccessor)

  if (extentUndefined(extentY)) {
    extentY = [0.1, 20]
  }

  yScale.value = d3
    .scaleLog()
    .domain(extentY)
    .rangeRound([baseChart.height.value - baseChart.paddingY, 0])
    .base(2)
}

onMounted(() => {
  const svg = d3.select(`#${id}`)
  xAxisGroup = svg.select('.scatter-plot__x-axis-group')
  yAxisGroup = svg.select('.scatter-plot__y-axis-group')

  updateScales()
})

watch(() => props.chartPadding, (val) => {
  baseChart.padding = { ...baseChart.padding, ...val }
})

watch(() => props.items, () => updateScales())

</script>

<style lang="scss">
.scatter-plot {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
}

.scatter-plot__svg {
  height: 100%;
  width: 100%;
}

.scatter-plot__x-axis-group,
.scatter-plot__y-axis-group {
  user-select: none;
}

.scatter-plot__now {
  position: absolute;
  top: 0;
  bottom: 0;
  user-select: none;
  pointer-events: none;
  z-index: 1;

  &::before {
    content: 'Now';
    display: block;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-secondary);
    font-size: 11px;
    color: var(--grey-80);
    letter-spacing: -0.09;
  }

  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 20px;
    bottom: 35px;
    width: 1px;
    background-color: #465968;
  }
}

.scatter-plot__dot {
  position: absolute;
  transform: translateX(50%) scaleX(-1);
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}
</style>