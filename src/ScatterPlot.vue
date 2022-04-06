<template>
  <div ref="container" class="scatter-plot">
    <svg :id="id" ref="chart" class="scatter-plot__svg">
      <!--  -->
    </svg>
  </div>
</template>

<script lang="ts" setup>
import * as d3 from 'd3'
import { ref, computed, onMounted, watch } from 'vue'
import { useBaseChart } from './Base'
import { formatLabel } from '@/utils/formatLabel'
import { GroupSelection, TransitionSelection } from './types'

// PROPS
const props = defineProps<{
  items: any[], // figure out the type
  axisClass?: string, // do we need separate xAxisClass and yAxisClass. In RunHistory we pass 'caption'
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
const yScale = ref(d3.scaleLinear())

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
    .tickFormat(formatLabel)
    .tickSizeInner(10)
    .tickSizeOuter(0),
  )
// .call((g) => g.select('.domain').remove())
// .call((g) => g.selectAll('.tick').style('opacity', 1))

// yAXIS
let yAxisGroup: GroupSelection | undefined

const yAxis = (g: GroupSelection): GroupSelection | TransitionSelection => g
  .attr('class', axisClasses(g))
  .call(d3.axisLeft(yScale.value)
    .ticks(5)
    .tickPadding(10)
    .tickSizeInner(-(baseChart.width.value - baseChart.paddingX))
  )


const updateScales = (): void => {
  xScale.value
    .domain([10, 50])
    .range([baseChart.padding.left, baseChart.width.value - baseChart.paddingX])

  yScale.value
    .domain([0, 20])
    .range([baseChart.height.value - baseChart.paddingY, 0])

  if (xAxisGroup) {
    xAxisGroup.call(xAxis)
    xAxisGroup.attr("transform", `translate(${baseChart.padding.left}, ${baseChart.height.value - baseChart.padding.bottom})`)
  }

  if (yAxisGroup) {
    yAxisGroup.call(yAxis)
    yAxisGroup.attr("transform", `translate(${baseChart.padding.left}, ${baseChart.padding.top})`)

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
  height: 100%;
  position: relative;
  width: 100%;
}
.scatter-plot__svg {
  height: 100%;
  width: 100%;
}
</style>