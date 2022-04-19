<template>
  <div style="height: 100%; border: 2px solid orange">
    <svg :id="id" class="heatmap__svg">
      <!--  -->
    </svg>

    <template v-for="item in data[1]" :key="item.id">
      <div :style="calculateBucketPosition(item)" class="heatmap-group__bucket" :class="item.itemClass">
        <slot :item="item" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import * as d3 from 'd3'
  import { CSSProperties, onMounted, ref } from 'vue'
  import { useBaseChart } from './Base'
  import { ScatterPlotItem } from './types'

  const props = defineProps<{
    data: any[],
    xExtent: any[],
    chartPadding?: {
      top?: number,
      bottom?: number,
      left?: number,
      right?: number,
    },
  }>()

  // const colorMap = d3.scaleLinear()
  // .domain([0, 1])
  // .range([color])

  const container = ref<HTMLElement>()
  const xScale = ref(d3.scaleBand())

  // SETUP BASE
  const handleResize = (): void => {
    updateScales()
  }
  const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
  const { id } = baseChart


  const calculateBucketPosition = (item: ScatterPlotItem): CSSProperties => {
    //   // const top = yScale.value(item.itemClass) + baseChart.padding.top - calcBucketSize.value / 2
    const left = xScale.value(item.x) + baseChart.paddingX
    return {
      height: '20px',
      width: '20px',
      left: `${left}px`,
      // top: `${top}px`,
    }
  }


  const updateScales = (): void => {
    //
    xScale.value = d3
      .scaleBand()
      .domain(props.xExtent)
      .range([0, 40])


  }

  onMounted(() => {
    const svg = d3.select(`#${id}`)
    // svg.append('g')
    //   .selectAll('rect')
    //   .data(props.data[1])
    //   .join('rect')
    //   .attr('stroke', 'black')
    //   .attr('fill', '#ddd')
    //   .attr('width', 25)
    //   .attr('height', 25)
    //   .attr('x', (d, i) => 25 * (i % 20))

    // console.log(props.data[1])
    updateScales()
  })
</script>

<style lang="scss">
.heatmap-group__bucket {
  position: absolute;
  z-index: 100;
}
</style>