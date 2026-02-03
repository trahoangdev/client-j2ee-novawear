import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { NewArrivals } from '@/components/home/NewArrivals';
import { PromoBanner } from '@/components/home/PromoBanner';
import { Features } from '@/components/home/Features';

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroCarousel />
        <Features />
        <CategoryGrid />
        <FeaturedProducts />
        <PromoBanner />
        <NewArrivals />
      </main>

      <Footer />
    </div>
  );
}
