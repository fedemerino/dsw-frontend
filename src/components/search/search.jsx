import { useState, useMemo, useEffect, useCallback } from "react"
import { PropertyCard } from "../shared/propertyCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { PROPERTY_TYPES } from "@/lib/constants"
import { getAmenities, getListings } from "@/lib/api"
import debounce from "lodash/debounce"

export const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 300])
  const [minRating, setMinRating] = useState(0)
  const [selectedAmenities, setSelectedAmenities] = useState([]) // store ids
  const [sortBy, setSortBy] = useState("recommended")
  const [properties, setProperties] = useState([])
  const [amenities, setAmenities] = useState([])

  const fetchAmenities = async () => {
    try {
      const response = await getAmenities()
      setAmenities(response)
    } catch (error) {
      console.error("Error fetching amenities:", error)
    }
  }

  useEffect(() => {
    fetchAmenities()
  }, [])

  // Toggle amenity by id
  const toggleAmenity = (amenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((a) => a !== amenityId)
        : [...prev, amenityId]
    )
  }

  // Build backend filters and fetch listings
  const fetchListings = useCallback(async (overrides = {}) => {
    try {
      const filters = {
        propertyType: selectedType !== "all" ? selectedType : undefined,
        priceFrom: priceRange[0] || undefined,
        priceTo: priceRange[1] || undefined,
        ratingFrom: minRating > 0 ? minRating : undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities.join(",") : undefined,
        limit: 50,
        search: searchTerm || undefined,
        ...overrides,
      }

      // Remove undefined keys
      Object.keys(filters).forEach((k) => {
        if (filters[k] === undefined) delete filters[k]
      })

      const data = await getListings(filters)
      setProperties(data)
    } catch (error) {
      console.error("Error fetching listings:", error)
    }
  }, [selectedType, priceRange, minRating, selectedAmenities, searchTerm])

  // Debounced search to avoid calling backend on every keystroke
  const debouncedFetch = useMemo(() => debounce(fetchListings, 400), [fetchListings])

  useEffect(() => {
    // call debounced on search term changes
    debouncedFetch()
    return () => debouncedFetch.cancel()
  }, [searchTerm, selectedType, priceRange, minRating, selectedAmenities, debouncedFetch])

  // Initial load
  useEffect(() => {
    fetchListings()
  }, [])

  // Use backend properties; allow client-side sorting
  const filteredProperties = useMemo(() => {
    const list = [...properties]
    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        list.sort((a, b) => b.price - a.price)
        break
      case "rating":
        list.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }
    return list
  }, [properties, sortBy])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedType("all")
    setPriceRange([0, 300])
    setMinRating(0)
    setSelectedAmenities([])
    setSortBy("recommended")
    fetchListings()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="bg-primary py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Encuentra tu alojamiento perfecto
            </h1>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por destino o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-card"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside
              className={`lg:w-80`}
            >
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                      Filtros
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      Limpiar
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Property Type Filter */}
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Tipo de propiedad
                      </Label>
                      <Select
                        value={selectedType}
                        onValueChange={setSelectedType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">
                        Rango de precio: ${priceRange[0]} - ${priceRange[1]}
                      </Label>
                      <Slider
                        min={0}
                        max={300}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$0</span>
                        <span>$300+</span>
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Valoración mínima
                      </Label>
                      <Select
                        value={minRating.toString()}
                        onValueChange={(v) => setMinRating(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Cualquiera</SelectItem>
                          <SelectItem value="4">4+ estrellas</SelectItem>
                          <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                          <SelectItem value="4.8">4.8+ estrellas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amenities */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">
                        Servicios
                      </Label>
                      <div className="space-y-3">
                        {amenities.map((amenity) => (
                          <div
                            key={amenity.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={amenity.id}
                              checked={selectedAmenities.includes(amenity.id)}
                              onCheckedChange={() => toggleAmenity(amenity.id)}
                            />
                            <Label
                              htmlFor={amenity.id}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {amenity.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Results */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {filteredProperties.length} {filteredProperties.length === 1 ? "alojamiento" : "alojamientos"} encontrados
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recomendados</SelectItem>
                    <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                    <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                    <SelectItem value="rating">Mejor valorados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredProperties.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-lg text-muted-foreground mb-2">
                    No se encontraron alojamientos
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Intenta ajustar tus filtros para ver más resultados
                  </p>
                  <Button onClick={clearFilters}>Limpiar filtros</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
