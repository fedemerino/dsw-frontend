import { PropertyCard } from '@/components/home/propertyCard';
import { getFeaturedListings } from '@/lib/api';
import { useEffect, useState } from 'react';

// const properties = [
//   {
//     id: 1,
//     title: 'Apartamento moderno en el centro',
//     location: 'Madrid, España',
//     image: '/modern-apartment.png',
//     price: 89,
//     rating: 4.8,
//     reviews: 124,
//     beds: 2,
//     baths: 1,
//     type: 'Apartamento completo',
//   },
//   {
//     id: 2,
//     title: 'Villa con vistas al mar',
//     location: 'Barcelona, España',
//     image: '/luxury-villa-ocean-view.jpg',
//     price: 245,
//     rating: 4.9,
//     reviews: 89,
//     beds: 4,
//     baths: 3,
//     type: 'Villa completa',
//   },
//   {
//     id: 3,
//     title: 'Estudio acogedor cerca de la playa',
//     location: 'Valencia, España',
//     image: '/cozy-beach-studio.jpg',
//     price: 65,
//     rating: 4.7,
//     reviews: 156,
//     beds: 1,
//     baths: 1,
//     type: 'Estudio',
//   },
//   {
//     id: 4,
//     title: 'Casa rural con jardín',
//     location: 'Sevilla, España',
//     image: '/rustic-house-garden.jpg',
//     price: 120,
//     rating: 4.9,
//     reviews: 67,
//     beds: 3,
//     baths: 2,
//     type: 'Casa completa',
//   },
//   {
//     id: 5,
//     title: 'Loft industrial renovado',
//     location: 'Bilbao, España',
//     image: '/industrial-loft-interior.jpg',
//     price: 95,
//     rating: 4.6,
//     reviews: 98,
//     beds: 2,
//     baths: 1,
//     type: 'Loft',
//   },
//   {
//     id: 6,
//     title: 'Penthouse con terraza panorámica',
//     location: 'Málaga, España',
//     image: '/penthouse-terrace-view.jpg',
//     price: 180,
//     rating: 5.0,
//     reviews: 45,
//     beds: 3,
//     baths: 2,
//     type: 'Penthouse',
//   },
// ];

export const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const propertiesData = await getFeaturedListings();
      console.log(propertiesData);
      setProperties(propertiesData);
    };
    fetchData();
  }, []);
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Alojamientos destacados
          </h2>
          <p className="text-lg text-muted-foreground">
            Propiedades populares seleccionadas para ti
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};
