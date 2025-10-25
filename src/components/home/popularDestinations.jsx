import { Card, CardContent } from '@/components/ui/card';
import { getPopularDestinations } from '@/lib/api';
import { useState, useEffect } from 'react';

export function PopularDestinations() {
  const [popularDestinations, setPopularDestinations] = useState([]);
  useEffect(() => {
    const fetchPopularDestinations = async () => {
      const destinations = await getPopularDestinations();
      setPopularDestinations(destinations);
    };
    fetchPopularDestinations();
  }, []);
  return (
    <section className="px-4 py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Destinos populares
          </h2>
          <p className="text-lg text-muted-foreground">
            Explora las ciudades más visitadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDestinations.map((destination) => (
            <Card
              key={destination.name}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-border"
            >
              <div className="relative overflow-hidden aspect-[3/4]">
                <img
                  src={destination.imageUrl || '/placeholder.svg'}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">
                    {destination.name}
                  </h3>
                  <p className="text-sm text-white/90">
                    {destination.properties}
                  </p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
