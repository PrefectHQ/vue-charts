import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
  if (mode == 'demo') {
    return {
      root: './demo',
      resolve: {
        alias: [
          {
            find: '@/demo',
            replacement: resolve(__dirname, './demo'),
          },
          {
            find: '@',
            replacement: resolve(__dirname, 'src'),
          },
        ],
      },
      plugins: [vue(), svgLoader()],
      build: {
        cssCodeSplit: false,
      },
    }
  }

  return {
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, 'src'),
        },
      ],
    },
    plugins: [vue(), svgLoader(), dts()],
    build: {
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'vue-charts',
      },
      rollupOptions: {
        external: ['vue', '@prefecthq/prefect-design'],
        output: {
          exports: 'named',
          // Provide vue as a global variable to use in the UMD build
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  }

})
