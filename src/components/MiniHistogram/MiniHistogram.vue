<template>
  <div ref="chart" class="mini-histogram" :class="classes.root">
    <template v-for="bar in bars" :key="bar.intervalStart.getTime()">
      <slot name="bar" v-bind="bar">
        <div
          class="mini-histogram__bar"
          :class="classes.bar"
          :style="bar.styles"
          @click="() => onBarClick(bar)"
        />
      </slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { toPixels, useColorTheme } from '@prefecthq/prefect-design'
  import { useElementRect } from '@prefecthq/vue-compositions'
  import { scaleTime, scaleLinear } from 'd3'
  import { computed, ref } from 'vue'
  import { HistogramData, HistogramDataPoint } from '@/components/HistogramChart'
  import { MiniHistogramBar, MiniHistogramOptions } from '@/components/MiniHistogram/types'
  import { sortByDateProperty } from '@/utilities/sortByDate'

  type OptionsWithDefaultValues = Required<Pick<MiniHistogramOptions, 'colorStart' | 'colorEnd'>>

  const props = defineProps<{
    data: HistogramData,
    options?: MiniHistogramOptions,
  }>()

  const emit = defineEmits<{
    (event: 'barClick', value: MiniHistogramBar): void,
  }>()

  const { value: theme } = useColorTheme()

  const chart = ref<Element>()
  const { width: chartWidth } = useElementRect(chart)

  const data = computed(() => sortByDateProperty(props.data, 'intervalStart'))
  const bars = computed(() => data.value.map(point => getBar(point)))

  const options = computed<OptionsWithDefaultValues>(() => ({
    colorStart: '#7dd3fc',
    colorEnd: '#034efc',
    ...props.options,
  }))

  const classes = computed(() => {
    return {
      root: {
        'mini-histogram--clickable-bars': props.options?.clickable,
      },
      bar: {
        'mini-histogram__bar--clickable': props.options?.clickable,
      },
    }
  })

  const minDate = computed<Date>(() => {
    if (props.options?.startDate) {
      return props.options.startDate
    }

    const firstDataPoint = data.value.at(0)

    return firstDataPoint?.intervalStart ?? new Date()
  })

  const endDate = computed<Date>(() => {
    if (props.options?.endDate) {
      return props.options.endDate
    }

    const lastDataPoint = data.value.at(-1)

    return lastDataPoint?.intervalEnd ?? new Date()
  })

  const xScale = computed(() => {
    const scale = scaleTime()

    scale.domain([minDate.value, endDate.value])
    scale.range([0, chartWidth.value])

    return scale
  })

  const values = computed(() => data.value.map(point => point.value))

  const minValue = computed(() => {
    if (props.options?.minValue !== undefined) {
      return props.options.minValue
    }

    return Math.min(...values.value, 0)
  })

  const maxValue = computed(() => {
    if (props.options?.maxValue !== undefined) {
      return props.options.maxValue
    }

    return Math.max(...values.value, 0)
  })

  const yScale = computed(() => {
    const scale = scaleLinear()
    const range = [options.value.colorStart, options.value.colorEnd]

    if (theme.value === 'dark') {
      range.reverse()
    }

    scale.domain([minValue.value, maxValue.value])
    // @ts-expect-error @types/d3 has an incorrect type for scale. It only accepts numbers but it should also accept strings
    scale.range(range)

    return scale
  })

  function getBar(point: HistogramDataPoint): MiniHistogramBar {
    const left = xScale.value(point.intervalStart)
    const right = xScale.value(point.intervalEnd)
    const width = right - left

    const styles = {
      left: toPixels(left),
      width: toPixels(width),
      backgroundColor: yScale.value(point.value),
    }

    return { ...point, styles }
  }

  function onBarClick(bar: MiniHistogramBar): void {
    if (props.options?.clickable) {
      emit('barClick', bar)
    }
  }
</script>

<style>
.mini-histogram { @apply
  relative
  min-h-[theme('spacing.5')]
  overflow-hidden
}

.mini-histogram--clickable-bars { @apply
  py-4
}

.mini-histogram::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  top: 50%;
  background-color: theme('colors.slate.700');
}

.mini-histogram__bar { @apply
  top-[10%]
  bottom-[10%]
  absolute
  rounded-sm
}

.mini-histogram__bar--clickable { @apply
  top-1
  bottom-1
  cursor-pointer
}
.mini-histogram__bar--clickable:hover { @apply
  shadow-lg
  scale-[1.2]
  origin-center
  outline-8
  z-10
}
</style>