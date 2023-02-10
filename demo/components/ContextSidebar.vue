<template>
  <p-context-sidebar class="context-sidebar">
    <template #header>
      <template v-if="!mobileMenuOpen">
        <div class="context-sidebar__header">
          <p-icon class="context-sidebar__icon" icon="PrefectGradient" />
          <span class="context-sidebar__heading">Vue Charts</span>
        </div>
      </template>
    </template>

    <p-context-nav-item title="Bar Chart" to="/bar-chart" />
    <p-context-nav-item title="Diverging Bar Chart" to="/diverging-bar-chart" />

    <template #footer>
      <div class="context-sidebar__footer">
        <p-theme-toggle />
      </div>
    </template>
  </p-context-sidebar>
</template>

<script lang="ts" setup>
  import { mobileMenuOpen } from '@/demo/router/menu'
</script>

<style>
.context-sidebar { @apply
  z-50
}

.context-sidebar__header { @apply
  flex
  gap-1
  items-center
  mb-5
}

.context-sidebar__icon { @apply
  h-10
  w-10
}

.context-sidebar__heading { @apply
  font-normal
  text-xl
}

.context-sidebar__footer { @apply
  min-h-[36px]
  flex
  justify-center
  items-center
}
</style>