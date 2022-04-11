<template>
  <div ref="container" class="scatter-plot">
    <svg :id="id" ref="chart" class="scatter-plot__svg">
      <!-- This comment is needed here so linter doesn't turn <svg> into self-closing tag  -->
    </svg>

    <div class="scatter-plot__dots-container">
      <template v-for="item in items" :key="item.id">
        <div :style="calculateDotPosition(item)" class="scatter-plot__dot"></div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as d3 from 'd3'
import { ref, computed, onMounted, watch, useSlots, CSSProperties } from 'vue'
import { useBaseChart } from './Base'
import { formatLabel } from '@/utils/formatLabel'
import { GroupSelection, TransitionSelection, ChartItem } from './types'
import { extentUndefined } from './utils/extent'

const slots = useSlots()

const props = defineProps<{
  items: ChartItem[],
  axisClass?: string, // do we need separate xAxisClass and yAxisClass? In RunHistory we pass 'caption'
  chartPadding?: {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
  },
}>()

const container = ref<HTMLElement>()
const dotContainer = ref()
let tooltip: any | undefined
const xScale = ref(d3.scaleTime())
const yScale = ref(d3.scaleLog())
const tooltipContainer = ref()

const items = computed(() => props.items.map(item => ({ ...item, duration: item.duration || 0.1 })))


// SETUP BASE
const handleResize = (): void => {
  updateScales()
}
const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
const { id } = baseChart


// AXIS
// const axisClasses = (g: GroupSelection) => {
//   const existingClasses = g.attr('class').split(' ') ?? []
//   const propClasses = props.axisClass?.split(' ') ?? []
//   const classes = [...existingClasses, ...propClasses.filter(pc => !existingClasses.includes(pc))]
//   return classes.join(' ')
// }

// xAXIS
let xAxisGroup: GroupSelection | undefined

const xAxis = (g: GroupSelection): GroupSelection | TransitionSelection => g
  // .attr('class', axisClasses(g))
  .call(d3.axisBottom(xScale.value)
    .tickPadding(10)
    .tickSizeInner(5)
    .tickSizeOuter(0),
  )

// yAXIS
let yAxisGroup: GroupSelection | undefined

const yAxis = (g: GroupSelection): GroupSelection | TransitionSelection => g
  // .attr('class', axisClasses(g))
  .call(d3.axisLeft(yScale.value)
    .tickPadding(10)
    .tickSizeInner(-(baseChart.width.value - baseChart.paddingX))
    .tickFormat(d => d + 's')
  )

const xAccessor = (d: ChartItem) => d.timestamp
const yAccessor = (d: ChartItem) => d.duration


// const mouseover = function (this: any, e: any, datum: any): void {
//   d3.select(this)
//     .attr('r', 8)

// tooltip.style('display', 'block')
//   .style('top', yScale.value(yAccessor(datum)) - tooltipContainer.value.clientHeight + 5 + "px")
//   .style('left', xScale.value(xAccessor(datum)) - tooltipContainer.value.clientWidth / 2 + "px") // can't figure out X alignment

// console.log(datum.id)
// tooltip.select('.link')
//   // .attr('href', `flow-run/${id}`)
//   .attr('href', `flow-run/78b05d2d-e18f-479f-841c-e86d4134aff6`)
// }

// const mouseleave = function (this: any, e: any, datum: any): void {
//   d3.select(this)
//     .attr('class', () => `${datum.state_type?.toLowerCase()}-bg`)
//     .attr('r', 7)

//   tooltip.style('display', 'none')
// }

const calculateDotPosition = (item: ChartItem): CSSProperties => {
  console.log(baseChart.height.value);
  const itemHeight = 14
  const itemWidth = itemHeight
  const top = yScale.value(item.duration) + baseChart.padding.top - itemHeight / 2
  const left = baseChart.padding.left + xScale.value(item.timestamp) - itemWidth // figure out how to recalculate dot position on screen size change
  return {
    height: `${itemHeight}px`,
    width: `${itemWidth}px`,
    left: `${left}px`,
    top: `${top}px`,
    backgroundColor: `red`
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
    yAxisGroup.select('.tick text').attr('x', '-23') // for whatever reason first tick renders too close to axis without this setup
  }

  // if (dotContainer.value) {
  //   dotContainer.value
  //     .attr("transform", `translate(${baseChart.padding.left}, ${baseChart.padding.top})`)
  //     .selectAll('circle')
  //     .data(props.items)
  //     .join("circle")
  //     .attr("cx", (d: ChartItem) => xScale.value(xAccessor(d)))
  //     .attr("cy", (d: ChartItem) => yScale.value(yAccessor(d)))
  //     .attr("r", 7)
  //     .attr('class', (d: ChartItem) => `${d.state_type?.toLowerCase()}-bg dot`)
  //     .on('mouseenter', mouseover)
  //     .on('mouseleave', mouseleave)
  // }
}

const updateXScale = (): void => {
  let extentX = d3.extent(items.value, xAccessor)

  if (extentUndefined(extentX)) {
    // todo: replace this with an intuitive default
    extentX = [new Date(), new Date()]
  }

  xScale.value
    .domain(extentX)
    .rangeRound([baseChart.padding.left, baseChart.width.value - baseChart.paddingX - baseChart.padding.right])
}

const updateYScale = (): void => {
  let extentY = d3.extent(items.value, yAccessor)

  if (extentUndefined(extentY)) {
    // todo: replace this with an intuitive default
    extentY = [0, 0]
  }

  yScale.value
    .domain(extentY)
    .rangeRound([baseChart.height.value - baseChart.paddingY, 0])
    .base(2)
}


onMounted(() => {
  const svg = d3.select(`#${id}`)
  xAxisGroup = svg.append('g').attr('class', '.scatter-plot__x-axis-group')
  yAxisGroup = svg.append('g').attr('class', '.scatter-plot__y-axis-group')
  dotContainer.value = svg.append('g').attr('class', '.scatter-plot__dot-container')
  tooltip = d3.select('#tooltip')

  updateScales()
})

watch(() => props.chartPadding, (val) => {
  baseChart.padding = { ...baseChart.padding, ...val }

})

</script>

<style lang="scss">
// update to use miter imports
.completed-bg {
  stroke: #2ac769;
  fill: rgb(42, 199, 105, 0.5);
}

.running-bg {
  stroke: #1860f2;
  fill: rgb(24, 96, 242, 0.5);
}

.failed-bg {
  stroke: #fb4e4e;
  fill: rgb(251, 78, 78, 0.5);
}

.cancelled-bg {
  stroke: #3d3d3d;
  fill: rgb(61, 61, 61, 0.5);
}

.scheduled-bg {
  stroke: #fcd14e;
  fill: rgb(252, 209, 78, 0.5);
}

.pending-bg {
  stroke: #8ea0ae;
  fill: rgb(235, 238, 247, 0.9);
}

.scatter-plot {
  box-sizing: border-box;
  min-height: 300px;
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
  // width: 10px;
  // height: 10px;
  border-radius: 50%;
}

.scatter-plot__tooltip {
  border: 1px solid #ccc;
  border-radius: 4px;
  position: absolute;
  box-sizing: border-box;
  padding: 10px;
  background-color: #fff;
  display: none;
}
</style>