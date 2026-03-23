import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  ImagePlus,
  X,
  Loader2,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { ProductDetailSkeleton } from '@/components/products/ProductDetailSkeleton';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { productsApi, reviewsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { ReviewDto } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { SEO, buildProductLD, buildBreadcrumbLD } from '@/components/SEO';

const DEFAULT_COLOR = { name: 'Đen', hex: '#2D2D2D' };

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { has: isInWishlist, toggle: toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<ProductDisplay | null>(null);
  const [activeFlashSale, setActiveFlashSale] = useState<import('@/types/api').FlashSaleDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    productsApi
      .getBySlug(slug)
      .then((prodRes) => {
        const p = productDtoToDisplay(prodRes.data);
        const productId = Number(p.id);
        setProduct(p);
        // If product is in flash sale, load the flash sale data
        if (p.isFlashSale) {
          import('@/lib/customerApi').then(({ flashSalesApi }) => {
            flashSalesApi.getActive().then(({ data }) => {
              if (data && data.length > 0) setActiveFlashSale(data[0]);
            }).catch(() => { });
          });
        }
        // Load reviews by product ID
        return Promise.all([
          Promise.resolve(p),
          reviewsApi.getByProduct(productId),
        ]);
      })
      .then(([p, revRes]) => {
        setReviews(Array.isArray(revRes.data) ? revRes.data : []);
        const c = p.colors?.length ? p.colors[0] : DEFAULT_COLOR;
        setSelectedColor(c);
        setSelectedSize(p.sizes?.length ? p.sizes[0] : 'M');
        if (p.category?.id) {
          productsApi.list({ categoryId: Number(p.category.id), size: 5 })
            .then(({ data }) =>
              setRelatedProducts(data.content.filter((d) => Number(d.id) !== Number(p.id)).map(productDtoToDisplay).slice(0, 4))
            )
            .catch(() => setRelatedProducts([]));
        }
      })
      .catch(() => {
        setProduct(null);
        toast.error('Không tải được thông tin sản phẩm. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      product as import('@/types').Product,
      quantity,
      selectedSize,
      selectedColor
    );
    setAddedToCart(true);
    toast.success('Đã thêm vào giỏ hàng');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(
      product as import('@/types').Product,
      quantity,
      selectedSize,
      selectedColor
    );
    navigate('/checkout');
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !reviewForm.comment.trim() || !product) return;
    setSubmittingReview(true);
    try {
      const productId = Number(product.id);
      let data: ReviewDto;
      if (reviewImages.length > 0) {
        const res = await reviewsApi.createWithImages(productId, {
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
          images: reviewImages,
        });
        data = res.data;
      } else {
        const res = await reviewsApi.create(productId, {
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        });
        data = res.data;
      }
      setReviews((prev) => [data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      setReviewImages([]);
      toast.success('Đã gửi đánh giá. Đánh giá có thể cần duyệt trước khi hiển thị.');
    } catch {
      toast.error('Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <ProductDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

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

  const images = product.images?.length ? product.images : [];
  const colors = product.colors?.length ? product.colors : [DEFAULT_COLOR];
  const sizes = product.sizes?.length ? product.sizes : ['S', 'M', 'L'];

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background selection:bg-primary/20">
      <SEO
        title={product.name}
        description={product.description?.slice(0, 160) || `Mua ${product.name} tại NOVAWEAR với giá tốt nhất.`}
        image={product.images[0]}
        url={`/product/${product.slug}`}
        type="product"
        keywords={`${product.name}, ${product.category?.name || ''}, thời trang, novawear`}
        jsonLd={[
          buildProductLD({
            name: product.name,
            description: product.description,
            price: product.price,
            salePrice: product.salePrice,
            image: product.images[0],
            slug: product.slug,
            category: product.category?.name,
            rating: avgRating,
            reviewCount: reviews.length,
            inStock: (product.stockCount ?? 1) > 0,
          }),
          buildBreadcrumbLD([
            { name: 'Trang chủ', url: '/' },
            { name: product.category?.name || 'Sản phẩm', url: '/shop' },
            { name: product.name, url: `/product/${product.slug}` },
          ]),
        ]}
      />
      <Header />

      <main className="flex-1 pb-24 pt-4 sm:pt-8">
        <div className="container px-4 sm:px-6 max-w-[85rem] mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-8 font-medium tracking-wide uppercase" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <Link to="/shop" className="hover:text-primary transition-colors">Cửa hàng</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <Link to={`/shop?categoryId=${product.category?.id}`} className="hover:text-primary transition-colors">{product.category?.name}</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <span className="text-foreground truncate max-w-[200px] sm:max-w-none font-bold">{product.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
            {/* Left: Product Images Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:w-1/2 space-y-4"
            >
              <div className="relative aspect-[4/5] bg-muted/30 rounded-3xl overflow-hidden group shadow-sm border border-border/40">
                {product.isNew && !product.isFlashSale && (
                  <Badge className="absolute top-6 left-6 z-10 bg-primary text-primary-foreground border-none font-bold tracking-widest uppercase px-3 py-1 shadow-lg">New</Badge>
                )}
                {product.isFlashSale ? (
                  <Badge className="absolute top-6 left-6 z-10 bg-red-600 text-white border-none font-black tracking-widest uppercase px-4 py-1.5 shadow-lg flex items-center gap-1.5 text-xs sm:text-sm">
                    <Zap className="h-4 w-4 fill-current animate-pulse" /> Flash Sale
                  </Badge>
                ) : (
                  product.salePrice && product.salePrice < product.price && (
                    <Badge className="absolute top-6 right-6 z-10 bg-destructive text-destructive-foreground border-none font-bold tracking-widest uppercase px-3 py-1 shadow-lg">Sale</Badge>
                  )
                )}
                <img
                  src={images[selectedImage] ?? ''}
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background text-foreground h-12 w-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      onClick={(e) => { e.preventDefault(); setSelectedImage((i) => (i - 1 + images.length) % images.length); }}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background text-foreground h-12 w-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      onClick={(e) => { e.preventDefault(); setSelectedImage((i) => (i + 1) % images.length); }}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 hide-scrollbar px-1">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'relative aspect-square w-24 shrink-0 rounded-2xl overflow-hidden transition-all duration-300',
                        selectedImage === index
                          ? 'ring-2 ring-primary ring-offset-4 ring-offset-background scale-100 opacity-100'
                          : 'opacity-60 hover:opacity-100 hover:scale-105 border border-border'
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right: Product Details & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="lg:w-[45%] lg:py-4 flex flex-col"
            >
              <div className="flex flex-col mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">{product.category?.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                  >
                    <Heart className={cn('h-5 w-5 transition-colors', isInWishlist(product.id) && 'fill-destructive text-destructive')} />
                  </Button>
                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold mb-3 text-foreground tracking-tight leading-tight">{product.name}</h1>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={cn('h-4 w-4', star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted fill-muted')} />
                    ))}
                  </div>
                  <span className="font-medium text-sm">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground font-medium">( {reviews.length} Reviews )</span>
                </div>

                {product.isFlashSale && activeFlashSale && (
                  <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-bold text-sm uppercase tracking-widest mb-1">
                      <Zap className="w-5 h-5 fill-current" /> Đang trong Flash Sale
                    </div>
                    <p className="text-muted-foreground text-xs font-medium">Nhanh tay số lượng có hạn!</p>
                  </div>
                )}

                <div className="flex items-baseline gap-3">
                  {product.salePrice && product.salePrice < product.price ? (
                    <>
                      <span className={cn("text-xl text-muted-foreground line-through font-medium", product.isFlashSale && "text-muted-foreground/70")}>{formatCurrency(product.price)}</span>
                      <span className={cn("text-3xl font-semibold tracking-tight", product.isFlashSale ? "text-red-600" : "text-foreground")}>{formatCurrency(product.salePrice)}</span>
                      {product.isFlashSale && (
                        <Badge className="ml-2 bg-red-600/10 text-red-600 border-none px-2.5 py-1 text-sm font-black shadow-none pointer-events-none">
                          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-3xl font-semibold text-foreground tracking-tight">{formatCurrency(product.price)}</span>
                  )}
                </div>
              </div>

              {/* Attributes (Color & Size) */}
              <div className="space-y-6 mb-8 mt-2">
                {/* Colors */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-muted-foreground font-medium">Màu sắc</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => {
                      const isValidHex = color.hex && color.hex.trim() !== '';
                      const backgroundColor = isValidHex ? color.hex : '#CCCCCC';
                      
                      return (
                        <button
                          key={color.name || index}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            'h-10 px-4 rounded-md border text-sm transition-all focus:outline-none flex items-center gap-2',
                            selectedColor.name === color.name
                              ? 'border-foreground shadow-sm bg-muted/50 font-medium'
                              : 'border-border hover:border-foreground/30 bg-background text-muted-foreground'
                          )}
                          title={color.name}
                          aria-label={`Chọn màu ${color.name}`}
                        >
                          <span className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor }} />
                          {color.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <div className="flex items-center mb-3 gap-3">
                    <span className="text-sm text-muted-foreground font-medium">Size</span>
                    {(product.stockCount ?? 0) > 0 && (product.stockCount ?? 0) <= 5 && (
                      <span className="text-xs font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Only {product.stockCount} Stocks Left
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        className={cn(
                          'h-11 min-w-[3.5rem] px-3 rounded-md border transition-all duration-200 focus:outline-none text-sm',
                          selectedSize === size
                            ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-sm'
                            : 'bg-background text-foreground border-border hover:border-foreground/50'
                        )}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add to cart / Action buttons */}
              <div className="space-y-3 mb-10 w-full mt-2">
                <Button
                  className="w-full h-12 rounded-md font-semibold text-base transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleBuyNow}
                  disabled={(product.stockCount ?? 0) <= 0}
                >
                  Mua ngay
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-md font-semibold text-base border-border hover:bg-muted text-foreground transition-all"
                  onClick={handleAddToCart}
                  disabled={(product.stockCount ?? 0) <= 0}
                >
                  {addedToCart ? "Đã thêm vào giỏ hàng" : "Thêm vào giỏ hàng"}
                </Button>
              </div>

              {/* Inline Tabs (Detail, Guide, Reviews) */}
              <div className="w-full mt-auto mb-4">
                <Tabs defaultValue="detail" className="w-full">
                  <TabsList className="w-full flex justify-start border-b border-border bg-transparent h-auto p-0 gap-6 overflow-x-auto hide-scrollbar">
                    <TabsTrigger
                      value="detail"
                      className="px-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent"
                    >
                      Chi tiết sản phẩm
                    </TabsTrigger>
                    <TabsTrigger
                      value="shipping"
                      className="px-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent"
                    >
                      Shipping
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="px-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent"
                    >
                      Reviews ({reviews.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="detail" className="pt-6 animate-fade-up">
                    <div className="prose prose-sm prose-stone dark:prose-invert max-w-none text-muted-foreground">
                      {product.description ? (
                        <MarkdownContent source={product.description} />
                      ) : (
                        <p>No details available for this product.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="shipping" className="pt-6 animate-fade-up">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex gap-3 p-4 rounded-lg bg-card border shadow-sm">
                        <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm mb-0.5">Giao hàng</p>
                          <p className="text-xs text-muted-foreground">Ho Chi Minh, VN</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-4 rounded-lg bg-card border shadow-sm">
                        <RefreshCw className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm mb-0.5">Vận chuyển</p>
                          <p className="text-xs text-muted-foreground">Toàn quốc</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-4 rounded-lg bg-card border shadow-sm">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm mb-0.5">Thời gian giao hàng</p>
                          <p className="text-xs text-muted-foreground">Ước tính 2-4 ngày</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="pt-6 animate-fade-up">
                    <div className="space-y-6">
                      {/* Form viết đánh giá thu gọn */}
                      <div className="p-5 border rounded-xl bg-card">
                        <h4 className="font-semibold text-sm mb-3">Viết đánh giá</h4>
                        <textarea
                          className="w-full min-h-[80px] p-3 border rounded-lg text-sm bg-background resize-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all mb-3"
                          placeholder="Chia sẻ suy nghĩ của bạn..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((r) => (
                              <button key={r} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: r }))}>
                                <Star className={cn('h-5 w-5 transition-colors', r <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-muted hover:text-amber-300')} />
                              </button>
                            ))}
                          </div>
                          {isAuthenticated ? (
                            <Button size="sm" onClick={handleSubmitReview} disabled={!reviewForm.comment.trim() || submittingReview}>
                              Submit
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" asChild><Link to="/login">Login</Link></Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {reviews.length > 0 ? (
                          reviews.slice(0, 4).map((review) => (
                            <div key={review.id} className="border p-4 rounded-xl bg-card flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm truncate pr-2">{review.username}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(review.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-0.5 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={cn('h-3 w-3', star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted')} />
                                ))}
                              </div>
                              <p className="text-muted-foreground text-xs leading-relaxed italic line-clamp-3">"{review.comment}"</p>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-1 sm:col-span-2 py-6 text-center text-sm text-muted-foreground">No reviews yet.</div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-24 border-t border-border/40 pt-16">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">Hoàn Thiện Bộ Cánh.</h2>
                <p className="text-muted-foreground font-medium text-lg">Gợi ý những sản phẩm khác cùng bộ sưu tập</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
