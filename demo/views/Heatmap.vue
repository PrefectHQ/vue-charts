<template>
  <div class="controls">
    <span>Buckets</span>
    <input v-model="bucketAmount" type="number">
    <span>Opacity Range</span>
    <input v-model="bucketOpacityRange" type="number">
  </div>
  <div class="controls">
    <input v-model="groupName" placeholder="Group Name" type="text">
    <button type="button" :disabled="!groupName.length" @click="addGroup(groupName)">
      Add Group
    </button>
  </div>
  <div class="controls">
    <select v-model="groupToAddTo">
      <template v-for="({ name }, index) in groups" :key="index">
        <option :value="name">
          {{ name }}
        </option>
      </template>
    </select>
    <input v-model="itemsToAdd" type="number">
    <button type="button" @click="add">
      Add Items
    </button>
    <span>Total Items: {{ items.length }}</span>
  </div>
  <Heatmap class="heatmap" :items="groups" v-bind="{ bucketAmount, bucketOpacityRange }">
    <template #group="{ group }">
      <div class="controls">
        <span class="group-name">{{ group.name }}</span>
        <template v-if="group.name.length">
          <input v-model="findGroup(group.name).color" type="color">
        </template>
        <button type="button" @click="removeGroup(group.name)">
          X
        </button>
      </div>
    </template>
  </Heatmap>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue'
  import Heatmap from '@/components/Heatmap.vue'
  import { HeatmapGroup, HeatmapItem } from '@/types'

  const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
  const now = new Date()
  const bucketAmount = ref(30)
  const bucketOpacityRange = ref(4)
  const groupToAddTo = ref('')
  const itemsToAdd = ref(10)
  const groupName = ref('')

  const groups: HeatmapGroup[] = reactive([])

  const items = computed(() => groups.flatMap(group => group.items))

  function findGroup(name: string): HeatmapGroup {
    return groups.find(group => group.name === name)!
  }

  function getRandomColor(): string {
    return `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`
  }

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

  function add(): void {
    addMany(groupToAddTo.value, itemsToAdd.value)
  }

  function addMany(name: string, amount: number): void {
    const newItems = new Array(amount).fill(null).map(() => getHeatmapItem())
    const group = findGroup(name)

    group.items.push(...newItems)
  }

  function addGroup(name: string): void {
    groups.push({
      name,
      items: [],
      color: getRandomColor(),
    })

    addMany(name, 50)
  }

  function removeGroup(name: string): void {
    const index = groups.findIndex(group => {
      return group.name === name
    })

    groups.splice(index, 1)
  }

  addGroup('Group 1')
  groupToAddTo.value = 'Group 1'
</script>

<style lang="scss">
.heatmap {
  height: min-content;
  padding: 8px;
}

.controls {
  display: flex;
  gap: 8px;
  padding: 8px;
}

.group-name {
  flex-grow: 1;
}
</style>