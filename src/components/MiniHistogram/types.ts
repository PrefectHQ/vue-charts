import { Pixels } from '@prefecthq/prefect-design'
import { HistogramDataPoint } from '@/components/HistogramChart'

export type MiniHistogramOptions = {
  colorStart?: string,
  colorEnd?: string,
  startDate?: Date,
  endDate?: Date,
  minValue?: number,
  maxValue?: number,
  clickable?: boolean,
}

export type MiniHistogramBar = HistogramDataPoint & {
  styles: {
    left: Pixels,
    width: Pixels,
  },
}