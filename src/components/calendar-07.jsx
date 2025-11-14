import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export default function Calendar07({ dateRange, setDateRange }) {
  const minNights = 2
  const maxNights = 20

  // Valores por defecto si no se pasan props
  const defaultDateRange = dateRange || {
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  }

  const handleSelect = (range) => {
    if (setDateRange) {
      setDateRange(range || { from: undefined, to: undefined })
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Calendar
        mode="range"
        defaultMonth={defaultDateRange?.from || new Date()}
        selected={dateRange || defaultDateRange}
        onSelect={handleSelect}
        numberOfMonths={2}
        min={minNights}
        max={maxNights}
        className="rounded-lg border shadow-sm"
      />
    </div>
  )
}
