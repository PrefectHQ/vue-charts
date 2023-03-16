<template>
  <div class="chart-labels" :class="classes.root">
    <div class="chart-labels__chart">
      <slot />
    </div>

    <template v-if="scales?.y">
      <div class="chart-labels__y">
        <div class="chart-labels__label chart-labels__label-y chart-labels__label-y--min">
          <slot name="label-y" :value="maxValue">
            <span class="chart-labels__value-label">{{ maxValue }}</span>
          </slot>
        </div>
        <div class="chart-labels__label chart-labels__label-y chart-labels__label-y--max">
          <slot name="label-y" :value="minValue">
            <span class="chart-labels__value-label">{{ minValue }}</span>
          </slot>
        </div>
      </div>
    </template>

    <template v-if="scales?.x">
      <div class="chart-labels__x">
        <div class="chart-labels__label chart-labels__label-x chart-labels__label-x--start">
          <slot name="label-x" :value="startDate">
            <template v-if="startDate">
              <span class="chart-labels__date-label">{{ formatDateLabel(startDate) }}</span>
              <span class="chart-labels__time-label">{{ formatTimeLabel(startDate) }}</span>
            </template>
          </slot>
        </div>
        <div class="chart-labels__label chart-labels__label-x chart-labels__label-x--end">
          <slot name="label-x" :value="endDate">
            <template v-if="endDate">
              <span class="chart-labels__date-label">{{ formatDateLabel(endDate) }}</span>
              <span class="chart-labels__time-label">{{ formatTimeLabel(endDate) }}</span>
            </template>
          </slot>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { ChartLabelScales } from '@/components/ChartLabels/types'
  import { formatDateLabel } from '@/utilities/formatDateLabel'
  import { formatTimeLabel } from '@/utilities/formatTimeLabel'

  const props = defineProps<{
    scales?: ChartLabelScales,
  }>()

  const classes = computed(() => ({
    root: {
      'chart-labels--x': props.scales?.x,
      'chart-labels--y': props.scales?.y,
    },
  }))

  const x = computed(() => props.scales?.x)
  const y = computed(() => props.scales?.y)
  const startDate = computed(() => x.value?.domain().at(0))
  const endDate = computed(() => x.value?.domain().at(-1))
  const minValue = computed(() => y.value?.domain().at(0))
  const maxValue = computed(() => y.value?.domain().at(-1))
</script>

<style>
.chart-labels { @apply
  grid
  gap-2;
  grid-template-rows: 1fr;
  grid-template-areas: 'chart';
}

.chart-labels__chart { @apply
  grid
  grid-cols-1;
  grid-area: chart;
}

.chart-labels--x {
  grid-template-rows: 1fr min-content;
  grid-template-areas: 'chart'
                       'xAxis';
}

.chart-labels--y {
  grid-template-columns: min-content 1fr;
  grid-template-areas: 'yAxis chart';
}

.chart-labels--x.chart-labels--y {
  grid-template-areas: 'yAxis chart'
                       '.     xAxis';
}

.chart-labels__x { @apply
  flex
  justify-between;

  grid-area: xAxis;
}

.chart-labels__label-x { @apply
  flex
  flex-col
  gap-0.5
}

.chart-labels__label-x--end { @apply
  items-end
}

.chart-labels__date-label { @apply
  text-sm
  text-foreground
}

.chart-labels__time-label { @apply
  text-xs
  text-foreground-200
}

.chart-labels__value-label { @apply
  text-foreground-200
}

.chart-labels__y { @apply
  flex
  flex-col
  items-end
  justify-between
  border-r
  border-foreground-100
  pr-2;

  grid-area: yAxis;
}
</style>