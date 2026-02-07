import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { categoriesApi } from '@/lib/customerApi';
import { toast } from '@/lib/toast';
import type { CategoryDto } from '@/types/api';
import { cn } from '@/lib/utils';
import { CategoryGridSkeleton } from './CategoryGridSkeleton';

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

  if (loading) {
    return <CategoryGridSkeleton />;
  }

  if (categories.length === 0) return null;

  return (
    <section className="section-spacing" aria-labelledby="category-heading">
      <div className="container px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-12">
          <h2 id="category-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Danh Mục Sản Phẩm
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Khám phá các bộ sưu tập đa dạng từ thời trang công sở đến phụ kiện thời thượng
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?categoryId=${category.id}`}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'animate-fade-up'
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <img
                src={category.imageUrl || PLACEHOLDER_IMAGE}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-3 sm:p-4 text-white">
                <span className="font-display text-base sm:text-lg font-semibold text-center drop-shadow-sm">
                  {category.name}
                </span>
                <span className="mt-1 opacity-0 -translate-y-1 group-hover:opacity-100 group-focus-visible:opacity-100 translate-y-0 flex items-center gap-1 text-xs font-medium transition-all duration-300">
                  Xem thêm <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <span className="absolute inset-0 border-2 border-transparent rounded-xl group-hover:border-primary/50 group-focus-visible:border-primary/50 transition-colors duration-300 pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
