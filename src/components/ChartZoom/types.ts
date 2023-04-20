export type DateRange = {
  startDate: Date,
  endDate: Date,
}

export type ChartZoomOptions = {
  minDate?: Date,
  maxDate?: Date,
  minRangeInSeconds?: number,
  maxRangeInSeconds?: number,
}