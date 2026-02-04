import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { productsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';

export function BestsellerProducts() {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .bestseller()
      .then(({ data }) => {
        const list = (data ?? []).map(productDtoToDisplay).slice(0, 4);
        if (list.length > 0) {
          setProducts(list);
        } else {
          productsApi.list({ size: 8 }).then(({ data: page }) => setProducts((page?.content ?? []).map(productDtoToDisplay).slice(0, 4)));
        }
      })
      .catch(() => {
        productsApi.list({ size: 8 }).then(({ data }) => setProducts((data?.content ?? []).map(productDtoToDisplay).slice(0, 4))).catch(() => setProducts([]));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-spacing bg-muted/30" aria-labelledby="bestseller-heading">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2 id="bestseller-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5">
              Sản Phẩm Bán Chạy
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Được khách hàng lựa chọn nhiều nhất
            </p>
          </div>
          <Button variant="link" className="text-primary p-0 h-auto font-medium w-fit" asChild>
            <Link to="/bestseller" className="inline-flex items-center gap-2 group">
              Xem tất cả
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-8 text-center">Chưa có sản phẩm bán chạy. Quay lại sau nhé!</p>
        )}
      </div>
    </section>
  );
}
