import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Calendar,
  MapPin,
  Search,
  Users,
  Check,
  CalendarIcon,
} from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { getDestinations } from "@/lib/api"
import { debounce } from "lodash"
import { format } from "date-fns"
import { Calendar as DatePicker } from "@/components/ui/calendar"
import Calendar07 from "@/components/calendar-07"

export const SearchSection = () => {
  const navigate = useNavigate()
  const [destination, setDestination] = useState(null)
  const [guests, setGuests] = useState("2")
  const [openDest, setOpenDest] = useState(false)
  const [destinations, setDestinations] = useState([])
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  })

  const fetchDestinations = debounce(async (query) => {
    if (!query) return
    const data = await getDestinations(query.name)
    console.log(data)
    setDestinations(data)
  }, 500)

  useEffect(() => {
    if (destination) {
      fetchDestinations(destination)
    } else {
      setDestinations([])
    }
  }, [destination])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination) params.set("destination", destination.id) // Enviar el ID de la ciudad
    if(dateRange.from){
      params.set("checkIn", format(dateRange.from, "yyyy-MM-dd"))
    }
    if(dateRange.to){
      params.set("checkOut", format(dateRange.to, "yyyy-MM-dd"))
    }
    if (guests) params.set("guests", guests)
    navigate(`/search?${params.toString()}`)
  }

  function handleGuestChange(value) {
    if (value < 1) {
      setGuests("1")
    } else if (value > 20) {
      setGuests("20")
    } else {
      setGuests(value)
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-24 px-4">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Encuentra tu alojamiento perfecto
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Descubre millones de propiedades en toda Argentina
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="max-w-5xl mx-auto bg-card rounded-xl shadow-lg p-4 md:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Destino
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Popover open={openDest} onOpenChange={setOpenDest}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDest}
                      className="w-full justify-between h-12 pl-10 font-normal overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      {destination
                        ? `${destination.name}${
                            destination?.province
                              ? `, ${destination.province}`
                              : ""
                          }`
                        : "¿A dónde vas?"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-72" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Buscar ciudad..."
                        value={destination?.name || ""}
                        onValueChange={(value) =>
                          setDestination({ name: value })
                        }
                      />
                      <CommandEmpty>No se encontraron ciudades.</CommandEmpty>
                      <CommandList>
                        <CommandGroup heading="">
                          {destinations.map((city) => (
                            <CommandItem
                              key={city.id}
                              value={city.name}
                              onSelect={() => {
                                setDestination(city)
                                setOpenDest(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  destination?.id === city.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {`${city.name}, ${city.province}`}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Fechas
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12 font-normal overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(
                          dateRange.to,
                          "dd/MM/yyyy"
                        )}`
                      : "Selecciona un rango de fechas"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar07
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Huéspedes
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="2"
                  value={guests}
                  onChange={(e) => handleGuestChange(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-6 h-12 text-base font-semibold"
          >
            <Search className="mr-2 h-5 w-5" />
            Buscar alojamientos
          </Button>
        </form>
      </div>
    </section>
  )
}
