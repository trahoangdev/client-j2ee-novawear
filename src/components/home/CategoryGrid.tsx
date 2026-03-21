import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categoriesApi } from '@/lib/customerApi';
import { toast } from '@/lib/toast';
import type { CategoryDto } from '@/types/api';
import { cn } from '@/lib/utils';
import { CategoryGridSkeleton } from './CategoryGridSkeleton';
import { motion } from 'framer-motion';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1558769132-cb1aea913002?w=400&q=80';

export function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi
      .list()
      .then(({ data }) => setCategories(data))
      .catch(() => {
        setCategories([]);
        toast.error('Không tải được danh mục');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CategoryGridSkeleton />;
  if (categories.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-background overflow-hidden" aria-labelledby="category-heading">
      <div className="container px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div 
          className="flex flex-col md:flex-row items-end justify-between mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-xl">
            <h2 id="category-heading" className="font-display text-4xl sm:text-5xl font-black mb-4 tracking-tight drop-shadow-sm">
              Bộ Sưu Tập Nổi Bật
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl font-medium">
              Định hình phong cách với chuỗi sản phẩm chọn lọc tỉ mỉ, phù hợp mọi hoàn cảnh.
            </p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-sm mt-4 md:mt-0 group cursor-pointer">
            Xem tất cả 
            <span className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors"><ArrowRight className="w-4 h-4" /></span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {categories.slice(0, 8).map((category, index) => {
            // Mix heights to create a slight masonry-like feel
            const isFeatured = index === 0 || index === 3;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className={cn("w-full", isFeatured ? "md:col-span-2 md:row-span-2" : "")}
              >
                <Link
                  to={`/shop?categoryId=${category.id}`}
                  className="group block relative w-full h-full min-h-[250px] sm:min-h-[300px] overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-primary/25 transition-all duration-500"
                >
                  <img
                    src={category.imageUrl || PLACEHOLDER_IMAGE}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col items-center justify-end text-white transform transition-transform duration-500 z-10">
                    <span className="font-display text-2xl sm:text-3xl font-black text-center tracking-wide mb-2 group-hover:-translate-y-2 transition-transform duration-500 drop-shadow-lg">
                      {category.name.toUpperCase()}
                    </span>
                    <span className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                      Khám phá ngay <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  
                  {/* Subtle light overlay on hover */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 z-0 pointer-events-none" />
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-10 flex justify-center md:hidden">
            <Link to="/shop" className="inline-flex items-center justify-center gap-2 border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-2xl h-14 px-8 font-bold text-sm uppercase tracking-widest transition-all w-full sm:w-auto">
              Xem toàn bộ cửa hàng <ArrowRight className="w-5 h-5" />
            </Link>
        </div>
      </div>
    </section>
  );
}
