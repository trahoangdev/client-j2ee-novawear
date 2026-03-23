import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
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
  const slug = 'slug' in product ? (product as ProductDisplay).slug : String((product as Product).id);
  const images = product.images?.length ? product.images : (product as ProductDisplay).images ?? [];
  const hasMultipleImages = images.length >= 2;
  const categoryName = product.category?.name ?? 'Sản phẩm';
  const rating = 'rating' in product ? (product.rating ?? 0) : 0;
  const reviewCount = 'reviewCount' in product ? (product.reviewCount ?? 0) : 0;
  const colors = product.colors ?? [];
  
  // Tags
  const isNew = (product as ProductDisplay).isNew ?? ('isNew' in product && product.isNew);
  const bestseller = (product as ProductDisplay).bestseller ?? false;
  const isFlashSale = (product as ProductDisplay).isFlashSale ?? false;

  // Preload second image
  useEffect(() => {
    if (hasMultipleImages && images[1]) {
      const img = new Image();
      img.src = images[1];
    }
  }, [hasMultipleImages, images]);

  return (
    <article
      className={cn(
        'group relative bg-card p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-border/40',
        'transition-all duration-500 ease-out hover:shadow-2xl hover:border-border/80 hover:-translate-y-1 block flex flex-col',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Wishlist Button - Top Right Absolute */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute top-6 right-6 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border/50',
          'opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110',
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
        <Heart className={cn('h-5 w-5', isLiked ? 'fill-destructive text-destructive' : 'text-foreground')} />
      </Button>

      {/* Image Container */}
      <Link to={`/product/${slug}`} className="block relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-muted/20 mb-3 sm:mb-5 focus:outline-none">
        {/* Badges inside Image */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1.5 sm:gap-2">
          {isFlashSale && (
             <Badge className="bg-red-600 hover:bg-red-700 text-white border-none font-black tracking-widest uppercase px-2 py-1 shadow-lg flex items-center gap-1 text-[9px] sm:text-xs">
                 <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current animate-pulse" /> Flash Sale
             </Badge>
          )}
          {isNew && !isFlashSale && (
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 border-none shadow-sm rounded-full">New</Badge>
          )}
          {bestseller && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 border-none shadow-sm rounded-full">Hot</Badge>
          )}
        </div>

        {/* First image */}
        <img
          src={images[0] ?? ''}
          alt={product.name}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out',
            'group-hover:scale-[1.05]',
            isHovered && hasMultipleImages ? 'opacity-0' : 'opacity-100'
          )}
        />
        {/* Second image */}
        {hasMultipleImages && images[1] && (
          <img
            src={images[1]}
            alt={product.name}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out',
              'group-hover:scale-[1.05]',
              isHovered ? 'opacity-100' : 'opacity-0 scale-95'
            )}
          />
        )}
      </Link>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-none rounded-full px-2 py-0 sm:px-3 sm:py-0.5 text-[10px] sm:text-xs font-semibold">
          {categoryName}
        </Badge>
        <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 sm:px-2 rounded-full">
          <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-foreground text-foreground -mt-0.5" aria-hidden />
          <span className="text-[10px] sm:text-xs font-bold">{parseFloat(rating.toString()).toFixed(1)}</span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">({reviewCount})</span>
        </div>
      </div>

      {/* Product Name */}
      <Link to={`/product/${slug}`} className="block focus:outline-none flex-1">
        <h3 className="font-bold text-sm sm:text-base lg:text-lg leading-snug line-clamp-2 hover:text-primary transition-colors mb-2 sm:mb-3">
          {product.name}
        </h3>
      </Link>

      {/* Pricing */}
      <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2.5 mb-3 sm:mb-5 min-h-[28px] mt-auto">
        {hasDiscount ? (
          <>
            <span className={cn("font-display text-lg sm:text-2xl font-black tracking-tight leading-none", isFlashSale ? "text-red-600" : "text-foreground")}>
              {formatCurrency(salePriceNum!)}
            </span>
            <span className={cn("text-xs sm:text-sm font-semibold line-through decoration-muted-foreground/50", isFlashSale ? "text-muted-foreground/70" : "text-muted-foreground")}>
              {formatCurrency(priceNum)}
            </span>
            <Badge className={cn("border-none shadow-none font-bold text-[10px] sm:text-xs px-1.5 py-0 sm:ml-auto hidden sm:inline-flex", isFlashSale ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-destructive/10 text-destructive hover:bg-destructive/20")}>
              - {discountPercent}%
            </Badge>
          </>
        ) : (
          <span className="font-display text-lg sm:text-2xl font-black text-foreground tracking-tight leading-none">
            {formatCurrency(priceNum)}
          </span>
        )}
      </div>

      {/* Colors (if available) - Sneak Peek */}
      {colors.length > 0 && (
        <div className="flex items-center gap-2 mb-5 h-5">
          {colors.slice(0, 5).map((color, index) => {
            const isValidHex = color.hex && color.hex.trim() !== '';
            const backgroundColor = isValidHex ? color.hex : '#CCCCCC';
            return (
              <span
                key={index}
                className="h-4 w-4 rounded-full border border-border/80 shadow-sm"
                style={{ backgroundColor }}
                title={color.name}
              />
            );
          })}
          {colors.length > 5 && (
            <span className="text-xs text-muted-foreground font-medium ml-1">+{colors.length - 5}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 sm:gap-3 mt-auto">
        <Button 
          className="flex-1 rounded-xl sm:rounded-2xl h-10 sm:h-12 bg-primary text-primary-foreground font-bold text-[13px] sm:text-[15px] hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 px-2" 
          asChild
        >
          <Link to={`/product/${slug}`}>Mua Ngay</Link>
        </Button>
        <Button 
          variant="outline" 
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-2 border-border/80 hover:border-foreground/40 hover:bg-muted text-foreground transition-all p-0 flex items-center justify-center shrink-0 hover:-translate-y-0.5" 
          asChild
        >
          <Link to={`/product/${slug}`} aria-label="Chi tiết">
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
