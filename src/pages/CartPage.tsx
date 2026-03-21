import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart, TicketPercent, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import VoucherInput from '@/components/voucher/VoucherInput';
import { VoucherDto } from '@/types/api';
import { SEO } from '@/components/SEO';

export function CartPage() {
  const { state, removeItem, updateQuantity, clearCart, itemCount, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [appliedVoucher, setAppliedVoucher] = useState<VoucherDto | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleVoucherApply = (voucher: VoucherDto | null, discount: number) => {
    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      if (appliedVoucher) {
        sessionStorage.setItem('appliedVoucher', JSON.stringify({
          code: appliedVoucher.code,
          discountAmount: discountAmount
        }));
      } else {
        sessionStorage.removeItem('appliedVoucher');
      }
      navigate('/checkout');
    }
  };

  const shippingFee = subtotal >= 200000 ? 0 : 30000;
  const total = subtotal + shippingFee - discountAmount;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Giỏ Hàng" description="Xem giỏ hàng của bạn tại NOVAWEAR." url="/cart" noindex />
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="container px-4 sm:px-6 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Giỏ hàng</span>
          </nav>

          {state.items.length === 0 ? (
            /* Empty Cart */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="h-32 w-32 rounded-[2rem] bg-muted/50 border border-border/50 flex items-center justify-center mb-8">
                <ShoppingCart className="h-14 w-14 text-muted-foreground/40" />
              </div>
              <h1 className="text-3xl font-semibold mb-3 tracking-tight">Giỏ hàng trống</h1>
              <p className="text-muted-foreground mb-10 max-w-md text-base leading-relaxed">
                Bạn chưa thêm sản phẩm nào. Hãy khám phá cửa hàng và tìm cho mình những món đồ ưng ý nhé!
              </p>
              <Button asChild className="rounded-2xl h-14 px-10 bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 shadow-lg">
                <Link to="/shop">
                  Khám phá cửa hàng
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-end justify-between gap-4 mb-10">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">Giỏ hàng</h1>
                  <p className="text-muted-foreground text-base">{itemCount} sản phẩm trong giỏ hàng của bạn</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive text-sm"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tất cả
                </Button>
              </div>

              <div className="grid lg:grid-cols-5 gap-10 xl:gap-14">
                {/* Cart Items - Left Column */}
                <div className="lg:col-span-3 space-y-5">
                  {/* Table Header (desktop) */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-3 border-b border-border text-sm text-muted-foreground font-medium">
                    <div className="col-span-6">Sản phẩm</div>
                    <div className="col-span-2 text-center">Số lượng</div>
                    <div className="col-span-3 text-right">Thành tiền</div>
                    <div className="col-span-1" />
                  </div>

                  <AnimatePresence mode="popLayout">
                    {state.items.map((item) => {
                      const price = item.product.salePrice || item.product.price;
                      const originalPrice = item.product.price;
                      const hasDiscount = item.product.salePrice && item.product.salePrice < originalPrice;

                      return (
                        <motion.article
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                          className="md:grid md:grid-cols-12 md:gap-4 md:items-center flex gap-4 p-5 bg-card rounded-2xl border border-border/50 hover:border-border/80 transition-all group"
                        >
                          {/* Product Info */}
                          <div className="md:col-span-6 flex gap-4 items-center min-w-0">
                            <Link
                              to={`/product/${item.product.slug}`}
                              className="relative h-24 w-24 md:h-28 md:w-24 rounded-xl overflow-hidden shrink-0 bg-muted/30 focus:outline-none group/img"
                            >
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="h-full w-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                              />
                              {hasDiscount && (
                                <span className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                  -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                                </span>
                              )}
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/product/${item.product.slug}`}
                                className="font-semibold text-[15px] hover:text-primary transition-colors line-clamp-2 block leading-snug mb-2"
                              >
                                {item.product.name}
                                {item.isFlashSale && (
                                  <span className="ml-2 inline-flex items-center gap-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider translate-y-[-2px]">
                                    ⚡ Flash Sale
                                  </span>
                                )}
                              </Link>
                              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <span className="text-xs bg-muted/60 border border-border/50 px-2 py-0.5 rounded-md font-medium">{item.size}</span>
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-border/70 shadow-sm"
                                    style={{ backgroundColor: item.color.hex }}
                                  />
                                  <span className="text-xs font-medium">{item.color.name}</span>
                                </span>
                              </div>
                              {/* Unit price */}
                              <div className="flex items-center gap-2 mt-2 md:hidden">
                                <span className="font-bold text-sm">{formatCurrency(price)}</span>
                                {hasDiscount && (
                                  <span className="text-xs text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="md:col-span-2 flex justify-center">
                            <div className="flex items-center border border-border rounded-xl bg-background h-10">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-full w-9 rounded-l-xl rounded-r-none hover:bg-muted"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                aria-label="Giảm"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <span className="w-10 text-center text-sm font-bold tabular-nums select-none">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-full w-9 rounded-r-xl rounded-l-none hover:bg-muted"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Tăng"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="md:col-span-3 text-right hidden md:block">
                            <p className="font-bold text-lg tabular-nums">{formatCurrency(price * item.quantity)}</p>
                            {hasDiscount && (
                              <p className="text-sm text-muted-foreground line-through tabular-nums">{formatCurrency(originalPrice * item.quantity)}</p>
                            )}
                          </div>

                          {/* Delete */}
                          <div className="md:col-span-1 flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => removeItem(item.id)}
                              aria-label="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>

                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-6 group/back"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" />
                    Tiếp tục mua sắm
                  </Link>
                </div>

                {/* Order Summary - Right Column */}
                <div className="lg:col-span-2">
                  <div className="sticky top-24 space-y-6">
                    {/* Summary Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="rounded-2xl border border-border bg-card p-6 space-y-5"
                    >
                      <h2 className="font-semibold text-lg">Tóm tắt đơn hàng</h2>

                      {/* Voucher */}
                      <VoucherInput orderTotal={subtotal} onApplyVoucher={handleVoucherApply} />

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Tạm tính</span>
                          <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Phí vận chuyển</span>
                          <span className={cn('font-medium tabular-nums', shippingFee === 0 && 'text-green-600 font-semibold')}>
                            {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
                          </span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex items-center justify-between text-green-600">
                            <span className="flex items-center gap-1.5">
                              <TicketPercent className="h-4 w-4" />
                              Voucher
                              {appliedVoucher && <span className="text-[10px] font-mono bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">{appliedVoucher.code}</span>}
                            </span>
                            <span className="font-semibold tabular-nums">-{formatCurrency(discountAmount)}</span>
                          </div>
                        )}
                        {shippingFee > 0 && (
                          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 leading-relaxed">
                            Miễn phí vận chuyển cho đơn hàng từ <span className="font-semibold text-foreground">{formatCurrency(200000)}</span>
                          </p>
                        )}
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-base">Tổng cộng</span>
                          <span className="text-2xl font-black tabular-nums tracking-tight">
                            {formatCurrency(total > 0 ? total : 0)}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full h-13 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                        onClick={handleCheckout}
                      >
                        {isAuthenticated ? 'Thanh toán' : 'Đăng nhập để thanh toán'}
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-4 w-4" />
                        Thanh toán an toàn & bảo mật
                      </div>
                    </motion.div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                        <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs font-semibold leading-tight">Giao hàng nhanh</p>
                          <p className="text-[10px] text-muted-foreground">2-4 ngày toàn quốc</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs font-semibold leading-tight">Chính hãng</p>
                          <p className="text-[10px] text-muted-foreground">100% đảm bảo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
