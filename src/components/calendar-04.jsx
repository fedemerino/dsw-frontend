"use client";
import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export const Calendar04 = ({ 
  dateRange, 
  setDateRange, 
  disabled,
  numberOfMonths = 1,
  className = "rounded-lg border shadow-sm"
}) => {
  return (
    <div className="w-full">
      <Calendar
        mode="range"
        defaultMonth={dateRange?.from || new Date()}
        selected={dateRange}
        onSelect={(range) => {
          if (setDateRange) {
            setDateRange(range || { from: undefined, to: undefined })
          }
        }}
        numberOfMonths={numberOfMonths}
        disabled={disabled}
        className={`${className} w-full`} />
    </div>
  );
};
