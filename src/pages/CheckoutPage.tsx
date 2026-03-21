import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  Truck,
  ShoppingBag,
  Loader2,
  TicketPercent,
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
import { useAppSettingsReadOnly } from '@/context/AppSettingsContext';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { ordersApi, vnpayApi } from '@/lib/customerApi';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { VoucherModal } from '@/components/voucher/VoucherModal';
import type { VoucherDto } from '@/types/api';

const steps = [
  { id: 1, name: 'Thông tin giao hàng', icon: Truck },
  { id: 2, name: 'Phương thức thanh toán', icon: CreditCard },
  { id: 3, name: 'Xác nhận đơn hàng', icon: Check },
];

const PAYMENT_MAP: Record<string, string> = { cod: 'COD', momo: 'MOMO', paypal: 'PAYPAL', vnpay: 'VNPAY' };
type PaymentKey = 'cod' | 'momo' | 'paypal' | 'vnpay';

export function CheckoutPage() {
  const { state, subtotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { general } = useAppSettingsReadOnly();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null); // Lưu mã đơn sau khi tạo
  const [checkoutError, setCheckoutError] = useState('');

  const paymentOptions = useMemo((): PaymentKey[] => {
    const out: PaymentKey[] = [];
    if (general.paymentCodEnabled) out.push('cod');
    // Momo & PayPal tạm ẩn — chưa tích hợp backend
    // if (general.paymentMomoEnabled) out.push('momo');
    // if (general.paymentPayPalEnabled) out.push('paypal');
    // VNPAY luôn enabled (có thể thêm vào settings sau)
    out.push('vnpay');
    return out;
  }, [general.paymentCodEnabled]);

  const defaultPayment: PaymentKey = paymentOptions[0] ?? 'cod';

  const [paymentMethod, setPaymentMethod] = useState<PaymentKey>(defaultPayment);

  useEffect(() => {
    if (!paymentOptions.includes(paymentMethod)) {
      setPaymentMethod(paymentOptions[0] ?? 'cod');
    }
  }, [paymentOptions, paymentMethod]);

  // Voucher state - đọc từ sessionStorage
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  useEffect(() => {
    // Đọc voucher từ sessionStorage khi component mount
    const savedVoucher = sessionStorage.getItem('appliedVoucher');
    if (savedVoucher) {
      try {
        const voucher = JSON.parse(savedVoucher);
        setAppliedVoucher(voucher);
      } catch (e) {
        console.error('Error parsing voucher from sessionStorage:', e);
        sessionStorage.removeItem('appliedVoucher');
      }
    }
  }, []);

  const handleApplyVoucher = (voucher: VoucherDto, discountAmount: number) => {
    const voucherData = { code: voucher.code, discountAmount };
    setAppliedVoucher(voucherData);
    sessionStorage.setItem('appliedVoucher', JSON.stringify(voucherData));
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    sessionStorage.removeItem('appliedVoucher');
  };

  const shipping = subtotal >= 200000 ? 0 : 30000;
  const discountAmount = appliedVoucher?.discountAmount || 0;
  const total = subtotal + shipping - discountAmount;
  const minOrderAmount = general.minOrderAmount ?? 0;
  const belowMinOrder = minOrderAmount > 0 && subtotal < minOrderAmount;

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

  // Validation errors state
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (shippingErrors[field]) {
      setShippingErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateShippingInfo = (): boolean => {
    const errors: Record<string, string> = {};

    if (!shippingInfo.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!shippingInfo.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(shippingInfo.phone.trim())) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!shippingInfo.street.trim()) {
      errors.street = 'Vui lòng nhập địa chỉ';
    }

    if (!shippingInfo.city.trim()) {
      errors.city = 'Vui lòng nhập tỉnh/thành phố';
    }

    if (!shippingInfo.district.trim()) {
      errors.district = 'Vui lòng nhập quận/huyện';
    }

    if (!shippingInfo.ward.trim()) {
      errors.ward = 'Vui lòng nhập phường/xã';
    }

    // Email validation (optional field, but validate format if provided)
    if (shippingInfo.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email.trim())) {
      errors.email = 'Email không hợp lệ';
    }

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateShippingInfo()) {
        toast.warning('Vui lòng điền đầy đủ thông tin giao hàng');
        return;
      }
    }
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
      toast.warning('Vui lòng đăng nhập để đặt hàng.');
      return;
    }
    if (belowMinOrder) {
      setCheckoutError(`Đơn hàng tối thiểu ${formatCurrency(minOrderAmount)}.`);
      toast.warning(`Đơn hàng tối thiểu ${formatCurrency(minOrderAmount)}.`);
      return;
    }
    if (paymentOptions.length === 0) {
      setCheckoutError('Chưa có phương thức thanh toán. Vui lòng liên hệ cửa hàng.');
      toast.warning('Chưa có phương thức thanh toán.');
      return;
    }
    const items = state.items.map((i) => ({
      productId: Number(i.product.id),
      quantity: i.quantity,
    }));
    if (items.length === 0 || items.some((i) => Number.isNaN(i.productId))) {
      setCheckoutError('Giỏ hàng không hợp lệ.');
      toast.warning('Giỏ hàng không hợp lệ.');
      return;
    }
    setCheckoutError('');
    setIsProcessing(true);
    try {
      const paymentMethodValue = PAYMENT_MAP[paymentMethod] ?? PAYMENT_MAP[defaultPayment] ?? 'COD';
      
      const { data } = await ordersApi.checkout(
        paymentMethodValue,
        items,
        {
          recipientName: shippingInfo.fullName,
          address: `${shippingInfo.street}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`,
          phone: shippingInfo.phone,
          note: shippingInfo.note,
        },
        appliedVoucher?.code // Gửi mã voucher nếu có
      );
      
      // Lưu mã đơn hàng để hiển thị
      const orderCode = data.orderNumber ?? String(data.id).padStart(6, '0');
      setCreatedOrderId(orderCode);
      
      // Xóa voucher khỏi sessionStorage sau khi tạo đơn hàng thành công
      sessionStorage.removeItem('appliedVoucher');
      setAppliedVoucher(null);
      
      // Nếu là VNPAY, redirect đến trang thanh toán
      if (paymentMethod === 'vnpay') {
        try {
          const { data: paymentData } = await vnpayApi.createPaymentUrl(data.id);
          if (paymentData.code === '00' && paymentData.data) {
            // Redirect đến VNPAY
            window.location.href = paymentData.data;
            return; // Không clear cart ở đây, sẽ clear sau khi thanh toán thành công
          } else {
            throw new Error(paymentData.message || 'Không thể tạo URL thanh toán');
          }
        } catch (error: any) {
          setCheckoutError('Không thể tạo URL thanh toán VNPAY: ' + (error.message || 'Lỗi không xác định'));
          toast.error('Không thể tạo URL thanh toán VNPAY');
          return;
        }
      }
      
      // Các phương thức thanh toán khác (COD, MOMO, PayPal - chưa tích hợp thật)
      setOrderId(data.orderNumber ?? String(data.id).padStart(6, '0'));
      setOrderComplete(true);
      clearCart();
      toast.success('Đặt hàng thành công! Mã đơn: ' + (data.orderNumber ?? String(data.id).padStart(6, '0')));
    } catch (error: any) {
      setCheckoutError('Đặt hàng thất bại. Vui lòng thử lại.');
      toast.error('Đặt hàng thất bại: ' + (error.message || 'Lỗi không xác định'));
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
      <SEO title="Thanh Toán" description="Hoàn tất đơn hàng của bạn tại NOVAWEAR." url="/checkout" noindex />
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
                            className={shippingErrors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
                          />
                          {shippingErrors.fullName && (
                            <p className="text-sm text-destructive">{shippingErrors.fullName}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Số điện thoại *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={shippingInfo.phone}
                            onChange={(e) => handleShippingChange('phone', e.target.value)}
                            placeholder="0901234567"
                            className={shippingErrors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
                          />
                          {shippingErrors.phone && (
                            <p className="text-sm text-destructive">{shippingErrors.phone}</p>
                          )}
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
                          className={shippingErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {shippingErrors.email && (
                          <p className="text-sm text-destructive">{shippingErrors.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street">Địa chỉ *</Label>
                        <Input
                          id="street"
                          value={shippingInfo.street}
                          onChange={(e) => handleShippingChange('street', e.target.value)}
                          placeholder="Số nhà, tên đường"
                          className={shippingErrors.street ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {shippingErrors.street && (
                          <p className="text-sm text-destructive">{shippingErrors.street}</p>
                        )}
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                          <Input
                            id="city"
                            value={shippingInfo.city}
                            onChange={(e) => handleShippingChange('city', e.target.value)}
                            placeholder="Hồ Chí Minh"
                            className={shippingErrors.city ? 'border-destructive focus-visible:ring-destructive' : ''}
                          />
                          {shippingErrors.city && (
                            <p className="text-sm text-destructive">{shippingErrors.city}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district">Quận/Huyện *</Label>
                          <Input
                            id="district"
                            value={shippingInfo.district}
                            onChange={(e) => handleShippingChange('district', e.target.value)}
                            placeholder="Quận 1"
                            className={shippingErrors.district ? 'border-destructive focus-visible:ring-destructive' : ''}
                          />
                          {shippingErrors.district && (
                            <p className="text-sm text-destructive">{shippingErrors.district}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ward">Phường/Xã *</Label>
                          <Input
                            id="ward"
                            value={shippingInfo.ward}
                            onChange={(e) => handleShippingChange('ward', e.target.value)}
                            placeholder="Phường Bến Nghé"
                            className={shippingErrors.ward ? 'border-destructive focus-visible:ring-destructive' : ''}
                          />
                          {shippingErrors.ward && (
                            <p className="text-sm text-destructive">{shippingErrors.ward}</p>
                          )}
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
                    {paymentOptions.length === 0 ? (
                      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center text-muted-foreground">
                        Chưa có phương thức thanh toán. Vui lòng liên hệ cửa hàng.
                      </div>
                    ) : (
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(v) => setPaymentMethod(v as PaymentKey)}
                        className="space-y-4"
                      >
                        {paymentOptions.includes('cod') && (
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
                        )}
                        {paymentOptions.includes('momo') && (
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
                        )}
                        {paymentOptions.includes('paypal') && (
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
                        )}
                        {paymentOptions.includes('vnpay') && (
                          <label
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                              paymentMethod === 'vnpay'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <RadioGroupItem value="vnpay" id="vnpay" />
                            <div className="flex items-center gap-4 flex-1">
                              <div className="h-8 w-20 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">
                                VNPAY
                              </div>
                              <div>
                                <p className="font-medium">VNPAY</p>
                                <p className="text-sm text-muted-foreground">
                                  Thanh toán qua cổng VNPAY (ATM, thẻ quốc tế, ví điện tử)
                                </p>
                              </div>
                            </div>
                          </label>
                        )}
                      </RadioGroup>
                    )}
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
                        {createdOrderId ? (
                          <div>
                            <p className="font-medium mb-1">Mã đơn hàng:</p>
                            <p className="font-mono font-semibold text-primary">{createdOrderId}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                              {paymentMethod === 'momo' && 'Ví điện tử Momo'}
                              {paymentMethod === 'paypal' && 'PayPal'}
                              {paymentMethod === 'vnpay' && 'Thanh toán qua VNPAY'}
                            </p>
                          </div>
                        ) : (
                          <>
                            {paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                            {paymentMethod === 'momo' && 'Ví điện tử Momo'}
                            {paymentMethod === 'paypal' && 'PayPal'}
                            {paymentMethod === 'vnpay' && 'Thanh toán qua VNPAY'}
                          </>
                        )}
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
                      {belowMinOrder && isAuthenticated && (
                        <p className="text-amber-600 dark:text-amber-400 text-sm mb-2 w-full">
                          Đơn tối thiểu {formatCurrency(minOrderAmount)}. Hiện tại: {formatCurrency(subtotal)}.
                        </p>
                      )}
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing || belowMinOrder || !isAuthenticated || paymentOptions.length === 0}
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
                  {appliedVoucher && discountAmount > 0 && (
                    <div className="flex justify-between text-success">
                      <span className="text-muted-foreground">Giảm giá ({appliedVoucher.code})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  {shipping === 0 && (
                    <p className="text-xs text-success">
                      ✓ Bạn được miễn phí vận chuyển cho đơn từ 200K
                    </p>
                  )}
                  {belowMinOrder && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Đơn tối thiểu {formatCurrency(minOrderAmount)}. Cần thêm {formatCurrency(minOrderAmount - subtotal)}.
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Voucher */}
                <div className="mt-4 pt-4 border-t border-border">
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-bold text-green-700 dark:text-green-400">{appliedVoucher.code}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Giảm {formatCurrency(appliedVoucher.discountAmount)}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setVoucherModalOpen(true)}>Sửa</Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={handleRemoveVoucher}>Bỏ</Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-sm"
                      onClick={() => setVoucherModalOpen(true)}
                    >
                      <TicketPercent className="h-4 w-4 text-primary" />
                      Chọn mã giảm giá
                    </Button>
                  )}
                </div>

                <VoucherModal
                  open={voucherModalOpen}
                  onOpenChange={setVoucherModalOpen}
                  orderTotal={subtotal}
                  appliedCode={appliedVoucher?.code}
                  onApply={handleApplyVoucher}
                  onRemove={handleRemoveVoucher}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
