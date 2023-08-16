/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const prefectDesignTheme = require('@prefecthq/prefect-design/dist/tailwindTheme.js')
const prefectDesignUtilities = require('@prefecthq/prefect-design/dist/tailwindUtilities.js')

const colors = {
  event: 'var(--p-color-event)',
  'event-dense': 'var(--p-color-event-dense)',
}

const extend = {
  colors,
}

const plugins = [
  prefectDesignTheme,
  prefectDesignUtilities
]

module.exports = {
  content: [
    './src/**/*.vue',
    './demo/index.html',
    './demo/**/*.vue',
  ],
  theme: {
    extend,
  },
  plugins,
}