import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { useViewedProducts } from '@/context/ViewedProductsContext';
import { productsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';
import { toast } from '@/lib/toast';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';

function formatViewedAt(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Vừa xem';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return new Date(timestamp).toLocaleDateString('vi-VN');
}

export function ViewedProductsPage() {
  const { items, clearAll, removeViewed, loading: contextLoading } = useViewedProducts();
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const numericIds = items
      .map((item) => {
        const n = parseInt(item.product.id, 10);
        return Number.isNaN(n) ? null : n;
      })
      .filter((n): n is number => n !== null);

    if (numericIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    Promise.all(numericIds.map((id) => productsApi.getById(id)))
      .then((responses) => {
        const fetched = responses.map((r) => productDtoToDisplay(r.data));
        // Sort by viewedAt descending (most recent first)
        const fetchedMap = new Map(fetched.map((p) => [p.id, p]));
        const sorted = items
          .map((item) => fetchedMap.get(item.product.id))
          .filter((p): p is ProductDisplay => p !== undefined);
        setProducts(sorted);
      })
      .catch(() => {
        setProducts([]);
        toast.error('Không tải được lịch sử xem. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  }, [items]);

  const handleClearAll = () => {
    clearAll();
    toast.success('Đã xóa toàn bộ lịch sử xem');
  };

  const handleRemove = (productId: string) => {
    removeViewed(productId);
    toast.success('Đã xóa khỏi lịch sử xem');
  };

  const isLoading = loading || contextLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Đã Xem"
        description="Xem lại những sản phẩm bạn đã xem tại NOVAWEAR."
        url="/da-xem"
        noindex
      />
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Eye className="h-8 w-8 text-muted-foreground" />
              Đã xem
            </h1>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Xóa tất cả
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              <Eye className="h-14 w-14 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-foreground mb-1">Chưa có sản phẩm nào được xem</p>
              <p className="text-sm mb-6">Hãy khám phá cửa hàng và xem chi tiết sản phẩm bạn quan tâm.</p>
              <Button asChild>
                <Link to="/shop">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Khám phá cửa hàng
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6 font-medium">
                Bạn đã xem {products.length} sản phẩm
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => {
                  const item = items.find((i) => i.product.id === product.id);
                  return (
                    <div key={product.id} className="relative group">
                      {item && (
                        <p className="text-[10px] text-muted-foreground text-right mb-1 pr-1">
                          {formatViewedAt(item.viewedAt)}
                        </p>
                      )}
                      {/* Remove button overlay */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          'absolute top-6 right-6 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border/50',
                          'opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-destructive/10',
                          'flex items-center justify-center'
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(product.id);
                        }}
                        aria-label="Xóa khỏi lịch sử xem"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                      <ProductCard product={product} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
