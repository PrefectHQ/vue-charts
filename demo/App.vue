<template>
  <div class="app">
    <nav class="app__nav">
      <router-link to="/bar-chart">
        Bar Chart
      </router-link>
      <router-link to="/diverging-bar-chart">
        Diverging Bar Chart
      </router-link>
      <router-link to="/timeline">
        Timeline
      </router-link>
      <router-link to="/scatter-plot">
        Scatter Plot
      </router-link>
    </nav>
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
  grid-template-rows: 48px 1fr;
  min-height: 100vh;
  width: 100vw;

  &__nav {
    grid-area: "nav";
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 0 8px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);

    >* {
      margin-right: 32px;
    }
  }

  &__main {
    grid-area: "main";
    width: inherit;
  }
}
</style>