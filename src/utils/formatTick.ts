/* eslint-disable max-params */
export function formatTick(itemAmount: number, axisMeasurement: number, axisPadding: number, divider: number, returnOnNull: number = 1): number {
  if (!itemAmount) {
    return returnOnNull
  }
  const ticks = Math.floor(itemAmount * ((axisMeasurement - axisPadding) / (itemAmount * divider)))
  return Math.max(ticks, 1)
}