import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { state, closeCart, removeItem, updateQuantity, itemCount, subtotal } = useCart();
  const { isAuthenticated, setShowAuthModal, setAuthMode } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setShowAuthModal(true);
      closeCart();
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-foreground/50 z-50 transition-opacity duration-300',
          state.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
        aria-hidden
      />

      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:max-w-[420px] bg-background z-50 shadow-elevated',
          'transform transition-transform duration-300 ease-out',
          state.isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Giỏ hàng"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="font-display text-lg font-semibold">Giỏ Hàng</h2>
              {itemCount > 0 && (
                <span className="text-sm text-muted-foreground">({itemCount})</span>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg tap-target" onClick={closeCart} aria-label="Đóng giỏ hàng">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-5" aria-hidden>
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Giỏ hàng trống</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Hãy thêm sản phẩm yêu thích vào giỏ hàng
              </p>
              <Button onClick={closeCart} asChild className="rounded-lg">
                <Link to="/shop">Mua Sắm Ngay</Link>
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 min-h-0 p-4">
                <ul className="space-y-3" role="list">
                  {state.items.map((item) => {
                    const price = item.product.salePrice || item.product.price;
                    return (
                      <li
                        key={item.id}
                        className="flex gap-3 p-3 bg-card rounded-xl border border-border/50"
                      >
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="relative h-20 w-16 rounded-lg overflow-hidden shrink-0 bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="font-medium text-sm hover:text-primary transition-colors line-clamp-2 block"
                            onClick={closeCart}
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <span>{item.size}</span>
                            <span className="w-2.5 h-2.5 rounded-full border border-border shrink-0" style={{ backgroundColor: item.color.hex }} aria-hidden />
                            <span>{item.color.name}</span>
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 tap-target"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                aria-label="Giảm số lượng"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <span className="w-7 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 tap-target"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Tăng số lượng"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <p className="font-semibold text-sm tabular-nums">{formatCurrency(price * item.quantity)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive rounded-lg tap-target"
                          onClick={() => removeItem(item.id)}
                          aria-label="Xóa khỏi giỏ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>

              <div className="border-t border-border p-4 space-y-3 bg-muted/30 shrink-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Phí vận chuyển được tính ở bước thanh toán
                </p>
                {isAuthenticated ? (
                  <Button className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90" asChild>
                    <Link to="/checkout" onClick={closeCart}>Thanh Toán</Link>
                  </Button>
                ) : (
                  <Button className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90" onClick={handleCheckout}>
                    Đăng Nhập Để Thanh Toán
                  </Button>
                )}
                <Button variant="outline" className="w-full h-11 rounded-lg" onClick={closeCart} asChild>
                  <Link to="/shop">Tiếp Tục Mua Sắm</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
