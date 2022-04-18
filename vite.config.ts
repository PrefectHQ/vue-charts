import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

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
    emptyOutDir: false,
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
          vue: 'Vue',
        },
      },
    },
  },
})

// eslint-disable-next-line import/no-default-export
export default config