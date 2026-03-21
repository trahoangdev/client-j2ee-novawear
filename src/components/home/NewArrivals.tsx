import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { productsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';
import { motion } from 'framer-motion';

export function NewArrivals() {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .list({ size: 8, isNew: true })
      .then(({ data }) => setProducts(data.content.map(productDtoToDisplay).slice(0, 8)))
      .catch((error) => console.error("Error fetching new arrivals", error))
      .finally(() => setLoading(false));
  }, []);

  if (products.length === 0 && !loading) return null;

  return (
    <section className="py-20 sm:py-32 bg-slate-50 dark:bg-background relative overflow-hidden" aria-labelledby="new-arrivals-heading">
      
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container px-4 sm:px-6 max-w-[90rem]">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start lg:items-center">
          
          {/* Header Block */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:w-1/3 flex-shrink-0 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 font-bold text-sm tracking-widest uppercase shadow-sm">
                <Sparkles className="h-4 w-4" /> BỘ SƯU TẬP MỚI
            </div>
            <h2 id="new-arrivals-heading" className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight drop-shadow-sm">
              Hàng Mới Về<br className="hidden sm:block" />Tuần Này.
            </h2>
            <p className="text-lg text-muted-foreground font-medium mb-8 max-w-sm">
              Cập nhật ngay những thiết kế dẫn đầu xu hướng thời trang, mang lại phong cách chuẩn mực và sự tự tin tuyệt đối.
            </p>
            <Link 
              to="/shop?isNew=true" 
              className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground h-14 px-8 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-lg hover:-translate-y-1 group relative z-10"
            >
              Khám phám ngay 
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Products Scroll Block */}
          <div className="lg:w-2/3 w-full relative z-10">
            {loading ? (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 hide-scrollbar">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[260px] sm:w-[300px] flex-shrink-0">
                    <ProductCardSkeleton />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-10 pt-4 snap-x hide-scrollbar px-1">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1, type: "spring" }}
                    className="w-[260px] sm:w-[300px] flex-shrink-0 snap-start hover:-translate-y-2 transition-transform duration-300"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
                
                {/* View More Card inside horizontal scroll */}
                {products.length >= 8 && (
                   <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="w-[200px] sm:w-[240px] flex-shrink-0 snap-center flex items-center justify-center"
                   >
                     <Link to="/shop?isNew=true" className="group flex flex-col items-center justify-center p-8 bg-card border-2 border-dashed border-border/50 hover:border-primary rounded-3xl h-[80%] w-full hover:bg-primary/5 transition-all">
                       <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary text-primary group-hover:text-primary-foreground transition-colors mb-4 scale-100 group-hover:scale-110">
                          <ArrowRight className="h-6 w-6" />
                       </div>
                       <span className="font-bold text-lg text-center">Xem toàn bộ<br/>Hàng mới về</span>
                     </Link>
                   </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
