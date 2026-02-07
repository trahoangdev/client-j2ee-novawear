import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BestsellerProducts } from '@/components/home/BestsellerProducts';
import { NewArrivals } from '@/components/home/NewArrivals';
import { PromoBanner } from '@/components/home/PromoBanner';
import { Features } from '@/components/home/Features';
import { GenderSection } from '@/components/home/GenderSection';

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroCarousel />
        <Features />
        <CategoryGrid />
        <GenderSection
          gender="MALE"
          title="Thời Trang Nam"
          subtitle="Phong cách lịch lãm, hiện đại cho phái mạnh"
        />
        <GenderSection
          gender="FEMALE"
          title="Thời Trang Nữ"
          subtitle="Duyên dáng, thanh lịch cho phái đẹp"
          bgClass="bg-muted/30"
        />
        <FeaturedProducts />
        <BestsellerProducts />
        <PromoBanner />
        <NewArrivals />
      </main>

      <Footer />
    </div>
  );
}
