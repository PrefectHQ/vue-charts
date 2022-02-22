<template>
  <div ref="container" class="bar-chart">
    <template v-if="itemsWithValue.length">
      <svg :id="id" ref="chart" class="bar-chart__svg">
        <!-- -->
      </svg>

      <div class="bar-chart__median" />

      <div class="bar-chart__bucket-container">
        <template v-for="item in itemsWithValue" :key="item.intervalStart">
          <div :style="calculateItemPosition(item)" class="bar-chart__item">
            <div class="bar-chart__bucket">
              <slot :item="item" />
            </div>
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <slot name="empty">
        <div class="bar-chart__empty">--</div>
      </slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
import * as d3 from 'd3'
import { useBaseChart } from './Base'
import { BarChartItem } from './types'
import { computed, ref, onMounted, onBeforeUpdate } from 'vue'
import { CSSProperties } from '@vue/runtime-dom'

const props = defineProps<{
  intervalStart: Date,
  intervalEnd: Date,
  items: BarChartItem[]
}>()

const container = ref<HTMLElement>()

const xScale = d3.scaleTime()
const yScale = d3.scaleLinear()
const handleResize = (): void => {
  updateScales()
}

const updateScales = (): void => {
  const start = props.intervalStart
  const end = props.intervalEnd

  xScale
    .domain([start, end])
    .range([padding.left, width.value - paddingX])

  yScale
    .domain([0, maxValue.value || 1])
    .range([0, height.value - paddingY])
}

const { id, padding, paddingX, paddingY, svg, height, width } = useBaseChart(container, { onResize: handleResize })


const barWidth = computed<number>(() => {
  return Math.floor(
    Math.min(10, (width.value - paddingX) / props.items.length / 2),
  )
})

const itemsWithValue = computed<BarChartItem[]>(() => {
  return props.items.filter((item) => item.value)
})

const maxValue = computed(() => {
  const values = props.items.map((item) => item.value)
  return Math.max(...values)
})



const calculateItemPosition = (item: BarChartItem): CSSProperties => {
  const height = yScale(item.value)
  const top = height - padding.bottom - height
  const left = xScale(item.intervalStart) + padding.left
  return {
    height: `${height}px`,
    left: `${left}px`,
    top: `${top}px`,
    width: `${barWidth.value}px`,
  }
}

onMounted(() => {
  updateScales()
})

onBeforeUpdate(() => {
  updateScales()
})

</script>

<style lang="scss">
.bar-chart {
  height: 100%;
  position: relative;
  width: 100%;
}

.bar-chart__svg {
  height: 100%;
  width: 100%;
}

.bar-chart__median {
  bottom: 0;
  height: 1px;
  left: 0;
  position: absolute;
  transition: top 150ms;
  width: 100%;
}

.bar-chart__bucket-container {
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
}

.bar-chart__item {
  position: absolute;
  transform: translateX(50%);
}

.bar-chart__bucket {
  background-color: #465968;
  border-radius: 999px;
  height: inherit;
  transform-origin: bottom;
  transition: all 150ms;
  width: inherit;
  z-index: 1;

  &:hover,
  &:focus {
    background-color: #0035b0;
  }
}

.bar-chart__empty {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
