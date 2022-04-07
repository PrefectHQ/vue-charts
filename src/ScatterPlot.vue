<template>
  <div ref="container" class="scatter-plot">
    <svg :id="id" ref="chart" class="scatter-plot__svg">
      <!-- This comment is needed here so linter doesn't turn <svg> into self-closing tag  -->
    </svg>

    <div class="scatter-plot__dots-container"></div>
  </div>
</template>

<script lang="ts" setup>
import * as d3 from 'd3'
import { ref, computed, onMounted, watch } from 'vue'
import { useBaseChart } from './Base'
import { formatLabel } from '@/utils/formatLabel'
import { GroupSelection, TransitionSelection, ChartItem } from './types'

// PROPS
const props = defineProps<{
  items: ChartItem[],
  axisClass?: string, // do we need separate xAxisClass and yAxisClass? In RunHistory we pass 'caption'
  chartPadding?: {
    top?: number,
    bottom?: number,
    middle?: number,
    left?: number,
    right?: number,
  },
}>()


const container = ref<HTMLElement>()
const dotContainer = ref()
const xScale = ref(d3.scaleTime())
const yScale = ref(d3.scaleLog())

// SETUP BASE
const handleResize = (): void => {
  updateScales()
}
const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
const { id } = baseChart


// AXIS
const axisClasses = (g: GroupSelection) => {
  const existingClasses = g.attr('class').split(' ') ?? []
  const propClasses = props.axisClass?.split(' ') ?? []
  const classes = [...existingClasses, ...propClasses.filter(pc => !existingClasses.includes(pc))]
  return classes.join(' ')
}

// xAXIS
let xAxisGroup: GroupSelection | undefined

const xAxis = (g: GroupSelection): GroupSelection | TransitionSelection => g
  .attr('class', axisClasses(g))
  .call(d3.axisBottom(xScale.value)
    .tickPadding(10)
    .tickSizeInner(5)
    .tickSizeOuter(0),
  )

// yAXIS
let yAxisGroup: GroupSelection | undefined

const yAxis = (g: GroupSelection): GroupSelection | TransitionSelection => g
  .attr('class', axisClasses(g))
  .call(d3.axisLeft(yScale.value)
    .tickPadding(10)
    .tickSizeInner(-(baseChart.width.value - baseChart.paddingX))
  )


const xAccessor = (d: ChartItem) => d.timestamp
const yAccessor = (d: ChartItem) => d.duration

const updateScales = (): void => {
  xScale.value
    .domain(d3.extent(props.items, xAccessor))
    .rangeRound([baseChart.padding.left, baseChart.width.value - baseChart.paddingX - baseChart.padding.right])

  yScale.value
    .domain(d3.extent(props.items, yAccessor))
    .rangeRound([baseChart.height.value - baseChart.paddingY, 0])
    .base(5)

  if (xAxisGroup) {
    xAxisGroup.call(xAxis)
    xAxisGroup.attr("transform", `translate(${baseChart.padding.left}, ${baseChart.height.value - baseChart.padding.bottom})`)
  }

  if (yAxisGroup) {
    yAxisGroup.call(yAxis)
    yAxisGroup.attr("transform", `translate(${baseChart.padding.left}, ${baseChart.padding.top})`)

    yAxisGroup.selectAll('.tick line').style('stroke', '#cacccf')
    yAxisGroup.select('.domain').style('stroke', '#cacccf')
    yAxisGroup.select('.tick text').attr('x', '-15') // for whatever reason first tick renders to close to axis without this setup
  }

  if (dotContainer.value) {
    dotContainer.value
      .attr("transform", `translate(${baseChart.padding.left}, ${baseChart.padding.top})`)
      .selectAll('circle')
      .data(props.items)
      .join("circle")
      .attr("cx", (d: ChartItem) => xScale.value(xAccessor(d)))
      .attr("cy", (d: ChartItem) => yScale.value(yAccessor(d)))
      .attr("r", 7)
      .attr('class', (d: ChartItem) => `${d.state_type?.toLowerCase()}-bg`)
  }
}

onMounted(() => {
  const svg = d3.select(`#${id}`)
  xAxisGroup = svg.append('g').attr('class', '.scatter-plot__x-axis-group')
  yAxisGroup = svg.append('g').attr('class', '.scatter-plot__y-axis-group')
  dotContainer.value = svg.append('g').attr('class', '.scatter-plot__dot-container')


  updateScales()
})

watch(() => props.chartPadding, (val) => {
  baseChart.padding = { ...baseChart.padding, ...val }

})

</script>

<style lang="scss">
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
  stroke: #ebeef7;
  fill: rgb(235, 238, 247, 0.9);
}

.scatter-plot {
  box-sizing: border-box;
  min-height: 300px;
  height: 100%;
  width: 100%;
}
.scatter-plot__svg {
  height: 100%;
  width: 100%;
}
</style>