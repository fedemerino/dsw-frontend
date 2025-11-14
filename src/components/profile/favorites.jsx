import { PropertyCard } from "@/components/shared/propertyCard";
import { useFavorites } from "@/hooks/useFavorites";

export const FavoritesPage = () => {
    const { favorites } = useFavorites();
    if (!favorites.length) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Mis Favoritos</h1>
                <p className="text-muted-foreground">No tienes favoritos guardados aún.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Mis Favoritos</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => (
                    <PropertyCard key={favorite.id} property={favorite} />
                ))}
            </div>
        </div>
    )
}