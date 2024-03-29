<template>
  <div ref="chart" class="chart-play-head">
    <slot />
    <div ref="line" class="chart-play-head__now" :style="styles" />
  </div>
</template>

<script lang="ts" setup>
  import { toPixels } from '@prefecthq/prefect-design'
  import { useElementRect, useNow } from '@prefecthq/vue-compositions'
  import { scaleTime } from 'd3'
  import { computed, ref } from 'vue'

  const props = defineProps<{
    startDate: Date,
    endDate: Date,
  }>()

  const chart = ref<Element>()
  const { width: chartWidth } = useElementRect(chart)

  const line = ref<Element>()
  const { width: lineWidth } = useElementRect(line)
  const { now } = useNow()

  const xScale = computed(() => {
    const scale = scaleTime()

    scale.domain([props.startDate, props.endDate])
    scale.range([0, chartWidth.value])

    return scale
  })

  const styles = computed(() => {
    const left = xScale.value(now.value) - lineWidth.value / 2

    return {
      left: toPixels(left),
    }
  })
</script>

<style>
.chart-play-head { @apply
  grid
  grid-cols-1
  relative
}

.chart-play-head__now { @apply
  absolute
  top-0
  bottom-0
  bg-live
  pointer-events-none
  w-[2px]
}

.chart-play-head__now::before { @apply
  absolute
  top-0
  bottom-0
  bg-live
  opacity-20
  w-4;
  content: '';
  left: 50%;
  transform: translateX(-50%);
}
</style>