import { FeaturedProperties } from "./featuredProperties";
import { PopularDestinations } from "./popularDestinations";
import { SearchSection } from "./searchSection";

export const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <SearchSection />
      <FeaturedProperties />
      <PopularDestinations />
    </div>
  );
};
