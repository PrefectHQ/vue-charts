<template>
  <Heatmap class="heatmap" :items="items" />
</template>

<script lang="ts" setup>
  import Heatmap from '../../src/components/Heatmap.vue'
  import { HeatmapItem } from '../../src/types'

  const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
  const now = new Date()
  const items: HeatmapItem[] = new Array(100).fill(null).map(getHeatmapItem)

  function getHeatmapItem(): HeatmapItem {
    return {
      id: getRandomString(),
      date: getRandomDate(oneWeekAgo, now),
    }
  }

  function getRandomString(): string {
    return Math.random().toString(36).replace(/[^a-z]+/g, '')
  }

  function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }
</script>

<style lang="scss" scoped>
.heatmap {
height: min-content;
padding: 20px;
}
</style>