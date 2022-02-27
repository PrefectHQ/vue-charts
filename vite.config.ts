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
      name: 'Vue Charts',
    },
    rollupOptions: {
      // ensures vue isn't added to the bundle
      external: ['vue'],
      output: {
        // Provide vue as a global variable to use in the UMD build
        globals: {
          vue: 'Vue'
        }
      },
    }
  },
})

export default config