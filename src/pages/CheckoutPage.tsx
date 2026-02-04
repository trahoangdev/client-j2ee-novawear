import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  Truck,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { ordersApi } from '@/lib/customerApi';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Thông tin giao hàng', icon: Truck },
  { id: 2, name: 'Phương thức thanh toán', icon: CreditCard },
  { id: 3, name: 'Xác nhận đơn hàng', icon: Check },
];

const PAYMENT_MAP: Record<string, string> = { cod: 'COD', momo: 'MOMO', paypal: 'PAYPAL' };

export function CheckoutPage() {
  const { state, subtotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    district: '',
    ward: '',
    note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo' | 'paypal'>('cod');

  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setCheckoutError('Vui lòng đăng nhập để đặt hàng.');
      return;
    }
    const items = state.items.map((i) => ({
      productId: Number(i.product.id),
      quantity: i.quantity,
    }));
    if (items.length === 0 || items.some((i) => Number.isNaN(i.productId))) {
      setCheckoutError('Giỏ hàng không hợp lệ.');
      return;
    }
    setCheckoutError('');
    setIsProcessing(true);
    try {
      const { data } = await ordersApi.checkout(PAYMENT_MAP[paymentMethod] ?? 'COD', items);
      setOrderId(data.orderNumber ?? String(data.id).padStart(6, '0'));
      setOrderComplete(true);
      clearCart();
    } catch {
      setCheckoutError('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Giỏ hàng trống</h1>
            <p className="text-muted-foreground mb-6">
              Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán
            </p>
            <Button asChild>
              <Link to="/shop">Mua Sắm Ngay</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-24 w-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <Check className="h-12 w-12 text-success" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-3 animate-fade-up">
              Đặt Hàng Thành Công!
            </h1>
            <p className="text-muted-foreground mb-2 animate-fade-up">
              Cảm ơn bạn đã mua sắm tại NOVAWEAR
            </p>
            <p className="text-sm text-muted-foreground mb-8 animate-fade-up">
              Mã đơn hàng: <span className="font-mono font-medium text-foreground">{orderId}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/shop">Xem sản phẩm</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/shop">Tiếp Tục Mua Sắm</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/shop" className="hover:text-foreground">
              Giỏ hàng
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Thanh toán</span>
          </nav>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-full transition-colors',
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > step.id
                      ? 'bg-success text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center',
                      currentStep === step.id
                        ? 'bg-primary-foreground/20'
                        : currentStep > step.id
                        ? 'bg-white/20'
                        : 'bg-muted-foreground/20'
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="hidden sm:inline font-medium">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 md:w-24 h-1 mx-2 rounded-full transition-colors',
                      currentStep > step.id ? 'bg-success' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-background rounded-xl p-6 md:p-8 shadow-soft">
                {/* Step 1: Shipping */}
                {currentStep === 1 && (
                  <div className="animate-fade-up">
                    <h2 className="font-display text-2xl font-bold mb-6">
                      Thông Tin Giao Hàng
                    </h2>
                    <div className="grid gap-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Họ và tên *</Label>
                          <Input
                            id="fullName"
                            value={shippingInfo.fullName}
                            onChange={(e) => handleShippingChange('fullName', e.target.value)}
                            placeholder="Nguyễn Văn A"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Số điện thoại *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={shippingInfo.phone}
                            onChange={(e) => handleShippingChange('phone', e.target.value)}
                            placeholder="0901234567"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => handleShippingChange('email', e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street">Địa chỉ *</Label>
                        <Input
                          id="street"
                          value={shippingInfo.street}
                          onChange={(e) => handleShippingChange('street', e.target.value)}
                          placeholder="Số nhà, tên đường"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                          <Input
                            id="city"
                            value={shippingInfo.city}
                            onChange={(e) => handleShippingChange('city', e.target.value)}
                            placeholder="Hồ Chí Minh"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district">Quận/Huyện *</Label>
                          <Input
                            id="district"
                            value={shippingInfo.district}
                            onChange={(e) => handleShippingChange('district', e.target.value)}
                            placeholder="Quận 1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ward">Phường/Xã *</Label>
                          <Input
                            id="ward"
                            value={shippingInfo.ward}
                            onChange={(e) => handleShippingChange('ward', e.target.value)}
                            placeholder="Phường Bến Nghé"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="note">Ghi chú</Label>
                        <Textarea
                          id="note"
                          value={shippingInfo.note}
                          onChange={(e) => handleShippingChange('note', e.target.value)}
                          placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <div className="animate-fade-up">
                    <h2 className="font-display text-2xl font-bold mb-6">
                      Phương Thức Thanh Toán
                    </h2>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
                      className="space-y-4"
                    >
                      <label
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                          paymentMethod === 'cod'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem value="cod" id="cod" />
                        <div className="flex-1">
                          <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán bằng tiền mặt khi nhận được hàng
                          </p>
                        </div>
                      </label>

                      <label
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                          paymentMethod === 'momo'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem value="momo" id="momo" />
                        <div className="flex items-center gap-4 flex-1">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                            alt="Momo"
                            className="h-8"
                          />
                          <div>
                            <p className="font-medium">Ví điện tử Momo</p>
                            <p className="text-sm text-muted-foreground">
                              Thanh toán nhanh chóng qua ví Momo
                            </p>
                          </div>
                        </div>
                      </label>

                      <label
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                          paymentMethod === 'paypal'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem value="paypal" id="paypal" />
                        <div className="flex items-center gap-4 flex-1">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                            alt="PayPal"
                            className="h-6"
                          />
                          <div>
                            <p className="font-medium">PayPal</p>
                            <p className="text-sm text-muted-foreground">
                              Thanh toán quốc tế an toàn
                            </p>
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && (
                  <div className="animate-fade-up">
                    <h2 className="font-display text-2xl font-bold mb-6">
                      Xác Nhận Đơn Hàng
                    </h2>

                    {/* Shipping Info Summary */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Thông tin giao hàng</h3>
                        <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentStep(1)}>
                          Sửa
                        </Button>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-sm">
                        <p className="font-medium">{shippingInfo.fullName}</p>
                        <p className="text-muted-foreground">{shippingInfo.phone}</p>
                        <p className="text-muted-foreground">
                          {shippingInfo.street}, {shippingInfo.ward}, {shippingInfo.district},{' '}
                          {shippingInfo.city}
                        </p>
                      </div>
                    </div>

                    {/* Payment Method Summary */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Phương thức thanh toán</h3>
                        <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentStep(2)}>
                          Sửa
                        </Button>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-sm">
                        {paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                        {paymentMethod === 'momo' && 'Ví điện tử Momo'}
                        {paymentMethod === 'paypal' && 'PayPal'}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold mb-3">Sản phẩm</h3>
                      <div className="space-y-3">
                        {state.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 bg-muted/50 rounded-lg p-3"
                          >
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-16 w-14 object-cover rounded-md"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-1">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.size} • {item.color.name} • SL: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium text-sm">
                              {formatCurrency(
                                (item.product.salePrice || item.product.price) * item.quantity
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Quay lại
                  </Button>

                  {currentStep < 3 ? (
                    <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                      Tiếp tục
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <>
                      {checkoutError && (
                        <p className="text-destructive text-sm mb-2 w-full">{checkoutError}</p>
                      )}
                      {!isAuthenticated && (
                        <p className="text-muted-foreground text-sm mb-2 w-full">Bạn cần đăng nhập để đặt hàng.</p>
                      )}
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="bg-primary hover:bg-primary/90 min-w-[160px]"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Đặt Hàng'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-xl p-6 shadow-soft sticky top-24">
                <h3 className="font-display text-xl font-bold mb-6">Đơn Hàng</h3>

                {/* Items Preview */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  {state.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-10 rounded-md overflow-hidden bg-muted">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.size} • {item.color.name}
                        </p>
                      </div>
                    </div>
                  ))}
                  {state.items.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{state.items.length - 3} sản phẩm khác
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span>{shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs text-success">
                      ✓ Bạn được miễn phí vận chuyển cho đơn từ 500K
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
