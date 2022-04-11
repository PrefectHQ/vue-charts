<template>
  <div class="container">
    <ScatterPlot :items="items" />
  </div>
</template>

<script lang="ts" setup>

import ScatterPlot from '../../src/ScatterPlot.vue'
import { ChartItem } from '../../src/types';

const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
const now = new Date()
const items: ChartItem[] = new Array(100).fill(null).map(getChartItem)

function getChartItem(): ChartItem {
  const item = {
    id: getRandomString(),
    duration: getRandomInt(0, 100),
    timestamp: getRandomDate(oneWeekAgo, now)
  }
  console.log(item)

  return item
}

function getRandomString(): string {
  return Math.random().toString(36).replace(/[^a-z]+/g, '')
}

function getRandomInt(min, max): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
  console.log(start, end)
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
</script>

<style lang="scss" scoped>
.container {
  max-width: 90vw;
  max-height: 90vh;
  margin: 20px auto;
}
</style>