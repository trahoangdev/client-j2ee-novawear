import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from '@/lib/toast';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import type { ProductDisplay } from '@/lib/productUtils';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product | ProductDisplay;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { has: isInWishlist, toggle: toggleWishlist } = useWishlist();
  const productId = product.id;
  const isLiked = isInWishlist(productId);
  const [isHovered, setIsHovered] = useState(false);

  const priceNum = Number(product.price);
  const salePriceNum = product.salePrice != null ? Number(product.salePrice) : undefined;
  const hasDiscount = salePriceNum != null && !Number.isNaN(salePriceNum) && salePriceNum < priceNum;
  const discountPercent = hasDiscount
    ? Math.round(((priceNum - salePriceNum!) / priceNum) * 100)
    : 0;
  const slug = 'slug' in product ? product.slug : String(product.id);
  const images = product.images?.length ? product.images : (product as ProductDisplay).images ?? [];
  const hasMultipleImages = images.length >= 2;
  const categoryName = product.category?.name ?? '';
  const rating = 'rating' in product ? (product.rating ?? 0) : 0;
  const reviewCount = 'reviewCount' in product ? (product.reviewCount ?? 0) : 0;
  const colors = product.colors ?? [];
  const isNew = (product as ProductDisplay).isNew ?? ('isNew' in product && product.isNew);
  const bestseller = (product as ProductDisplay).bestseller ?? false;
  const featured = (product as ProductDisplay).featured ?? ('isFeatured' in product && product.isFeatured);

  // Preload second image if available
  useEffect(() => {
    if (hasMultipleImages && images[1]) {
      const img = new Image();
      img.src = images[1];
    }
  }, [hasMultipleImages, images]);

  return (
    <article
      className={cn(
        'group relative bg-card rounded-xl overflow-hidden border border-border/50',
        'transition-all duration-300 ease-out hover:shadow-soft-lg hover:border-border hover:-translate-y-0.5',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        className
      )}
      onMouseEnter={() => {
        if (hasMultipleImages) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link to={`/product/${slug}`} className="block focus:outline-none relative h-full w-full group/image">
          {/* First image */}
          <img
            src={images[0] ?? ''}
            alt=""
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-in-out',
              'group-hover/image:scale-[1.03]',
              isHovered && hasMultipleImages ? 'opacity-0' : 'opacity-100'
            )}
          />
          {/* Second image (shown on hover) */}
          {hasMultipleImages && images[1] && (
            <img
              src={images[1]}
              alt=""
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-in-out',
                'group-hover/image:scale-[1.03]',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            />
          )}
        </Link>

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isNew && (
            <Badge className="bg-foreground text-background text-xs font-medium">Mới</Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-destructive text-destructive-foreground text-xs font-medium">
              -{discountPercent}%
            </Badge>
          )}
          {bestseller && (
            <Badge className="bg-amber-500 text-white text-xs font-medium">Bán chạy</Badge>
          )}
          {featured && (
            <Badge className="bg-primary text-primary-foreground text-xs font-medium">Nổi bật</Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-2.5 right-2.5 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm tap-target',
            'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity',
            isLiked && 'opacity-100'
          )}
          onClick={(e) => {
            e.preventDefault();
            const wasLiked = isInWishlist(productId);
            toggleWishlist(productId);
            toast.success(wasLiked ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích');
          }}
          aria-label={isLiked ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart className={cn('h-4 w-4', isLiked && 'fill-destructive text-destructive')} />
        </Button>

        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-foreground/90 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 h-9 bg-background/95 hover:bg-background text-foreground text-xs"
              asChild
            >
              <Link to={`/product/${slug}`}>
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Xem
              </Link>
            </Button>
            <Button size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90 shrink-0" asChild>
              <Link to={`/product/${slug}`} aria-label="Thêm vào giỏ">
                <ShoppingBag className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <p className="text-xs text-muted-foreground mb-1">{categoryName}</p>
        <Link to={`/product/${slug}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors mb-1.5">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" aria-hidden />
          <span className="text-xs font-medium">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display text-base font-semibold text-primary">
            {formatCurrency(hasDiscount ? salePriceNum! : priceNum)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(priceNum)}
            </span>
          )}
        </div>
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5" aria-hidden>
            {colors.slice(0, 4).map((color, index) => (
              <span
                key={index}
                className="h-3.5 w-3.5 rounded-full border border-border/60 shrink-0"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-xs text-muted-foreground">+{colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
