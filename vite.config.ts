import { resolve } from 'path'
import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'

const config = defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
    ],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RADAR',
      fileName: (format) => `vue-charts.${format}.js`,
    },
  },
})

export default config