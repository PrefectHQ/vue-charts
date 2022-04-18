<template>
  <div ref="container" class="heatmap">
    <svg :id="id" class="heatmap__svg">
      <g class="heatmap__x-axis-group" />
      <g class="heatmap__y-axis-group" />
    </svg>
  </div>
</template>

<script setup lang="ts">
  import * as d3 from 'd3'
  import { ref, computed, onMounted, watch, CSSProperties, withDefaults } from 'vue'
  import { useBaseChart } from './Base'
  import { GroupSelection, TransitionSelection } from './types'

  const props = withDefaults(defineProps<{
    items: any[],
    chartPadding?: {
      top?: number,
      bottom?: number,
      left?: number,
      right?: number,
    },
  }>(), {
    chartPadding: () => {
      return { top: 20, left: 20, bottom: 20, right: 20 }
    },
  })

  const container = ref<HTMLElement>()
  const xScale = ref()
  const yScale = ref()
  let xAxisGroup: GroupSelection | undefined
  let yAxisGroup: GroupSelection | undefined


  // SETUP BASE
  const handleResize = (): void => {
    updateScales()
  }
  const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
  const { id } = baseChart


  const updateScales = (): void => {
    //
  }


  onMounted(() => {
    const svg = d3.select(`#${id}`)
    xAxisGroup = svg.select('.heatmap__x-axis-group')
    yAxisGroup = svg.select('.heatmap__y-axis-group')

    updateScales()
  })


  watch(() => props.chartPadding, (val) => {
    baseChart.padding = { ...baseChart.padding, ...val }
  })
</script>

<style lang="scss">

</style>