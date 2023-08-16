/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const prefectDesignPlugin = require('@prefecthq/prefect-design/dist/tailwindPlugin.js')

const colors = {
  event: 'var(--p-color-event)',
  'event-dense': 'var(--p-color-event-dense)',
}

const extend = {
  colors,
}

module.exports = {
  content: [
    './src/**/*.vue',
    './demo/index.html',
    './demo/**/*.vue',
  ],
  theme: {
    extend,
  },
  plugins: [prefectDesignPlugin],
}