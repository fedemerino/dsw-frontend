import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "react-router-dom"
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
import { Search, X } from "lucide-react"
import { PROPERTY_TYPES } from "@/lib/constants"
import { getAmenities, getListings } from "@/lib/api"
import debounce from "lodash/debounce"

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [amenities, setAmenities] = useState([])

  // Read from URL params
  const searchTerm = searchParams.get("search") || ""
  const selectedType = searchParams.get("type") || "all"
  const priceFrom = parseInt(searchParams.get("priceFrom") || "0")
  const priceTo = parseInt(searchParams.get("priceTo") || "300")
  const priceRange = useMemo(() => [priceFrom, priceTo], [priceFrom, priceTo])
  const minRating = parseFloat(searchParams.get("rating") || "0")
  const selectedAmenities = useMemo(() => {
    const amenitiesParam = searchParams.get("amenities")
    return amenitiesParam ? amenitiesParam.split(",").filter(Boolean) : []
  }, [searchParams])
  const sortBy = searchParams.get("sort") || "recommended"

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

  // Helper function to update URL params
  const updateSearchParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          newParams.delete(key)
        } else if (key === "priceFrom" && value === "0") {
          newParams.delete(key)
        } else if (key === "priceTo" && value === "300") {
          newParams.delete(key)
        } else if (key === "rating" && value === "0") {
          newParams.delete(key)
        } else if (key === "type" && value === "all") {
          newParams.delete(key)
        } else if (key === "sort" && value === "recommended") {
          newParams.delete(key)
        } else {
          newParams.set(key, value.toString())
        }
      })
      return newParams
    })
  }, [setSearchParams])

  // Update search term
  const handleSearchChange = (value) => {
    updateSearchParams({ search: value })
  }

  // Update property type
  const handleTypeChange = (value) => {
    updateSearchParams({ type: value })
  }

  // Update price range
  const handlePriceRangeChange = (range) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      if (range[0] > 0) {
        newParams.set("priceFrom", range[0].toString())
      } else {
        newParams.delete("priceFrom")
      }
      if (range[1] < 300) {
        newParams.set("priceTo", range[1].toString())
      } else {
        newParams.delete("priceTo")
      }
      return newParams
    })
  }

  // Update rating
  const handleRatingChange = (value) => {
    updateSearchParams({ rating: value })
  }

  // Toggle amenity by id
  const toggleAmenity = (amenityId) => {
    const newAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter((a) => a !== amenityId)
      : [...selectedAmenities, amenityId]
    updateSearchParams({
      amenities: newAmenities.length > 0 ? newAmenities.join(",") : undefined
    })
  }

  // Update sort
  const handleSortChange = (value) => {
    updateSearchParams({ sort: value })
  }

  // Build backend filters and fetch listings
  const fetchListings = useCallback(async () => {
    try {
      const filters = {
        propertyType: selectedType !== "all" ? selectedType : undefined,
        priceFrom: priceFrom > 0 ? priceFrom : undefined,
        priceTo: priceTo < 300 ? priceTo : undefined,
        ratingFrom: minRating > 0 ? minRating : undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities.join(",") : undefined,
        limit: 50,
        search: searchTerm || undefined,
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
  }, [selectedType, priceFrom, priceTo, minRating, selectedAmenities, searchTerm])

  // Debounced search to avoid calling backend on every keystroke
  const debouncedFetch = useMemo(() => debounce(fetchListings, 400), [fetchListings])

  // Track if this is the initial mount
  const isInitialMount = useRef(true)

  useEffect(() => {
    // On initial mount, execute immediately
    if (isInitialMount.current) {
      isInitialMount.current = false
      fetchListings()
      return
    }
    // For subsequent changes, use debounce
    debouncedFetch()
    return () => debouncedFetch.cancel()
  }, [searchTerm, selectedType, priceFrom, priceTo, minRating, selectedAmenities, debouncedFetch, fetchListings])

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
    setSearchParams({})
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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                        onValueChange={handleTypeChange}
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
                        onValueChange={handlePriceRangeChange}
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
                        onValueChange={handleRatingChange}
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
                <Select value={sortBy} onValueChange={handleSortChange}>
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
