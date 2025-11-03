"use client"
import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export default function Calendar07() {
  const [dateRange, setDateRange] = React.useState({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  })
  const minNights = 2
  const maxNights = 20
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Calendar
        mode="range"
        defaultMonth={dateRange?.from}
        selected={dateRange}
        onSelect={setDateRange}
        numberOfMonths={2}
        min={minNights}
        max={maxNights}
        className="rounded-lg border shadow-sm"
      />
    </div>
  )
}
