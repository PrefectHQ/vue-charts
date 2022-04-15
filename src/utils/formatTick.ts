/* eslint-disable max-params */
export function formatTick(itemAmount: number, axisMeasurement: number, axisPadding: number, baseDimension: number, returnOnNull: number = 1): number {
  if (!itemAmount) {
    return returnOnNull
  }
  const ticks = Math.floor(itemAmount * ((axisMeasurement - axisPadding) / (itemAmount * baseDimension)))
  return Math.max(ticks, 1)
}