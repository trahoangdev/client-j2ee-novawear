import { useState, useEffect } from 'react';
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
  ImagePlus,
  X,
} from 'lucide-react';
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
  const { addItem } = useCart();
  const { has: isInWishlist, toggle: toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductDisplay | null>(null);
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
    <div className="min-h-screen flex flex-col">
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

      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground">Trang chủ</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link to="/shop" className="hover:text-foreground">Bộ sưu tập</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link to={`/shop?categoryId=${product.category?.id}`} className="hover:text-foreground">{product.category?.name}</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-foreground truncate max-w-[180px] sm:max-w-none">{product.name}</span>
          </nav>
        </div>

        <div className="container px-4 sm:px-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="relative aspect-[4/5] bg-muted rounded-xl overflow-hidden">
                <img
                  src={images[selectedImage] ?? ''}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80" onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80" onClick={() => setSelectedImage((i) => (i + 1) % images.length)}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-auto pb-2">
                  {images.map((img, index) => (
                    <button key={index} onClick={() => setSelectedImage(index)} className={cn('relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2', selectedImage === index ? 'border-primary' : 'border-transparent')}>
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:py-4">
              <p className="text-sm text-muted-foreground mb-1">{product.category?.name}</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{product.rating || 0}</span>
                <span className="text-sm text-muted-foreground">({reviews.length} đánh giá)</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2 h-10 w-10 rounded-full"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                  <Heart className={cn('h-5 w-5', isInWishlist(product.id) && 'fill-destructive text-destructive')} />
                </Button>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-display text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Màu sắc</h4>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color)}
                      className={cn('h-10 w-10 rounded-full border-2 flex items-center justify-center', selectedColor.hex === color.hex ? 'border-primary scale-110' : 'border-transparent')}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor.hex === color.hex && <Check className="h-5 w-5 text-white" style={{ filter: color.hex === '#FFFFFF' ? 'invert(1)' : undefined }} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Kích thước</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <Button key={size} variant={selectedSize === size ? 'default' : 'outline'} className="min-w-[3rem]" onClick={() => setSelectedSize(size)}>
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-semibold mb-3">Số lượng</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => q + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">Còn {product.stockCount ?? 0} sản phẩm</span>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <Button size="lg" className={cn('flex-1 h-14', addedToCart ? 'bg-green-600 hover:bg-green-700' : '')} onClick={handleAddToCart} disabled={(product.stockCount ?? 0) < quantity}>
                  {addedToCart ? <><Check className="h-5 w-5 mr-2" /> Đã thêm vào giỏ</> : <><ShoppingBag className="h-5 w-5 mr-2" /> Thêm vào giỏ</>}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-muted/40 rounded-xl">
                <div className="text-center"><Truck className="h-5 w-5 mx-auto mb-1.5 text-primary" /><p className="text-xs font-medium">Miễn phí ship</p></div>
                <div className="text-center"><RefreshCw className="h-5 w-5 mx-auto mb-1.5 text-primary" /><p className="text-xs font-medium">Đổi trả 30 ngày</p></div>
                <div className="text-center"><ShieldCheck className="h-5 w-5 mx-auto mb-1.5 text-primary" /><p className="text-xs font-medium">Bảo hành chính hãng</p></div>
              </div>
            </div>
          </div>

          {/* Product Description & Reviews Tabs */}
          <div className="mt-16">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full flex justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0">
                <TabsTrigger
                  value="description"
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-6 py-4 font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mô tả sản phẩm
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-6 py-4 font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Đánh giá ({reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="pt-8">
                <div className="max-w-4xl">
                  {product.description ? (
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                      <MarkdownContent source={product.description} />
                    </div>
                  ) : (
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 text-center">
                      <p className="text-muted-foreground">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="pt-8">
                {/* Write Review Form - hiển thị cho tất cả, yêu cầu đăng nhập khi gửi */}
                <div className="mb-8 p-6 bg-muted/30 border rounded-xl">
                  <h4 className="font-semibold mb-4">Viết đánh giá của bạn</h4>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: r }))}>
                        <Star className={cn('h-7 w-7 transition-colors', r <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground hover:text-amber-300')} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full min-h-[100px] p-4 border rounded-lg text-sm bg-background resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  />
                  {/* Image upload */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {reviewImages.map((file, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-black/60 text-white rounded-bl p-0.5"
                            onClick={() => setReviewImages((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {reviewImages.length < 5 && (
                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                          <ImagePlus className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-1">Thêm ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []);
                              setReviewImages((prev) => [...prev, ...files].slice(0, 5));
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
                    {reviewImages.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{reviewImages.length}/5 ảnh</p>
                    )}
                  </div>
                  {isAuthenticated ? (
                    <>
                      <Button className="mt-3" onClick={handleSubmitReview} disabled={!reviewForm.comment.trim() || submittingReview}>
                        {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">* Đánh giá của bạn sẽ được hiển thị sau khi được duyệt</p>
                    </>
                  ) : (
                    <>
                      <Button className="mt-3" asChild>
                        <Link to="/login">Đăng nhập để gửi đánh giá</Link>
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">Bạn cần đăng nhập để gửi đánh giá</p>
                    </>
                  )}
                </div>

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {review.username?.charAt(0).toUpperCase() ?? '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.username}</span>
                              <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={cn('h-4 w-4', star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted')} />
                              ))}
                            </div>
                            <p className="text-foreground">{review.comment}</p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {review.images.map((img, idx) => (
                                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block">
                                    <img
                                      src={img}
                                      alt={`Review image ${idx + 1}`}
                                      className="w-20 h-20 rounded-lg object-cover border hover:opacity-80 transition-opacity"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-medium mb-2">Chưa có đánh giá nào</p>
                    <p className="text-sm text-muted-foreground">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl font-bold mb-8">Sản Phẩm Liên Quan</h2>
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
