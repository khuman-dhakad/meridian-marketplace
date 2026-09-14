import { getCategories, getFeaturedListings, getLocations } from "@/lib/data/repository";
import { HeroSearch } from "@/components/search/HeroSearch";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { FeaturedListings } from "@/components/listings/FeaturedListings";
import { LocationGrid } from "@/components/locations/LocationGrid";
import { TrustSafetySection } from "@/components/home/TrustSafetySection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export default async function HomePage() {
  const [categories, featuredListings, locations] = await Promise.all([
    getCategories(),
    getFeaturedListings(8),
    getLocations(),
  ]);

  return (
    <>
      {/* Hero & Primary Search UI */}
      <HeroSearch />

      {/* Category Discovery Grid */}
      <CategoryGrid categories={categories} />

      {/* Featured / VIP Verified Classifieds */}
      <FeaturedListings initialListings={featuredListings} />

      {/* Geographic / Location Discovery */}
      <LocationGrid locations={locations} />

      {/* Platform Trust & Safety Standards */}
      <TrustSafetySection />

      {/* Final Conversion CTA Banner */}
      <FinalCtaSection />
    </>
  );
}
