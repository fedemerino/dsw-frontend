"use client"

import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/components/auth/authContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, MapPin, Users, CreditCard, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react"
import { getUserBookings, cancelBooking } from "@/lib/api"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { ReviewForm } from "@/components/properties/ReviewForm"

export const BookingsPage = () => {
    const navigate = useNavigate()
    const { user, isLoading: authLoading } = useAuth()
    const [bookings, setBookings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isCancelling, setIsCancelling] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login")
        }
    }, [user, authLoading, navigate])

    useEffect(() => {
        const loadBookings = async () => {
            if (!user?.email) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const bookings = await getUserBookings(user.email)
                setBookings(bookings)
            } catch (error) {
                console.error('Error loading bookings:', error)
                setBookings([])
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            loadBookings()
        }
    }, [user])

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return (
                    <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Pendiente
                    </Badge>
                )
            case "confirmed":
                return (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Clock className="mr-1 h-3 w-3" />
                        Confirmada
                    </Badge>
                )
            case "completed":
                return (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Completada
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Cancelada
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status || "Pendiente"}</Badge>
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        try {
            return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es })
        } catch {
            return new Date(dateString).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })
        }
    }

    const handleCancelClick = (booking) => {
        setSelectedBooking(booking)
        setShowCancelDialog(true)
    }

    const handleConfirmCancel = async () => {
        if (!selectedBooking?.id) return

        setIsCancelling(true)
        try {
            await cancelBooking(selectedBooking.id)
            toast.success('Reserva cancelada correctamente')
            setBookings(bookings.map(b =>
                b.id === selectedBooking.id
                    ? { ...b, status: "CANCELLED" }
                    : b
            ))
            setShowCancelDialog(false)
            setSelectedBooking(null)
        } catch (error) {
            console.error('Error cancelling booking:', error)
        } finally {
            setIsCancelling(false)
        }
    }

    const handleReviewSubmitted = async () => {
        if (!user?.email) return
        try {
            const updatedBookings = await getUserBookings(user.email)
            setBookings(updatedBookings)
        } catch (error) {
            console.error('Error refreshing bookings:', error)
        }
    }

    const canLeaveReview = (booking) => {
        const status = booking.status?.toLowerCase()
        if (status === "completed") return true
        
        if (status === "confirmed" && booking.endDate) {
            const checkOutDate = new Date(booking.endDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            checkOutDate.setHours(0, 0, 0, 0)
            return checkOutDate < today
        }
        
        return false
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Mis Reservas</h1>
                    <p className="text-muted-foreground mt-1">Gestiona todas tus reservas de alojamiento</p>
                </div>

                {bookings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">No tienes reservas</h3>
                            <p className="text-muted-foreground text-center mb-6">
                                Comienza a explorar alojamientos increíbles para tu próximo viaje
                            </p>
                            <Button asChild>
                                <Link to="/search">Explorar alojamientos</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {

                            return (
                                <Card key={booking.id} className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="grid md:grid-cols-[240px_1fr] gap-0">
                                            <div className="relative h-48 md:h-full min-h-[240px]">
                                                <img
                                                    src={booking.listing.image || booking.listing.images?.[0]?.url || "/placeholder.svg"}
                                                    alt={booking.listing.title || "Propiedad"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-foreground mb-1">
                                                            {booking.listing.title || "Propiedad sin título"}
                                                        </h3>
                                                        <div className="flex items-center text-muted-foreground text-sm">
                                                            <MapPin className="h-4 w-4 mr-1" />
                                                            {booking.location || "Ubicación no disponible"}
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(booking.status)}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <span className="text-muted-foreground">Check-in:</span>
                                                            <span className="ml-1 font-medium text-foreground">{formatDate(booking.startDate)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <span className="text-muted-foreground">Check-out:</span>
                                                            <span className="ml-1 font-medium text-foreground">{formatDate(booking.endDate)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <span className="text-muted-foreground">Huéspedes:</span>
                                                            <span className="ml-1 font-medium text-foreground">{booking.guests}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <span className="text-muted-foreground">Total:</span>
                                                            <span className="ml-1 font-medium text-foreground">${booking.totalPrice.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {booking.createdAt && (
                                                    <div className="flex items-center gap-2 pt-4 border-t">
                                                        <span className="text-xs text-muted-foreground">ID de reserva: {booking.id}</span>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Reservado el {formatDate(booking.createdAt)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 mt-4 flex-wrap">
                                                    {booking.listing.id && (
                                                        <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                                            <Link to={`/listing/${booking.listing.id}`}>Ver propiedad</Link>
                                                        </Button>
                                                    )}
                                                    {booking.status?.toLowerCase() === "confirmed" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent cursor-pointer"
                                                            onClick={() => handleCancelClick(booking)}
                                                        >
                                                            Cancelar reserva
                                                        </Button>
                                                    )}
                                                    {canLeaveReview(booking) && booking.listing.id && (
                                                        <ReviewForm
                                                            listingId={booking.listing.id}
                                                            onReviewSubmitted={handleReviewSubmitted}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Cancelar reserva?</DialogTitle>
                        <DialogDescription>
                            Estás a punto de cancelar tu reserva en {selectedBooking?.listing?.title || selectedBooking?.property?.title || "esta propiedad"}.
                            Según la política de cancelación, se aplicará un cargo del 50% si cancelas con menos de 48 horas de anticipación.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">ID de reserva:</span>
                                <span className="font-mono font-semibold">{selectedBooking?.id || selectedBooking?.bookingId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total pagado:</span>
                                <span className="font-semibold">
                                    ${(selectedBooking?.totalPrice || selectedBooking?.total || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isCancelling} className="cursor-pointer">
                            No, mantener reserva
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmCancel} disabled={isCancelling} className="cursor-pointer">
                            {isCancelling ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelando...
                                </>
                            ) : (
                                "Sí, cancelar reserva"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
