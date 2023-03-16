import { scaleLinear, scaleTime } from 'd3'

export type ChartLabelScales = {
  x?: ReturnType<typeof scaleTime>,
  y?: ReturnType<typeof scaleLinear>,
}