import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Star,
  Minus,
  Plus,
  Check,
  ShoppingBag,
  Truck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { useCart } from '@/context/CartContext';
import { products, mockReviews, formatCurrency, formatDate } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export function ProductDetailPage() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
            <Button asChild>
              <Link to="/shop">Quay lại cửa hàng</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const productReviews = mockReviews.filter((r) => r.product.id === product.id);
  const relatedProducts = products
    .filter((p) => p.category.id === product.category.id && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addItem(product, quantity, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/shop" className="hover:text-foreground">
              Bộ sưu tập
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              to={`/shop?category=${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>

        {/* Product Details */}
        <div className="container pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[4/5] bg-muted rounded-xl overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {/* Navigation */}
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={() =>
                        setSelectedImage(
                          (selectedImage - 1 + product.images.length) % product.images.length
                        )
                      }
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={() =>
                        setSelectedImage((selectedImage + 1) % product.images.length)
                      }
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-foreground text-background">Mới</Badge>
                  )}
                  {hasDiscount && (
                    <Badge className="bg-coral text-white">-{discountPercent}%</Badge>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:py-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {product.category.name}
                  </p>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">
                    {product.name}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart
                      className={cn('h-5 w-5', isLiked && 'fill-coral text-coral')}
                    />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= Math.floor(product.rating)
                          ? 'fill-gold text-gold'
                          : 'text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} đánh giá)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-display text-3xl font-bold text-primary">
                  {formatCurrency(product.salePrice || product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-8">{product.description}</p>

              {/* Color Selection */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">
                  Màu sắc: <span className="font-normal">{selectedColor?.name}</span>
                </h4>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center',
                        selectedColor?.hex === color.hex
                          ? 'border-primary scale-110'
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor?.hex === color.hex && (
                        <Check
                          className={cn(
                            'h-5 w-5',
                            color.hex === '#FFFFFF' || color.hex === '#E8DCC4'
                              ? 'text-foreground'
                              : 'text-white'
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Kích thước</h4>
                  <Button variant="link" className="text-sm h-auto p-0">
                    Hướng dẫn chọn size
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      className={cn(
                        'min-w-[3rem]',
                        selectedSize === size && 'bg-primary'
                      )}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <h4 className="font-semibold mb-3">Số lượng</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Còn {product.stockCount} sản phẩm
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-8">
                <Button
                  size="lg"
                  className={cn(
                    'flex-1 h-14 text-base',
                    addedToCart
                      ? 'bg-success hover:bg-success/90'
                      : 'bg-primary hover:bg-primary/90'
                  )}
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Đã thêm vào giỏ
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Thêm vào giỏ
                    </>
                  )}
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="text-center">
                  <Truck className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Miễn phí ship</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Đổi trả 30 ngày</p>
                </div>
                <div className="text-center">
                  <ShieldCheck className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Bảo hành chính hãng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-8">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4"
                >
                  Mô tả
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4"
                >
                  Đánh giá ({productReviews.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-8">
                <div className="prose prose-neutral max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  <h3 className="font-display text-xl font-semibold mt-6 mb-4">
                    Đặc điểm nổi bật
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Chất liệu cao cấp, thoáng mát</li>
                    <li>Thiết kế hiện đại, dễ phối đồ</li>
                    <li>Form dáng chuẩn, tôn vóc dáng</li>
                    <li>Màu sắc bền, không phai sau nhiều lần giặt</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="pt-8">
                {productReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Chưa có đánh giá nào cho sản phẩm này
                    </p>
                    <Button>Viết đánh giá đầu tiên</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {productReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-border pb-6 last:border-0"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.user.avatar} />
                            <AvatarFallback>
                              {review.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    'h-4 w-4',
                                    star <= review.rating
                                      ? 'fill-gold text-gold'
                                      : 'text-muted'
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-3 text-muted-foreground"
                            >
                              Hữu ích ({review.helpfulCount})
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl font-bold mb-8">
                Sản Phẩm Liên Quan
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
