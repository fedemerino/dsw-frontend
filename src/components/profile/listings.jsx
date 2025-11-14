import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/components/auth/authContext"
import { getUserListings } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Pencil, Eye, Plus, Loader2, MapPin, Star } from "lucide-react"
import { toast } from "sonner"

export function ListingsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login")
    }
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    const loadListings = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const userListings = await getUserListings()
        setListings(userListings)
      } catch (error) {
        console.error("Error loading listings:", error)
        toast.error("Error al cargar tus publicaciones")
        setListings([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      loadListings()
    }
  }, [isAuthenticated])

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Mis publicaciones</h1>
            </div>
            <p className="text-muted-foreground">Gestiona tus propiedades publicadas</p>
          </div>
          <Button asChild>
            <Link to="/publish">
              <Plus className="mr-2 h-4 w-4" />
              Nueva publicación
            </Link>
          </Button>
        </div>

        {listings.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tienes publicaciones aún</h3>
            <p className="text-muted-foreground mb-6">
              Empieza a ganar dinero publicando tu primera propiedad
            </p>
            <Button asChild>
              <Link to="/publish">
                <Plus className="mr-2 h-4 w-4" />
                Publicar propiedad
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-row gap-0 pl-6">
                    <div className="hidden md:flex relative w-40 md:w-64 flex-shrink-0 bg-muted self-stretch">
                      <img
                        src={
                          (Array.isArray(listing.images) && listing.images.length > 0
                            ? typeof listing.images[0] === "string"
                              ? listing.images[0]
                              : listing.images[0]?.url
                            : null) || listing.image || "/placeholder.svg"
                        }
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                    <div className="p-4 md:p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 mr-4">
                          <h3 className="text-xl font-bold text-foreground mb-1">{listing.title || "Sin título"}</h3>
                          <div className="flex items-center text-muted-foreground text-sm mb-2">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {listing.city?.name || listing.address || "Ubicación no disponible"}
                            </span>
                          </div>
                          {listing.propertyType && (
                            <Badge variant="secondary">{listing.propertyType}</Badge>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-primary">
                            ${listing.pricePerNight || listing.price || "0"}
                          </p>
                          <p className="text-sm text-muted-foreground">por noche</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valoración</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <p className="font-semibold">{listing.averageRating?.toFixed(1) || listing.rating || "0.0"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reseñas</p>
                          <p className="font-semibold">{listing.reviewsCount || listing.reviews?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Habitaciones</p>
                          <p className="font-semibold">
                            {listing.beds || 0} camas, {listing.bathrooms || listing.baths || 0} baños
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link to={`/listing/${listing.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver página
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link to={`/profile/listings/${listing.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
