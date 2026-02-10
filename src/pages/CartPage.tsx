import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft, ShoppingCart, TicketPercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import VoucherInput from '@/components/voucher/VoucherInput';
import { VoucherDto } from '@/types/api';

export function CartPage() {
    const { state, removeItem, updateQuantity, clearCart, itemCount, subtotal } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Voucher state
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
            // Lưu voucher vào sessionStorage để checkout page sử dụng
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
            <Header />

            <main className="flex-1 py-8 md:py-12">
                <div className="container px-4 sm:px-6 max-w-6xl">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link to="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">Giỏ hàng</span>
                    </nav>

                    <div className="flex items-center justify-between gap-4 mb-8">
                        <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <ShoppingBag className="h-7 w-7 text-primary" />
                            Giỏ Hàng
                            {itemCount > 0 && (
                                <span className="text-lg text-muted-foreground font-normal">({itemCount} sản phẩm)</span>
                            )}
                        </h1>
                        {state.items.length > 0 && (
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={clearCart}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa tất cả
                            </Button>
                        )}
                    </div>

                    {state.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center mb-6">
                                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h2 className="font-display text-xl font-semibold mb-2">Giỏ hàng trống</h2>
                            <p className="text-muted-foreground mb-8 max-w-sm">
                                Hãy thêm sản phẩm yêu thích vào giỏ hàng để bắt đầu mua sắm
                            </p>
                            <Button asChild size="lg" className="rounded-xl h-12 px-8">
                                <Link to="/shop">
                                    <ShoppingBag className="h-5 w-5 mr-2" />
                                    Khám Phá Cửa Hàng
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {state.items.map((item) => {
                                    const price = item.product.salePrice || item.product.price;
                                    const originalPrice = item.product.price;
                                    const hasDiscount = item.product.salePrice && item.product.salePrice < originalPrice;

                                    return (
                                        <article
                                            key={item.id}
                                            className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50 hover:border-border transition-colors"
                                        >
                                            <Link
                                                to={`/product/${item.product.slug}`}
                                                className="relative h-28 w-24 rounded-xl overflow-hidden shrink-0 bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
                                            >
                                                <img
                                                    src={item.product.images[0]}
                                                    alt=""
                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {hasDiscount && (
                                                    <span className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground text-xs font-medium px-1.5 py-0.5 rounded">
                                                        -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                                                    </span>
                                                )}
                                            </Link>

                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <Link
                                                            to={`/product/${item.product.slug}`}
                                                            className="font-medium text-base hover:text-primary transition-colors line-clamp-2 block"
                                                        >
                                                            {item.product.name}
                                                        </Link>
                                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                                            <span>Size: {item.size}</span>
                                                            <span className="text-border">•</span>
                                                            <span className="flex items-center gap-1.5">
                                                                <span
                                                                    className="w-3.5 h-3.5 rounded-full border border-border shrink-0"
                                                                    style={{ backgroundColor: item.color.hex }}
                                                                />
                                                                {item.color.name}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive rounded-lg"
                                                        onClick={() => removeItem(item.id)}
                                                        aria-label="Xóa khỏi giỏ"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-end justify-between mt-auto pt-3">
                                                    <div className="flex items-center border border-border rounded-xl bg-background">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-l-xl"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            aria-label="Giảm số lượng"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="w-10 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-r-xl"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            aria-label="Tăng số lượng"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-semibold text-lg tabular-nums text-primary">
                                                            {formatCurrency(price * item.quantity)}
                                                        </p>
                                                        {hasDiscount && (
                                                            <p className="text-sm text-muted-foreground line-through tabular-nums">
                                                                {formatCurrency(originalPrice * item.quantity)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}

                                <Link
                                    to="/shop"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Tiếp tục mua sắm
                                </Link>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-4">
                                    <h2 className="font-display text-lg font-semibold">Tóm tắt đơn hàng</h2>

                                    {/* Voucher Input */}
                                    <VoucherInput
                                        orderTotal={subtotal}
                                        onApplyVoucher={handleVoucherApply}
                                    />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Tạm tính ({itemCount} sản phẩm)</span>
                                            <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Phí vận chuyển</span>
                                            <span className={cn('font-medium tabular-nums', shippingFee === 0 && 'text-green-600')}>
                                                {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
                                            </span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="flex items-center justify-between text-green-600">
                                                <span className="flex items-center gap-1">
                                                    <TicketPercent className="h-4 w-4" />
                                                    Giảm giá
                                                    {appliedVoucher && <span className="text-xs">({appliedVoucher.code})</span>}
                                                </span>
                                                <span className="font-medium tabular-nums">-{formatCurrency(discountAmount)}</span>
                                            </div>
                                        )}
                                        {shippingFee > 0 && (
                                            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                                                💡 Miễn phí vận chuyển cho đơn hàng từ {formatCurrency(200000)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="border-t border-border pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">Tổng cộng</span>
                                            <span className="font-display text-xl font-bold text-primary tabular-nums">
                                                {formatCurrency(total > 0 ? total : 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90"
                                        onClick={handleCheckout}
                                    >
                                        {isAuthenticated ? 'Tiến Hành Thanh Toán' : 'Đăng Nhập Để Thanh Toán'}
                                    </Button>

                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Thanh toán an toàn & bảo mật
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
