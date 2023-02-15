export function roundUpToIncrement(value: number, increment?: number): number {
  const incrementValue = increment ?? getSmallestIncrement(value)
  const roundedUp = Math.ceil(value / incrementValue) * incrementValue

  if (roundedUp === value) {
    return roundedUp + incrementValue
  }

  return roundedUp
}

function getSmallestIncrement(value: number): number {
  if (value < 10) {
    return 10
  }

  if (value < 25) {
    return 5
  }

  if (value < 100) {
    return 10
  }

  if (value < 150) {
    return 25
  }

  if (value < 500) {
    return 50
  }

  if (value < 1000) {
    return 100
  }

  if (value < 10000) {
    return 1000
  }

  if (value < 100000) {
    return 10000
  }

  return 100000
}