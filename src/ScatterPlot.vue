<template>
  <div ref="container" class="scatter-plot">
    <svg :id="id" ref="chart" class="scatter-plot__svg">
      <!-- This comment is needed here so linter doesn't turn <svg> into self-closing tag  -->
    </svg>

    <div class="scatter-plot__dots-container">
      <template v-for="item in items" :key="item.id">
        <div
          :style="calculateDotPosition(item)"
          class="scatter-plot__dot"
          :class="item.class?.toLowerCase()"
        >
          <slot v-if="slots.default" :item="item" />
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

const props = defineProps<{
  items: ScatterPlotItem[],
  chartPadding?: {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
  },
}>()

const container = ref<HTMLElement>()
const dotContainer = ref()
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
  console.log(baseChart.height.value);
  const itemHeight = 14
  const itemWidth = itemHeight
  const top = yScale.value(item.y) + baseChart.padding.top - itemHeight / 2
  const left = baseChart.padding.left + xScale.value(item.x) - itemWidth // figure out how to recalculate dot position on screen size change
  return {
    height: `${itemHeight}px`,
    width: `${itemWidth}px`,
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
  console.log(props.items);

  const svg = d3.select(`#${id}`)
  xAxisGroup = svg.append('g').attr('class', '.scatter-plot__x-axis-group')
  yAxisGroup = svg.append('g').attr('class', '.scatter-plot__y-axis-group')
  dotContainer.value = svg.append('g').attr('class', '.scatter-plot__dot-container')

  updateScales()
})

watch(() => [props.chartPadding, xScale.value], ([paddingVal], [scaleVal]) => {
  baseChart.padding = { ...baseChart.padding, ...paddingVal }

})

</script>

<style lang="scss">
// update to use miter imports
.scatter-plot__dot--completed {
  border: 1px solid #2ac769;
  background-color: rgb(42, 199, 105, 0.5);
}

.scatter-plot__dot--running {
  border: 1px solid #1860f2;
  background-color: rgb(24, 96, 242, 0.5);
}

.scatter-plot__dot--failed {
  border: 1px solid #fb4e4e;
  background-color: rgb(251, 78, 78, 0.5);
}

.scatter-plot__dot--cancelled {
  border: 1px solid #3d3d3d;
  background-color: rgb(61, 61, 61, 0.5);
}

.scatter-plot__dot--scheduled {
  border: 1px solid #fcd14e;
  background-color: rgb(252, 209, 78, 0.5);
}

.scatter-plot__dot--pending {
  border: 1px solid #8ea0ae;
  background-color: rgb(235, 238, 247, 0.9);
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
  border-radius: 50%;
}
</style>