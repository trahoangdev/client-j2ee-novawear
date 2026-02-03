import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { formatCurrency } from '@/data/mock-data';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <div
      className={cn(
        'group relative bg-card rounded-xl overflow-hidden transition-all duration-300',
        'hover:shadow-soft-lg hover:-translate-y-1',
        className
      )}
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.images.length > 1) setCurrentImage(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImage(0);
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images[currentImage]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-foreground text-background">Mới</Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-coral text-white">-{discountPercent}%</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isLiked && 'opacity-100'
          )}
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart
            className={cn('h-4 w-4', isLiked && 'fill-coral text-coral')}
          />
        </Button>

        {/* Quick Actions */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/80 to-transparent',
            'transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
            'transition-all duration-300'
          )}
        >
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-background hover:bg-background/90"
              asChild
            >
              <Link to={`/product/${product.slug}`}>
                <Eye className="h-4 w-4 mr-2" />
                Xem Chi Tiết
              </Link>
            </Button>
            <Button
              size="icon"
              className="bg-primary hover:bg-primary/90 h-9 w-9"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>

        {/* Name */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-xs font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-primary">
            {formatCurrency(product.salePrice || product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 mt-3">
          {product.colors.slice(0, 4).map((color, index) => (
            <span
              key={index}
              className="h-4 w-4 rounded-full border border-border/50"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-muted-foreground ml-1">
              +{product.colors.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
