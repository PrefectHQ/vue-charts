import { scaleLinear, scaleTime } from 'd3'

export type ChartLabelsProp = {
  x?: ReturnType<typeof scaleTime>,
  y?: ReturnType<typeof scaleLinear>,
}