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
import { FlashSaleBanner } from '@/components/home/FlashSaleBanner';
import { SEO, buildWebSiteLD, buildOrganizationLD } from '@/components/SEO';

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        url="/"
        description="NOVAWEAR - Thời trang nam nữ cao cấp. Mua sắm online quần áo, phụ kiện, giày dép với giá tốt nhất. Miễn phí vận chuyển cho đơn từ 200K."
        keywords="thời trang, quần áo, novawear, mua sắm online, thời trang nam, thời trang nữ"
        jsonLd={[buildWebSiteLD(), buildOrganizationLD()]}
      />
      <Header />

      <main className="flex-1">
        <HeroCarousel />
        <Features />
        <FlashSaleBanner />
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
