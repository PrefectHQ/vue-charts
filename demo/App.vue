<template>
  <div class="max-w-full min-h-full app">
    <template v-if="!media.lg">
      <p-global-sidebar class="app__mobile-menu">
        <template #upper-links>
          <p-icon icon="Prefect" class="app__prefect-icon" />
          <span class="text-slate-200">Prefect</span>
        </template>
        <template #bottom-links>
          <PIcon icon="Bars3Icon" class="app__menu-icon" @click="toggle" />
        </template>
      </p-global-sidebar>
    </template>
    <ContextSidebar v-if="showMenu" class="app__sidebar" />
    <router-view class="w-full mx-auto py-10 px-6 lg:px-8" />
  </div>
</template>

<script lang="ts" setup>
  import { media, PGlobalSidebar, PIcon, useColorTheme } from '@prefecthq/prefect-design'
  import { computed, watchEffect } from 'vue'
  import { RouterView } from 'vue-router'
  import ContextSidebar from '@/demo/components/ContextSidebar.vue'
  import { mobileMenuOpen, toggle } from '@/demo/router/menu'

  const showMenu = computed(() => media.lg || mobileMenuOpen.value)

  watchEffect(() => document.body.classList.toggle('body-scrolling-disabled', showMenu.value && !media.lg))

  useColorTheme()
</script>

<style>
.body-scrolling-disabled { @apply
  overflow-hidden
}

.app__prefect-icon { @apply
  w-6
  h-6
}

.app__menu-icon { @apply
  w-6
  h-6
  cursor-pointer
}

.app__router-view { @apply
  relative
  z-0
}

.app__router-view-fade-enter-active,
.app__router-view-fade-leave-active {
  transition: opacity 0.25s ease;
}

.app__router-view-fade-enter-from,
.app__router-view-fade-leave-to {
  opacity: 0;
}

@screen lg {
  .app {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
  }
}
</style>