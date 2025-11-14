import { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useAuth } from "@/components/auth/authContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { PROPERTY_TYPES } from "@/lib/constants"
import {
  getPropertyById,
  updateListing,
  getAmenities,
  getDestinations,
  getPaymentMethods,
  getImageUploadUrl,
} from "@/lib/api"
import { Building2, Upload, MapPin, Check, X, Loader2, Star, User } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { debounce } from "lodash"

export function EditListingPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { isAuthenticated, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [amenities, setAmenities] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [city, setCity] = useState(null)
  const [cities, setCities] = useState([])
  const [openCity, setOpenCity] = useState(false)
  const [uploadingImages, setUploadingImages] = useState({})
  const [property, setProperty] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    cityId: "",
    propertyType: "",
    pricePerNight: "",
    rooms: "",
    bathrooms: "",
    beds: "",
    maxGuests: "",
    petFriendly: false,
    amenities: [],
    listingPaymentMethods: [],
    images: [],
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  // Load property data and form options
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !params.id) return

      setIsLoading(true)
      try {
        const [propertyData, amenitiesData, paymentMethodsData] = await Promise.all([
          getPropertyById(params.id),
          getAmenities(),
          getPaymentMethods(),
        ])

        setProperty(propertyData)
        setAmenities(amenitiesData)
        setPaymentMethods(paymentMethodsData)

        // Set city if property has city data
        if (propertyData.city) {
          setCity(propertyData.city)
        }

        // Populate form with existing data
        setFormData({
          title: propertyData.title || "",
          description: propertyData.description || "",
          address: propertyData.address || "",
          cityId: propertyData.city?.id || propertyData.cityId || "",
          propertyType: propertyData.propertyType || "",
          pricePerNight: propertyData.pricePerNight?.toString() || propertyData.price?.toString() || "",
          rooms: propertyData.rooms?.toString() || "",
          bathrooms: propertyData.bathrooms?.toString() || propertyData.baths?.toString() || "",
          beds: propertyData.beds?.toString() || "",
          maxGuests: propertyData.maxGuests?.toString() || "",
          petFriendly: propertyData.petFriendly || false,
          amenities: propertyData.amenities?.map((a) => (typeof a === "object" ? a.id : a)) || [],
          listingPaymentMethods:
            propertyData.listingPaymentMethods?.map((p) => (typeof p === "object" ? p.id : p)) || [],
          images: propertyData.images?.map((img) => (typeof img === "object" ? img.url : img)) || [],
        })
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar los datos de la propiedad")
        navigate("/profile/listings")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, params.id, navigate])

  const fetchDestinations = useMemo(
    () =>
      debounce(async (query) => {
        if (!query || query.length < 2) {
          setCities([])
          return
        }
        try {
          const data = await getDestinations(query)
          setCities(data)
        } catch (error) {
          console.error("Error fetching cities:", error)
          setCities([])
        }
      }, 500),
    []
  )

  useEffect(() => {
    if (city?.name) {
      fetchDestinations(city.name)
    } else {
      setCities([])
    }
  }, [city, fetchDestinations])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenityId) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }))
  }

  const handlePaymentMethodToggle = (methodId) => {
    setFormData((prev) => ({
      ...prev,
      listingPaymentMethods: prev.listingPaymentMethods.includes(methodId)
        ? prev.listingPaymentMethods.filter((m) => m !== methodId)
        : [...prev.listingPaymentMethods, methodId],
    }))
  }

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity)
    handleInputChange("cityId", selectedCity.id)
    setOpenCity(false)
  }

  const uploadImageToCloudinary = async (file) => {
    try {
      const uploadData = await getImageUploadUrl()

      const formDataCloudinary = new FormData()
      formDataCloudinary.append("file", file)
      formDataCloudinary.append("signature", uploadData.signature)
      formDataCloudinary.append("api_key", uploadData.apiKey)
      formDataCloudinary.append("timestamp", uploadData.timestamp)
      formDataCloudinary.append("folder", uploadData.folder)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${uploadData.cloudName}/image/upload`, {
        method: "POST",
        body: formDataCloudinary,
        credentials: "omit",
      })

      if (!response.ok) {
        throw new Error("Failed to upload image to Cloudinary")
      }

      const responseData = await response.json()
      return responseData.secure_url
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error)
      throw error
    }
  }

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target?.files || [])
    if (files.length === 0) return

    await processFiles(files)

    if (e.target && e.target.value) {
      e.target.value = ""
    }
  }

  const processFiles = async (files) => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} no es una imagen válida`)
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} es demasiado grande (máximo 5MB)`)
        continue
      }

      const imageId = Date.now() + Math.random().toString(36).substr(2, 9)
      setUploadingImages((prev) => ({ ...prev, [imageId]: true }))

      try {
        const imageUrl = await uploadImageToCloudinary(file)
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }))
        toast.success(`${file.name} subida exitosamente`)
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error(`Error al subir ${file.name}. Por favor, intenta nuevamente.`)
      } finally {
        setUploadingImages((prev) => {
          const newState = { ...prev }
          delete newState[imageId]
          return newState
        })
      }
    }
  }

  const handleRemoveImage = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((url) => url !== imageUrl),
    }))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user?.email) {
      toast.error("Error: No se pudo obtener tu información de usuario")
      setIsSubmitting(false)
      return
    }

    try {
      const listingData = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        cityId: formData.cityId,
        propertyType: formData.propertyType,
        pricePerNight: parseFloat(formData.pricePerNight),
        rooms: parseInt(formData.rooms),
        bathrooms: parseInt(formData.bathrooms),
        beds: parseInt(formData.beds),
        maxGuests: parseInt(formData.maxGuests),
        petFriendly: formData.petFriendly,
        amenities: formData.amenities,
        listingPaymentMethods: formData.listingPaymentMethods,
        images: formData.images,
      }

      await updateListing(params.id, listingData)
      toast.success("¡Propiedad actualizada con éxito!")
      navigate("/profile/listings")
    } catch (error) {
      console.error("Error updating listing:", error)
      toast.error(
        error.response?.data?.message || "Error al actualizar la propiedad. Por favor, intenta nuevamente."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!property) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Editar publicación</h1>
          </div>
          <p className="text-muted-foreground">Actualiza la información de tu propiedad</p>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título de la propiedad *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Apartamento moderno en el centro"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe tu propiedad, sus características especiales y lo que la hace única..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    placeholder="Ej: Av. Corrientes 1234"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Popover open={openCity} onOpenChange={setOpenCity}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCity}
                          className="w-full justify-between h-10 font-normal"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {city
                              ? `${city.name}${city.province ? `, ${city.province}` : ""}`
                              : "Buscar ciudad..."}
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-full" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Buscar ciudad..."
                            value={city?.name || ""}
                            onValueChange={(value) => setCity({ name: value })}
                          />
                          <CommandEmpty>No se encontraron ciudades.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {cities.map((cityOption) => (
                                <CommandItem
                                  key={cityOption.id}
                                  value={cityOption.name}
                                  onSelect={() => handleCitySelect(cityOption)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      city?.id === cityOption.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {`${cityOption.name}, ${cityOption.province}`}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="type">Tipo de propiedad *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => handleInputChange("propertyType", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la propiedad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pricePerNight">Precio por noche ($) *</Label>
                    <Input
                      id="pricePerNight"
                      type="number"
                      placeholder="89"
                      value={formData.pricePerNight}
                      onChange={(e) => handleInputChange("pricePerNight", e.target.value)}
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rooms">Número de habitaciones *</Label>
                    <Input
                      id="rooms"
                      type="number"
                      placeholder="2"
                      value={formData.rooms}
                      onChange={(e) => handleInputChange("rooms", e.target.value)}
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Número de baños *</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      placeholder="1"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="beds">Número de camas *</Label>
                    <Input
                      id="beds"
                      type="number"
                      placeholder="2"
                      value={formData.beds}
                      onChange={(e) => handleInputChange("beds", e.target.value)}
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxGuests">Huéspedes máximos *</Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      placeholder="4"
                      value={formData.maxGuests}
                      onChange={(e) => handleInputChange("maxGuests", e.target.value)}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Checkbox
                    id="petFriendly"
                    checked={formData.petFriendly}
                    onCheckedChange={(checked) => handleInputChange("petFriendly", checked)}
                  />
                  <Label htmlFor="petFriendly" className="cursor-pointer font-normal">
                    Acepta mascotas
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Servicios y comodidades *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.id}
                        checked={formData.amenities.includes(amenity.id)}
                        onCheckedChange={() => handleAmenityToggle(amenity.id)}
                      />
                      <Label htmlFor={amenity.id} className="cursor-pointer font-normal">
                        {amenity.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.amenities.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selecciona al menos un servicio
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Métodos de pago *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-start space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={method.id}
                        checked={formData.listingPaymentMethods.includes(method.id)}
                        onCheckedChange={() => handlePaymentMethodToggle(method.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="cursor-pointer font-medium">
                          {method.name}
                        </Label>
                        {method.description && (
                          <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {formData.listingPaymentMethods.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selecciona al menos un método de pago
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Fotos de la propiedad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Arrastra y suelta tus fotos aquí</p>
                    <p className="text-sm text-muted-foreground mb-4">o</p>
                    <Button type="button" variant="outline" onClick={(e) => e.stopPropagation()}>
                      Seleccionar archivos
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      Sube al menos 5 fotos de alta calidad (máximo 5MB por imagen)
                    </p>
                  </div>

                  {/* Image Previews */}
                  {(formData.images.length > 0 || Object.keys(uploadingImages).length > 0) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Images uploaded */}
                      {formData.images.map((imageUrl, index) => (
                        <div
                          key={imageUrl}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={imageUrl}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <Badge className="absolute top-2 left-2" variant="secondary">
                              Principal
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(imageUrl)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* Uploading placeholders */}
                      {Object.keys(uploadingImages).map((imageId) => (
                        <div
                          key={imageId}
                          className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center"
                        >
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="absolute bottom-2 left-2 right-2 text-xs text-muted-foreground text-center">
                            Subiendo...
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image count */}
                  {formData.images.length > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      {formData.images.length}{" "}
                      {formData.images.length === 1 ? "imagen subida" : "imágenes subidas"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valoración promedio</p>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <p className="text-2xl font-bold">{property.rating || "0.0"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de reseñas</p>
                  <p className="text-2xl font-bold">{property.reviews?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reservas totales</p>
                  <p className="text-2xl font-bold">{property.bookings?.length || 0}</p>
                </div>
              </CardContent>
            </Card>

            {property.reviews && property.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reseñas recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {property.reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">
                              {review.user?.fullName || review.userName || "Usuario"}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? "fill-accent text-accent" : "text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
