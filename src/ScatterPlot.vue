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
const xScale = ref(d3.scaleTime())
const yScale = ref(d3.scaleLog())

// SETUP BASE
const handleResize = (): void => {
  updateScales()
}
const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
const { id } = baseChart


const xTicks = computed(() => {
  if (!props.items.length) return 1
  const ticks = Math.floor(props.items.length * ((baseChart.width.value - baseChart.paddingX) / (props.items.length * 150))) // ???
  return Math.max(ticks, 1)
})

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
    .ticks(xTicks.value)
    .tickFormat(formatLabel)
    .tickSizeInner(10)
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


const xDataMapper = props.items.map(data => data.timestamp)
const yDataMapper = props.items.map(data => data.duration)

const updateScales = (): void => {
  xScale.value
    .domain(d3.extent(xDataMapper))
    .range([baseChart.padding.left, baseChart.width.value - baseChart.paddingX])

  yScale.value
    .domain([1, d3.max(yDataMapper)])
    .range([baseChart.height.value - baseChart.paddingY, 0])
    .base(6)

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
}

onMounted(() => {
  const svg = d3.select(`#${id}`)
  xAxisGroup = svg.append('g').attr('class', '.scatter-plot__x-axis-group')
  yAxisGroup = svg.append('g').attr('class', '.scatter-plot__y-axis-group')

  updateScales()
})

watch(() => props.chartPadding, (val) => {
  baseChart.padding = { ...baseChart.padding, ...val }

})

</script>

<style lang="scss">
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