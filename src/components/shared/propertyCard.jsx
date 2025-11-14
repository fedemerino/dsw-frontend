import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Bed, Bath, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useFavorites } from "@/hooks/useFavorites"

export function PropertyCard({ property }) {
  const { toggleFavorite, isFavorite } = useFavorites()
  
  const handleFavClick = (event) => {
    event.stopPropagation()
    event.preventDefault()
    toggleFavorite(property.id)
  }

  return (
    <Link to={`/listing/${property.id}`} className="no-underline">
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-border">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={property.image || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 rounded-full bg-card/90 hover:bg-card"
            onClick={handleFavClick}
          >
            <Heart
              className="h-4 w-4"
              strokeOpacity="0.5"
              fill={isFavorite(property.id) ? "red" : "none"}
            />
          </Button>
          <Badge className="absolute top-3 left-3 bg-card/90 text-foreground border-0">
            {property.type}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1">
                {property.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {property.location}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold text-sm text-foreground">
                {property.rating}
              </span>
              <span className="text-xs text-muted-foreground">
                ({property.reviews})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.beds} camas</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.baths} baños</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <span className="text-2xl font-bold text-foreground">
                ${property.price}
              </span>
              <span className="text-sm text-muted-foreground"> / noche</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
