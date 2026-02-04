import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { productsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';

export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .featured()
      .then(({ data }) => setProducts((data ?? []).map(productDtoToDisplay).slice(0, 4)))
      .catch(() => {
        productsApi.list({ size: 8 }).then(({ data }) => setProducts(data.content.map(productDtoToDisplay).slice(0, 4)));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section-spacing bg-muted/30" aria-labelledby="featured-heading">
        <div className="container px-4 sm:px-6">
          <h2 id="featured-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-8">
            Sản Phẩm Nổi Bật
          </h2>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
