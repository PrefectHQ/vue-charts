<template>
  <div class="app">
    <nav class="app__nav">NAV</nav>
    <main class="app__main">
      <router-view />
    </main>
  </div>
</template>

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
    min-width: 400px;
    overflow: auto;
    resize: both;
  }

  &__bar {
    border-radius: 9999px;
    height: 100%;
    width: 100%;
  }
}
</style>