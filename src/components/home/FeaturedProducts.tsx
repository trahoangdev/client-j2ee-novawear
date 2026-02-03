import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/data/mock-data';

export function FeaturedProducts() {
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);

  return (
    <section className="section-spacing bg-muted/30" aria-labelledby="featured-heading">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2 id="featured-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Những thiết kế được yêu thích nhất trong tuần
            </p>
          </div>
          <Button variant="link" className="text-primary p-0 h-auto font-medium w-fit" asChild>
            <Link to="/shop" className="inline-flex items-center gap-2 group">
              Xem tất cả
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
