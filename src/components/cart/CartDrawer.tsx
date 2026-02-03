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
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-foreground/50 z-50 transition-opacity duration-300',
          state.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-[420px] bg-background z-50 shadow-elevated transform transition-transform duration-300 ease-smooth',
          state.isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Giỏ Hàng</h2>
              {itemCount > 0 && (
                <span className="text-sm text-muted-foreground">({itemCount} sản phẩm)</span>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Giỏ hàng trống</h3>
              <p className="text-muted-foreground mb-6">
                Hãy thêm sản phẩm yêu thích vào giỏ hàng
              </p>
              <Button onClick={closeCart} asChild>
                <Link to="/shop">Mua Sắm Ngay</Link>
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {state.items.map((item) => {
                    const price = item.product.salePrice || item.product.price;
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 bg-card rounded-lg border border-border/50 animate-fade-up"
                      >
                        {/* Image */}
                        <div className="relative h-24 w-20 rounded-md overflow-hidden shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
                            onClick={closeCart}
                          >
                            {item.product.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{item.size}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <span
                                className="h-3 w-3 rounded-full border border-border"
                                style={{ backgroundColor: item.color.hex }}
                              />
                              <span>{item.color.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="font-semibold text-sm">
                                {formatCurrency(price * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(price)} / cái
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-border p-4 space-y-4 bg-card/50">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Phí vận chuyển sẽ được tính ở bước thanh toán
                </p>

                {isAuthenticated ? (
                  <Button className="w-full bg-primary hover:bg-primary/90 h-12" asChild>
                    <Link to="/checkout" onClick={closeCart}>
                      Thanh Toán
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 h-12"
                    onClick={handleCheckout}
                  >
                    Đăng Nhập Để Thanh Toán
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={closeCart}
                  asChild
                >
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
