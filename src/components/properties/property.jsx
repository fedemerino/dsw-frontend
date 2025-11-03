import { useState } from "react"
import { getPropertyById } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Star,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Wifi,
  Car,
  Waves,
  Utensils,
  Wind,
  Tv,
  ChevronLeft,
  CalendarIcon,
  Users,
  ChevronRight,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { handleFavoriteToggle } from "@/lib/utils"
import { format } from "date-fns"
import { Separator } from "../ui/separator"
import { es } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"

export const Property = () => {
  const params = useParams()
  const [property, setProperty] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [guests, setGuests] = useState(1)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const navigate = useNavigate()
  const userEmail = "admin@reservar.com"

  useState(() => {
    const fetchPropertyDetails = async () => {
      const propertyData = await getPropertyById(params.id)
      console.log(propertyData)
      setProperty(propertyData)
    }
    fetchPropertyDetails()
  }, [params.id])

  if (!property) {
    return <div>Loading...</div>
  }

  const handleFavClick = () => {
    handleFavoriteToggle(isFavorite, userEmail, property.id, setIsFavorite)
  }

  const amenityIcons = {
    WiFi: Wifi,
    Parking: Car,
    Piscina: Waves,
    Cocina: Utensils,
    "Aire acondicionado": Wind,
    TV: Tv,
  }

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    return nights * property.price
  }

  const handleReserve = () => {
    console.log('Reservar clicked')
    // if (!user) {
    //   router.push("/login")
    //   return
    // }
    // if (!checkIn || !checkOut) {
    //   alert("Por favor selecciona las fechas de check-in y check-out")
    //   return
    // }

    // const bookingData = {
    //   propertyId: property.id,
    //   checkIn: checkIn.toISOString(),
    //   checkOut: checkOut.toISOString(),
    //   guests,
    //   totalPrice: calculateTotal() + Math.round(calculateTotal() * 0.1),
    // }

    // localStorage.setItem("pendingBooking", JSON.stringify(bookingData))
    // router.push("/booking/confirm")
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Title and Actions */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
              {property.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-semibold text-foreground">
                  {property.rating}
                </span>
                <span>({property.reviews.length} reseñas)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{property.location}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFavClick}
              className={cn(isFavorite && "text-accent hover:text-accent")}
            >
              <Heart
                className="h-4 w-4"
                strokeOpacity="0.5"
                fill={isFavorite ? "red" : "none"}
              />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-8 space-y-2">
          {/* Imagen principal */}
          <div className="relative rounded-xl overflow-hidden h-[500px]">
            <img
              src={property.images[selectedImageIndex].url || "/placeholder.svg"}
              alt={`${property.title} - imagen ${selectedImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Navegación de la imagen principal */}
            {property.images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/90 hover:bg-card"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? property.images.length - 1 : prev - 1
                    )
                  }
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/90 hover:bg-card"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === property.images.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {property.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {property.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative rounded-lg overflow-hidden h-24 transition-all",
                    selectedImageIndex === index
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  )}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${property.title} - miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      {property.type}
                    </h2>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.beds} camas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms} baños</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{property.type}</Badge>
                </div>
                <Separator className="my-4" />
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Servicios
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity.name] || Wifi
                    return (
                      <div key={amenity.id} className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground">{amenity.name}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Reseñas
                  </h2>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <span className="text-lg font-semibold">
                      {property.rating}
                    </span>
                    <span className="text-muted-foreground">
                      ({property.reviews.length} reseñas)
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {property.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-border last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="font-semibold text-foreground">
                            {review.user.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-foreground">
                                {review.user.fullName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(review.createdAt), "MMMM yyyy", {
                                  locale: es,
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-accent text-accent" />
                              <span className="font-semibold">
                                {review.rating}
                              </span>
                            </div>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {property.reviews.length > 3 && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                    >
                      {showAllReviews
                        ? "Ver menos reseñas"
                        : `Ver todas las reseñas (${property.reviews.length})`}
                    </Button>
                  </div>
                )}

                {property.reviews.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aún no hay reseñas para esta propiedad
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-foreground">
                      ${property.pricePerNight}
                    </span>
                    <span className="text-muted-foreground">/ noche</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Check-in/out */}
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !checkIn && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, "dd/MM/yy") : "Check-in"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={setCheckIn}
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !checkOut && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut
                            ? format(checkOut, "dd/MM/yy")
                            : "Check-out"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Guests */}
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">Huéspedes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {guests}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setGuests(guests + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleReserve}>
                    Reservar
                  </Button>

                  {checkIn && checkOut && (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          ${property.price} x{" "}
                          {Math.ceil(
                            (checkOut - checkIn) / (1000 * 60 * 60 * 24)
                          )}{" "}
                          noches
                        </span>
                        <span className="font-semibold">
                          ${calculateTotal()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tarifa de servicio
                        </span>
                        <span className="font-semibold">
                          ${Math.round(calculateTotal() * 0.1)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>
                          $
                          {calculateTotal() +
                            Math.round(calculateTotal() * 0.1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
