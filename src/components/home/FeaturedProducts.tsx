import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/data/mock-data';

export function FeaturedProducts() {
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-muted-foreground">
              Những thiết kế được yêu thích nhất trong tuần
            </p>
          </div>
          <Button variant="link" className="text-primary p-0 h-auto" asChild>
            <Link to="/shop" className="flex items-center gap-2">
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
