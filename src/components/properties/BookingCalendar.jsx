"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import { Calendar04 } from "@/components/calendar-04.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users } from "lucide-react"
import { differenceInDays, eachDayOfInterval, isSameDay, startOfDay } from "date-fns"
import { getListingBookings } from "@/lib/api"

export default function BookingCalendar({
    listingId,
    pricePerNight = 0,
    onReserve,
    minNights = 1,
    maxNights = 20
}) {
    const [dateRange, setDateRange] = React.useState({
        from: undefined,
        to: undefined,
    })
    const [guests, setGuests] = useState(1)
    const [bookings, setBookings] = useState([])
    const [disabledDates, setDisabledDates] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Load bookings
    useEffect(() => {
        const loadBookings = async () => {
            if (!listingId) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const data = await getListingBookings(listingId)
                // Handle different response formats: array directly or { bookings: [...] }
                const bookingsArray = Array.isArray(data) 
                    ? data 
                    : (data?.bookings || data?.data || [])
                
                setBookings(bookingsArray)

                // Convert bookings to disabled dates
                const disabled = []
                bookingsArray.forEach(booking => {
                    // Support different field names: fecha_desde/fecha_hasta or startDate/endDate
                    const startDate = booking.fecha_desde || booking.startDate || booking.checkIn
                    const endDate = booking.fecha_hasta || booking.endDate || booking.checkOut
                    
                    if (startDate && endDate) {
                        const start = new Date(startDate)
                        const end = new Date(endDate)
                        
                        // Validate dates
                        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                            try {
                                const dates = eachDayOfInterval({ start, end })
                                disabled.push(...dates)
                            } catch (err) {
                                console.error('Error processing booking dates:', err, { start, end })
                            }
                        }
                    }
                })
                setDisabledDates(disabled)
            } catch (err) {
                console.error('Error loading bookings:', err)
                setError('Error al cargar disponibilidad')
                setBookings([])
                setDisabledDates([])
            } finally {
                setIsLoading(false)
            }
        }

        loadBookings()
    }, [listingId])

    // Validate range when dates change
    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            const nights = differenceInDays(dateRange.to, dateRange.from)

            if (nights < minNights) {
                setError(`La estadía mínima es de ${minNights} noches`)
                return
            }

            if (nights > maxNights) {
                setError(`La estadía máxima es de ${maxNights} noches`)
                return
            }

            // Check for overlap with bookings
            const hasOverlap = bookings.some(booking => {
                if (!booking.fecha_desde || !booking.fecha_hasta) return false

                const bookedStart = startOfDay(new Date(booking.fecha_desde))
                const bookedEnd = startOfDay(new Date(booking.fecha_hasta))
                const rangeStart = startOfDay(dateRange.from)
                const rangeEnd = startOfDay(dateRange.to)

                return (
                    (rangeStart >= bookedStart && rangeStart < bookedEnd) ||
                    (rangeEnd > bookedStart && rangeEnd <= bookedEnd) ||
                    (rangeStart <= bookedStart && rangeEnd >= bookedEnd)
                )
            })

            if (hasOverlap) {
                setError('Las fechas seleccionadas no están disponibles')
            } else {
                setError(null)
            }
        } else {
            setError(null)
        }
    }, [dateRange, bookings, minNights, maxNights])

    const isDateDisabled = (date) => {
        if (!date) return true

        const today = startOfDay(new Date())
        const checkDate = startOfDay(date)

        // Disable past dates
        if (checkDate < today) return true

        // If 'from' is selected, disable dates before 'from' (but allow 'from' itself)
        if (dateRange.from && !dateRange.to) {
            const fromDate = startOfDay(dateRange.from)
            if (checkDate < fromDate) return true
        }

        // Disable already booked dates
        return disabledDates.some(
            disabledDate => isSameDay(checkDate, startOfDay(disabledDate))
        )
    }

    const handleReserve = () => {
        if (!dateRange.from || !dateRange.to || error) return

        onReserve({
            checkIn: dateRange.from,
            checkOut: dateRange.to,
            guests,
        })
    }

    const nights = dateRange.from && dateRange.to
        ? differenceInDays(dateRange.to, dateRange.from)
        : 0
    const total = nights * (pricePerNight || 0)
    const serviceFee = Math.round(total * 0.1)
    const grandTotal = total + serviceFee

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-2xl">
                        ${(pricePerNight || 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ noche</span>
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Calendar */}
                <div className="flex min-w-0 flex-col gap-2 w-full">
                    <Calendar04
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        disabled={isDateDisabled}
                        numberOfMonths={1}
                        className="rounded-lg border shadow-sm w-full"
                    />
                </div>

                {/* Guests */}
                <div className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Huéspedes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                        >
                            -
                        </Button>
                        <span className="w-8 text-center">{guests}</span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setGuests(guests + 1)}
                        >
                            +
                        </Button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Price Breakdown */}
                {dateRange.from && dateRange.to && nights > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                            <span>${(pricePerNight || 0).toLocaleString()} x {nights} noches</span>
                            <span>${total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tarifa de servicio</span>
                            <span>${serviceFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                            <span>Total</span>
                            <span>${grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* Reserve Button */}
                <Button
                    className="w-full"
                    size="lg"
                    onClick={handleReserve}
                    disabled={!dateRange.from || !dateRange.to || !!error || isLoading}
                >
                    {isLoading ? 'Cargando...' : 'Reservar'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    Serás redirigido a Mercado Pago para completar la reserva
                </p>
            </CardContent>
        </Card>
    )
}
