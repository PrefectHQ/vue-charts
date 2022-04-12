<template>
  <div ref="container" class="scatter-plot">
    <svg :id="id" ref="chart" class="scatter-plot__svg">
      <g class="scatter-plot__x-axis-group" />
      <g class="scatter-plot__y-axis-group" />
    </svg>

    <div class="scatter-plot__dots-container">
      <template v-for="item in items" :key="item.id">
        <div :style="calculateDotPosition(item)" class="scatter-plot__dot" :class="item.itemClass">
          <slot :item="item" />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as d3 from 'd3'
import { ref, computed, onMounted, watch, useSlots, CSSProperties } from 'vue'
import { useBaseChart } from './Base'
import { GroupSelection, TransitionSelection, ScatterPlotItem } from './types'
import { extentUndefined } from './utils/extent'

const slots = useSlots()

const props = withDefaults(defineProps<{
  items: ScatterPlotItem[],
  startDate?: Date,
  endDate?: Date
  chartPadding?: {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
  },
}>(),
  {
    chartPadding: () => {
      return { top: 30, left: 70, bottom: 35, right: 20 }
    }

  }
)

const container = ref<HTMLElement>()
const xScale = ref(d3.scaleTime())
const yScale = ref(d3.scaleLog())

const items = computed(() => props.items.map(item => ({ ...item, y: item.y || 0.1 })))


// SETUP BASE
const handleResize = (): void => {
  updateScales()
}
const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
const { id } = baseChart


// xAXIS
let xAxisGroup: GroupSelection | undefined

const xAxis = (g: GroupSelection): GroupSelection | TransitionSelection => g
  .call(d3.axisBottom(xScale.value)
    .tickPadding(10)
    .tickSizeInner(5)
    .tickSizeOuter(0),
  )

// yAXIS
let yAxisGroup: GroupSelection | undefined

const yAxis = (g: GroupSelection): GroupSelection | TransitionSelection => g
  .call(d3.axisLeft(yScale.value)
    .tickPadding(10)
    .tickSizeInner(-(baseChart.width.value - baseChart.paddingX))
    .tickFormat(d => d + 's')
  )

const xAccessor = (d: ScatterPlotItem) => d.x
const yAccessor = (d: ScatterPlotItem) => d.y


const calculateDotPosition = (item: ScatterPlotItem): CSSProperties => {
  const radius = 14
  const top = yScale.value(item.y) + baseChart.padding.top - radius / 2
  const left = baseChart.padding.left + xScale.value(item.x) - radius
  return {
    height: `${radius}px`,
    width: `${radius}px`,
    left: `${left}px`,
    top: `${top}px`,
  }
}

const updateScales = (): void => {
  updateXScale()
  updateYScale()

  if (xAxisGroup) {
    xAxisGroup.call(xAxis)
    xAxisGroup
      .attr("transform", `translate(${baseChart.padding.left}, ${baseChart.height.value - baseChart.padding.bottom})`)
      .attr('font-family', 'input-sans')
      .attr('font-size', '11')
  }

  if (yAxisGroup) {
    yAxisGroup.call(yAxis)
    yAxisGroup
      .attr("transform", `translate(${baseChart.padding.left}, ${baseChart.padding.top})`)
      .attr('font-family', 'input-sans')
      .attr('font-size', '11')

    yAxisGroup.selectAll('.tick line').style('stroke', '#cacccf')
    yAxisGroup.select('.domain').style('stroke', '#cacccf')
  }
}

const updateXScale = (): void => {
  let extentX = d3.extent(items.value, xAccessor)

  if (extentUndefined(extentX)) {
    let dateNow = new Date
    let offset = dateNow.setDate(dateNow.getDate() - 1)
    let dayAgo = new Date(offset)
    extentX = [dayAgo, dateNow]
  }

  if (props.startDate) {
    extentX[0] = props.startDate
  }

  if (props.endDate) {
    extentX[1] = props.endDate
  }

  xScale.value = d3
    .scaleTime()
    .domain(extentX)
    .rangeRound([baseChart.padding.left, baseChart.width.value - baseChart.paddingX - baseChart.padding.right])
}

const updateYScale = (): void => {
  let extentY = d3.extent(items.value, yAccessor)

  if (extentUndefined(extentY)) {
    extentY = [0.1, 100]
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

.scatter-plot__dots-container {
  width: 100%;
}

.scatter-plot__dot {
  position: absolute;
  transform: translateX(50%) scaleX(-1);
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>