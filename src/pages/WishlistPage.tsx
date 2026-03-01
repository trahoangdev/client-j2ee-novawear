import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from '@/lib/toast';
import { productsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';
import { SEO } from '@/components/SEO';

export function WishlistPage() {
  const { itemIds } = useWishlist();
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (itemIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const numericIds = itemIds.map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n));
    Promise.all(numericIds.map((id) => productsApi.getById(id)))
      .then((responses) => {
        setProducts(responses.map((r) => productDtoToDisplay(r.data)));
      })
      .catch(() => {
        setProducts([]);
        toast.error('Không tải được danh sách yêu thích. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  }, [itemIds]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Yêu Thích" description="Sản phẩm yêu thích của bạn tại NOVAWEAR." url="/wishlist" noindex />
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container px-4 sm:px-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2">
            <Heart className="h-8 w-8 text-destructive fill-destructive" />
            Yêu thích
          </h1>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              <Heart className="h-14 w-14 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-foreground mb-1">Chưa có sản phẩm yêu thích</p>
              <p className="text-sm mb-6">Thêm sản phẩm từ cửa hàng để xem tại đây.</p>
              <Button asChild>
                <Link to="/shop">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Khám phá cửa hàng
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
