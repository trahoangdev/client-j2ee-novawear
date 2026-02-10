import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { productsApi } from '@/lib/customerApi';
import { toast } from '@/lib/toast';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';

export function NewArrivals() {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .list({ size: 8, isNew: true })
      .then(({ data }) => setProducts(data.content.map(productDtoToDisplay).slice(0, 4)))
      .catch(() => {
        setProducts([]);
        toast.error('Không tải được hàng mới về');
      })
      .finally(() => setLoading(false));
  }, []);

  if (products.length === 0 && !loading) return null;

  return (
    <section className="section-spacing" aria-labelledby="new-arrivals-heading">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <Badge variant="secondary" className="mb-2.5 gap-1 text-xs font-medium">
              <Sparkles className="h-3 w-3" />
              Mới về
            </Badge>
            <h2 id="new-arrivals-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5">
              Hàng Mới Về
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Cập nhật những mẫu thiết kế mới nhất từ NOVAWEAR
            </p>
          </div>
          <Button variant="link" className="text-primary p-0 h-auto font-medium w-fit" asChild>
            <Link to="/new-arrivals" className="inline-flex items-center gap-2 group">
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
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
