<template>
  <div ref="container" class="heatmap">
    <svg :id="id" class="heatmap__svg">
      <g class="heatmap__x-axis-group" />
      <g class="heatmap__y-axis-group" />
    </svg>

    <!--
      <template v-for="item in items" :key="item.id">
      <div :style="calculateBucketPosition(item)" class="heatmap__bucket" :class="item.itemClass">
      <slot :item="item" />
      </div>
      </template>
    -->


    <div v-for="data in groupedData" :key="data.key" class="heatmap__heatmap-group">
      <HeatmapGroup :data="data" :x-extent="getXExtent()" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import * as d3 from 'd3'
  import { ref, computed, onMounted, watch, CSSProperties, withDefaults } from 'vue'
  import { useBaseChart } from './Base'
  import HeatmapGroup from './HeatmapGroup.vue'
  import { GroupSelection, HeatmapItem, ScatterPlotItem, TransitionSelection } from './types'
  import { extentUndefined } from './utils/extent'
  import { formatLabel } from './utils/formatLabel'

  const props = withDefaults(defineProps<{
    items: HeatmapItem[],
    startDate?: Date | null,
    endDate?: Date | null,
    bucketSize?: number,
    bucketAmount?: number,
    bucketOpacityRange?: number,
    chartPadding?: {
      top?: number,
      bottom?: number,
      left?: number,
      right?: number,
    },
  }>(), {
    startDate: null,
    endDate: null,
    bucketSize: 30,
    bucketAmount: 4,
    bucketOpacityRange: 4,
    chartPadding: () => {
      return { top: 20, left: 100, bottom: 40, right: 40 }
    },
  })

  const container = ref<HTMLElement>()
  const xScale = ref(d3.scaleTime())
  const yScale = ref(d3.scaleBand())
  let xAxisGroup: GroupSelection | undefined
  let yAxisGroup: GroupSelection | undefined

  const items = computed(() => props.items)
  let groupedData: any


  // SETUP BASE
  const handleResize = (): void => {
    updateScales()
  }
  const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
  const { id } = baseChart


  const xAxis = (groupSelection: GroupSelection): GroupSelection | TransitionSelection => groupSelection
    .call(d3.axisBottom(xScale.value))

  const yAxis = (groupSelection: GroupSelection): GroupSelection | TransitionSelection => groupSelection
    .call(d3.axisLeft(yScale.value))

  const xAccessor = (item: ScatterPlotItem): Date => item.x

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

  const bucketInterval = computed(() => {
    const [start, end] = getXExtent()

    const intervalInMs = end.getTime() - start.getTime()
    const bucketIntervalInMs = intervalInMs / props.bucketAmount

    return bucketIntervalInMs
  })

  const groupItems = () => {
    const [start, end] = getXExtent()

    let groups = []

    let currentDate = start
    while (currentDate < end) {
      let nextDate = new Date(currentDate.getTime() + bucketInterval.value)
      groups.push({ label: currentDate, groups: [] })
      // items.value.map(d => {
      //   if (currentDate <= d.x || nextDate > d.x) {
      //     console.log(d)
      //   }
      // })
      currentDate = nextDate
    }

    console.log(groups)
  }


  const updateScales = (): void => {
    updateXScale()
    updateYScale()


    // if (xAxisGroup) {
    //   xAxisGroup.call(xAxis)

    //   xAxisGroup
    //     .attr('transform', `translate(0, ${baseChart.height.value - baseChart.padding.bottom})`)
    //     .attr('font-family', 'input-sans')
    //     .attr('font-size', '11')
    // }

    // if (yAxisGroup) {
    //   yAxisGroup.call(yAxis)
    //   yAxisGroup
    //     .attr('transform', `translate(${baseChart.padding.left}, ${baseChart.padding.top})`)
    //     .attr('font-family', 'input-sans')
    //     .attr('font-size', '11')
    // }
  }

  const updateXScale = (): void => {
    const extentX = getXExtent()

    xScale.value = d3
      .scaleTime()
      .domain(extentX)
      .range([0, props.bucketAmount])
  }

  const updateYScale = (): void => {
    yScale.value = d3
      .scaleBand()
      .domain([0, props.bucketSize])
      .range([0, 1])
  }


  onMounted(() => {
    const svg = d3.select(`#${id}`)

    xAxisGroup = svg.select('.heatmap__x-axis-group')
    yAxisGroup = svg.select('.heatmap__y-axis-group')


    groupItems()


    updateScales()
  })


  watch(() => props.chartPadding, (val) => {
    baseChart.padding = { ...baseChart.padding, ...val }
  })
  watch(() => props.items, () => updateScales())
</script>

<style lang="scss">
.heatmap {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
}

.heatmap__svg {
  height: 100%;
  width: 100%;
}

.heatmap__x-axis-group,
.heatmap__y-axis-group {
  user-select: none;
}

.heatmap__heatmap-group {
  position: absolute;
  top: 0;
  left:0;
  width: 100%;
}

// .heatmap__bucket {
//     position: absolute;
//   transform: translateX(50%) scaleX(-1);
//   // border-radius: 50%;
//   background-color: rgba(0, 0, 0, 0.5);
//   z-index: 2;
// }
</style>