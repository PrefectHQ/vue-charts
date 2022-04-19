<template>
  <div ref="container" class="heatmap">
    <!--
      <svg :id="id" class="heatmap__svg">
      <g class="heatmap__x-axis-group" />
      <g class="heatmap__y-axis-group" />
      </svg>
    -->

    <template v-for="(group, key) in grouped" :key="key">
      <div class="heatmap__bucket" :style="calculateOpacity(group)">
        <!-- {{ group.items.length }} -->
      </div>
    </template>


    <!--
      <div v-for="data in groupedData" :key="data.key" class="heatmap__heatmap-group">
      <HeatmapGroup :data="data" :x-extent="getXExtent()" />
      </div>
    -->
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
    bucketAmount: 20,
    bucketOpacityRange: 4,
    chartPadding: () => {
      return { top: 20, left: 100, bottom: 40, right: 40 }
    },
  })

  type HeatMapItemGroup = {
    start: number,
    end: number,
    items: HeatmapItem[],
  }

  type OpacityGroup = {
    min: number,
    max: number,
    opacity: number,
  }

  const container = ref<HTMLElement>()
  // const xScale = ref(d3.scaleTime())
  // const yScale = ref(d3.scaleBand())
  // let xAxisGroup: GroupSelection | undefined
  // let yAxisGroup: GroupSelection | undefined

  const items = computed(() => props.items)
  let groupedData: any

  const groups = computed(() => {
    const [start, end] = extent.value
    let _groups = []

    let currentDate = start.getTime()

    while (currentDate < end.getTime()) {
      let nextDate = currentDate + bucketInterval.value
      _groups.push({ start: currentDate, end: nextDate })
      currentDate = nextDate
    }

    return _groups
  })

  const grouped = computed<Record<number, HeatMapItemGroup>>(() => {
    const itemGroups = {}

    groups.value.forEach(group => {
      itemGroups[group.start] = {
        ...group,
        items: [],
      }
    })

    props.items.forEach(item => {
      const ms = item.date.getTime()
      const group = groups.value.find(group => group.start <= ms && group.end > ms)

      itemGroups[group.start].items.push(item)
    })


    return itemGroups
  })


  const opacityGroups = computed<OpacityGroup[]>(() => {
    const [min, max] = [1, groupedMaxLength.value]
    const opacityGroupInterval = groupedMaxLength.value / props.bucketOpacityRange
    const opacityInterval = 1 / props.bucketOpacityRange
    let groups = []

    let currentMin = min

    while (currentMin < max) {
      let nextMin = currentMin + opacityGroupInterval
      const opacity = opacityInterval * (groups.length + 1)
      groups.push({ min: currentMin, max: nextMin, opacity })
      currentMin = nextMin
    }

    return groups
  })

  const calculateOpacity = (group: HeatMapItemGroup): CSSProperties => {
    if (group.items.length == 0) {
      return { opacity: 0 }
    }

    const opacityGroup = opacityGroups.value.find(g => g.min <= group.items.length && g.max > group.items.length)

    return {
      opacity: opacityGroup.opacity,
    }

  }

  // SETUP BASE
  // const handleResize = (): void => {
  //   updateScales()
  // }
  // const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
  // const { id } = baseChart

  // const xAxis = (groupSelection: GroupSelection): GroupSelection | TransitionSelection => groupSelection
  //   .call(d3.axisBottom(xScale.value))

  // const yAxis = (groupSelection: GroupSelection): GroupSelection | TransitionSelection => groupSelection
  //   .call(d3.axisLeft(yScale.value))

  const xAccessor = (item: ScatterPlotItem): Date => item.date


  // make this a dateExtent utility
  const extent = computed((): [Date, Date] => {
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
  })


  const groupedMaxLength = computed<number>(() => {
    const groupsArray = Object.values(grouped.value)

    const maxLength = Math.max(...groupsArray.map(item => item.items.length))

    return maxLength
  })

  onMounted(() => {
    console.log(groupedMaxLength.value)
    console.log(opacityGroups.value)
    console.log(calculateOpacity)
  })

  const bucketInterval = computed(() => {
    const [start, end] = extent.value

    const intervalInMs = end.getTime() - start.getTime()
    const bucketIntervalInMs = intervalInMs / props.bucketAmount

    return Math.ceil(bucketIntervalInMs)
  })

  // const groupItems = () => {
  //   const [start, end] = getXExtent()

  //   let groups = []

  //   let currentDate = start
  //   while (currentDate < end) {
  //     let nextDate = new Date(currentDate.getTime() + bucketInterval.value)
  //     groups.push({ label: currentDate, groups: [] })
  //     // items.value.map(d => {
  //     //   if (currentDate <= d.x || nextDate > d.x) {
  //     //     console.log(d)
  //     //   }
  //     // })
  //     currentDate = nextDate
  //   }


  // }


  // const updateScales = (): void => {
  //   updateXScale()
  //   updateYScale()


  //   // if (xAxisGroup) {
  //   //   xAxisGroup.call(xAxis)

  //   //   xAxisGroup
  //   //     .attr('transform', `translate(0, ${baseChart.height.value - baseChart.padding.bottom})`)
  //   //     .attr('font-family', 'input-sans')
  //   //     .attr('font-size', '11')
  //   // }

  //   // if (yAxisGroup) {
  //   //   yAxisGroup.call(yAxis)
  //   //   yAxisGroup
  //   //     .attr('transform', `translate(${baseChart.padding.left}, ${baseChart.padding.top})`)
  //   //     .attr('font-family', 'input-sans')
  //   //     .attr('font-size', '11')
  //   // }
  // }

  // const updateXScale = (): void => {
  //   const extentX = getXExtent()

  //   xScale.value = d3
  //     .scaleTime()
  //     .domain(extentX)
  //     .range([0, props.bucketAmount])
  // }

  // const updateYScale = (): void => {
  //   yScale.value = d3
  //     .scaleBand()
  //     .domain([0, props.bucketSize])
  //     .range([0, 1])
  // }


  // onMounted(() => {
  //   const svg = d3.select(`#${id}`)

  //   xAxisGroup = svg.select('.heatmap__x-axis-group')
  //   yAxisGroup = svg.select('.heatmap__y-axis-group')


  //   groupItems()


  //   updateScales()
  // })


  // watch(() => props.chartPadding, (val) => {
  //   baseChart.padding = { ...baseChart.padding, ...val }
  // })
  // watch(() => props.items, () => updateScales())
</script>

<style lang="scss">
.heatmap {
  --columns: v-bind(bucketAmount);
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: 5px;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
}

.heatmap__bucket {
  background-color: blue;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
}

// .heatmap__svg {
//   height: 100%;
//   width: 100%;
// }

// .heatmap__x-axis-group,
// .heatmap__y-axis-group {
//   user-select: none;
// }

// .heatmap__heatmap-group {
//   position: absolute;
//   top: 0;
//   left:0;
//   width: 100%;
// }

// .heatmap__bucket {
//     position: absolute;
//   transform: translateX(50%) scaleX(-1);
//   // border-radius: 50%;
//   background-color: rgba(0, 0, 0, 0.5);
//   z-index: 2;
// }
</style>