import { Link } from 'react-router-dom';
import { categories } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export function CategoryGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Danh Mục Sản Phẩm
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá các bộ sưu tập đa dạng từ thời trang công sở đến phụ kiện thời thượng
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-xl',
                'animate-fade-up',
                index % 3 === 1 && 'md:col-span-1'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-background">
                <h3 className="font-display text-lg md:text-xl font-semibold text-center">
                  {category.name}
                </h3>
              </div>

              {/* Hover Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-xl transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
