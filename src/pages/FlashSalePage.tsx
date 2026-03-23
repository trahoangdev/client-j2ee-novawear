import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { flashSalesApi } from '@/lib/customerApi';
import { SEO } from '@/components/SEO';
import { productDtoToDisplay } from '@/lib/productUtils';
import type { FlashSaleDto } from '@/types/api';

export function FlashSalePage() {
  const [sales, setSales] = useState<FlashSaleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeftStr, setTimeLeftStr] = useState<Record<number, string>>({});

  useEffect(() => {
    flashSalesApi
      .getActive()
      .then(({ data }) => setSales(data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Timer logic for active flash sales
  useEffect(() => {
    if (sales.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeft: Record<number, string> = {};

      sales.forEach((sale) => {
        const endTime = new Date(sale.endTime).getTime();
        const diff = endTime - now;

        if (diff <= 0) {
          newTimeLeft[sale.id] = 'Đã kết thúc';
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          newTimeLeft[sale.id] = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
      });

      setTimeLeftStr(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [sales]);

  // Lấy danh sách sản phẩm từ tất cả flash sale đang active
  const activeProducts = sales.flatMap(sale =>
    (sale.products || []).map(p => {
      const display = productDtoToDisplay(p as any);
      // Đặt giá sale Price và original Price theo flash sale. Note: data trả về từ API có productName, originalPrice, salePrice, quantity, stock (tuỳ API).
      // Giả lập display:
      return {
        ...display,
        id: p.id.toString(), // Chú ý: trong mảng products của flashSale API nó trả về format riêng, nhưng `productDtoToDisplay` kỳ vọng `ProductDto`. 
        // Thay vì map trực tiếp, hãy gọi API `productsApi` với filter (nếu có). Hoặc ta patch tạm thời. Cần kiểm tra kỹ.
      };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <SEO title="Flash Sale | Giờ Vàng Giá Sốc | NovaWear" />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-primary/10 rounded-full mb-2">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight uppercase">
            Giờ Vàng Giá Sốc
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Nhanh tay sở hữu ngay những item hot nhất với mức giá không tưởng. Số lượng có hạn!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold mb-2">Hiện tại không có Flash Sale nào</h2>
            <p className="text-muted-foreground">Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="space-y-16">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-white dark:bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{sale.name}</h2>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded uppercase">GIẢM {sale.discountPercent}%</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base tracking-wider tabular-nums">
                      {timeLeftStr[sale.id] || "Đang tính..."}
                    </span>
                  </div>
                </div>

                {/* Chú ý: FlashSaleDto.products chứa {id, productId, productName, originalPrice, salePrice, quantity, soldCount, imageUrl} 
                    Nó không phải ProductDto đầy đủ, nên ta cần map cẩn thận để truyền cho ProductCard */}
                {(!sale.products || sale.products.length === 0) ? (
                  <p className="text-center py-6 text-muted-foreground text-sm">Sale này hiện chưa có sản phẩm nào.</p>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {sale.products.map((item: any) => {
                      // Patch to match ProductDisplay expected by ProductCard
                      const fakeDisplay = {
                        id: String(item.productId),
                        name: item.productName,
                        slug: item.productSlug || item.productId.toString(),
                        price: item.salePrice, // Giá hiện tại
                        originalPrice: item.originalPrice, // Giá cũ
                        description: '',
                        images: item.productImage ? [item.productImage] : [],
                        colors: [],
                        sizes: [],
                        category: '',
                        inStock: item.quantity > item.soldCount,
                        isNew: false,
                        isFlashSale: true,
                        salePct: sale.discountPercent,
                      };

                      return (
                        <ProductCard key={item.id} product={fakeDisplay as any} />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
