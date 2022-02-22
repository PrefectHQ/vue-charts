<template>
  <div class="app">
    <nav class="app__nav">NAV</nav>
    <main class="app__main">
      <h2>Bar Chart</h2>

      <m-tabs v-model="tab">
        <m-tab href="chart">Chart</m-tab>
        <m-tab href="data">Data</m-tab>
      </m-tabs>

      <div v-if="tab == 'chart'" class="app__bar-chart">
        <BarChart
          :items="data.items"
          :interval-start="data.intervalStart"
          :interval-end="data.intervalEnd"
        />
      </div>

      <div v-if="tab == 'data'" class="app_bar-chart-data">
        Start: {{ data.intervalStart.toLocaleTimeString() }}
        <br />
        End: {{ data.intervalEnd.toLocaleTimeString() }}
        <br />

        <div style="max-width: 300px;">
          <div class="d-flex justify-space-around">
            <span>Start</span>
            <span class="mx-auto">End</span>
            <span class="ml-auto">Value</span>
          </div>
          <div
            v-for="item in data.items"
            :key="item.intervalStart.toString()"
            class="d-flex justify-space-between"
          >
            <span>{{ item.intervalStart.toLocaleTimeString() }}</span>
            <span class="mx-auto">{{ item.intervalEnd.toLocaleTimeString() }}</span>
            <span class="ml-auto">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import BarChart from '@/BarChart.vue'
import generateData from './data';
import { computed, ref } from 'vue'

const start = ref(new Date())
const tab = ref('chart')
const data = computed(() => generateData({ intervalStart: start.value, buckets: 50 }))

</script>

<style lang="scss">
.app {
  display: grid;
  grid-template-areas:
    "nav"
    "main";
  grid-template-columns: 1fr;
  grid-template-rows: 84px 1fr;
  min-height: 100vh;

  &__nav {
    grid-area: "nav";
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 0 8px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);

    > * {
      margin-right: 32px;
    }
  }

  &__main {
    grid-area: "main";
  }

  &__bar-chart {
    background-color: #f7f8fa;
    height: 400px;
    max-height: 100vh;
    min-height: 200px;
    max-width: 100vw;
    min-width: 200px;
    overflow: auto;
    resize: both;
  }
}
</style>