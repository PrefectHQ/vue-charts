<template>
  <div class="app">
    <nav class="app__nav">NAV</nav>
    <main class="app__main">MAIN</main>
  </div>
</template>

<script lang="ts" setup>
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
}
</style>