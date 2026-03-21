import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Tag, Sparkles, ArrowRight, Loader2, Check, ExternalLink } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { bundlesApi, productsApi } from '@/lib/customerApi';
import { formatCurrency, cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { toast } from '@/lib/toast';
import { SEO } from '@/components/SEO';
import type { BundleDto } from '@/types/api';
import type { Product } from '@/types';
import { productDtoToDisplay } from '@/lib/productUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function BundlesPage() {
  const [bundles, setBundles] = useState<BundleDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bundlesApi
      .list()
      .then(({ data }) => setBundles(data.filter(b => b.active)))
      .catch(() => toast.error('Lỗi tải danh sách combo'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <SEO title="Combo & Set ưu đãi | NovaWear" />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Page heading */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-bold mb-6 shadow-sm ring-1 ring-orange-200 dark:ring-orange-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
            BỘ SƯU TẬP COMBO CAO CẤP
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Mua theo Combo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Tiết kiệm tối đa</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            Phí giao hàng quá cao? Đừng lo. Chọn các bộ sản phẩm được NovaWear phối sẵn với mức giá cực hời và phong cách sành điệu nhất.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[28rem] rounded-3xl bg-card border border-border shadow-sm animate-pulse" />
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Chưa có Combo nào</h3>
            <p className="text-muted-foreground">Các Combo ưu đãi đang được cập nhật. Bạn hãy quay lại sau nhé!</p>
            <Button asChild className="mt-8 rounded-xl" size="lg">
              <Link to="/shop">Khám phá sản phẩm lẻ</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {bundles.map((bundle, idx) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <BundleCard bundle={bundle} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function BundleCard({ bundle }: { bundle: BundleDto }) {
  const [adding, setAdding] = useState(false);
  const { addItem, toggleCart } = useCart();

  const handleAddAllToCart = async () => {
    try {
      setAdding(true);
      // Fetch full products to add to cart properly
      const promises = bundle.items.map(bi => productsApi.getById(bi.productId));
      const responses = await Promise.all(promises);
      
      let addedCount = 0;
      responses.forEach((res, index) => {
        const product = res.data;
        // Auto pick first available size and color
        const displayProduct = productDtoToDisplay(product);
        const defaultSize = displayProduct.sizes && displayProduct.sizes.length > 0 ? displayProduct.sizes[0] : 'FreeSize';
        const defaultColor = displayProduct.colors && displayProduct.colors.length > 0 ? displayProduct.colors[0] : { name: 'Mặc định', hex: '#000000' };
        const bundleItemQuantity = bundle.items[index]?.quantity || 1;
        
        addItem(displayProduct as unknown as Product, bundleItemQuantity, defaultSize, defaultColor);
        addedCount += bundleItemQuantity;
      });
      
      toast.success(`Đã thêm ${addedCount} sản phẩm từ Combo vào giỏ hàng`);
      toggleCart();
    } catch (e) {
      toast.error('Có lỗi xảy ra khi thêm Combo vào giỏ hàng');
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-card rounded-[2rem] border border-border/60 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full transform hover:-translate-y-1">
      {/* Bundle Badge */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 items-end">
        <div className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-2xl shadow-lg font-black text-sm uppercase tracking-wide">
          <Tag className="w-4 h-4 fill-white flex-shrink-0" />
          Tiết kiệm {bundle.discountPercent}%
        </div>
      </div>

      {/* Hero Image Container */}
      <div className="relative w-full pt-[55%] bg-muted/30 overflow-hidden">
        {bundle.imageUrl ? (
          <img
            src={bundle.imageUrl}
            alt={bundle.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <Package className="w-20 h-20 text-indigo-200/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
          <div className="text-white">
            <h3 className="font-black text-2xl mb-1">{bundle.name}</h3>
            {bundle.description && (
              <p className="text-white/80 font-medium line-clamp-2 text-sm max-w-[90%]">{bundle.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/60">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-muted-foreground">Giá gói Combo</p>
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl font-black text-destructive leading-none">{formatCurrency(bundle.bundlePrice)}</span>
              <span className="text-lg font-medium text-muted-foreground line-through decoration-2 decoration-muted-foreground/30 mb-0.5">{formatCurrency(bundle.totalOriginalPrice)}</span>
            </div>
          </div>
        </div>

        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Danh sách sản phẩm ({bundle.items?.length || 0})</h4>
        
        <div className="space-y-4 mb-6 flex-1">
          {bundle.items?.map((item, i) => (
            <div key={item.id} className="group/item flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/60">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/50">
                {item.productImage ? (
                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-foreground text-background text-xs font-bold rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                  x{item.quantity}
                </div>
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <Link to={`/product/${item.productSlug}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 mb-1">
                  {item.productName}
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">{formatCurrency(item.productPrice)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2" 
          onClick={handleAddAllToCart}
          disabled={adding}
        >
          {adding ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Đang thêm vào giỏ...</>
          ) : (
            <><ShoppingCart className="w-5 h-5" /> Thêm toàn bộ vào giỏ hàng</>
          )}
        </Button>
      </div>
    </div>
  );
}
