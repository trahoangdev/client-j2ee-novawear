import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/data/mock-data';

export function NewArrivals() {
  const newProducts = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Badge variant="outline" className="mb-3 gap-1">
              <Sparkles className="h-3 w-3" />
              Mới về
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Hàng Mới Về
            </h2>
            <p className="text-muted-foreground">
              Cập nhật những mẫu thiết kế mới nhất từ NOVAWEAR
            </p>
          </div>
          <Button variant="link" className="text-primary p-0 h-auto" asChild>
            <Link to="/shop?new=true" className="flex items-center gap-2">
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {newProducts.map((product) => (
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
