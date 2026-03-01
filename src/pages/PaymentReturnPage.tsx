import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { vnpayApi } from '@/lib/customerApi';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { useCart } from '@/context/CartContext';
import { SEO } from '@/components/SEO';

export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    orderId?: number;
    orderCode?: string;
    amount?: number;
    responseCode?: string;
    transactionNo?: string;
    message: string;
  } | null>(null);
  
  // Sử dụng useRef để đảm bảo chỉ xử lý một lần
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Chỉ xử lý một lần, tránh spam notification
    if (hasProcessed.current) {
      return;
    }

    const processReturn = async () => {
      try {
        // Đánh dấu đã xử lý ngay từ đầu để tránh chạy lại
        hasProcessed.current = true;

        // Lấy tất cả query params từ URL hiện tại
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Kiểm tra xem có params không (tránh gọi API khi không có params)
        if (Object.keys(params).length === 0) {
          setResult({
            success: false,
            message: 'Không có thông tin thanh toán từ VNPAY',
          });
          setLoading(false);
          return;
        }

        // Gọi API để xử lý return
        const { data } = await vnpayApi.processReturn(params);
        setResult(data);

        // Nếu thanh toán thành công, clear cart và hiển thị thông báo
        if (data.success) {
          clearCart();
          toast.success('Thanh toán thành công!');
        } else {
          toast.error(data.message || 'Thanh toán thất bại');
        }
      } catch (error: any) {
        console.error('Error processing payment return:', error);
        setResult({
          success: false,
          message: error.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán',
        });
        toast.error('Có lỗi xảy ra khi xử lý kết quả thanh toán');
      } finally {
        setLoading(false);
      }
    };

    processReturn();
    // Chỉ chạy một lần khi component mount, searchParams được lấy trong function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Đang xử lý kết quả thanh toán...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSuccess = result?.success === true;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Kết Quả Thanh Toán" description="Kết quả thanh toán đơn hàng NOVAWEAR." url="/payment/return" noindex />
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            {isSuccess ? (
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            )}

            <h1 className="font-display text-3xl font-bold mb-4">
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h1>

            <p className="text-muted-foreground mb-8">{result?.message}</p>

            {result && (
              <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left space-y-3">
                {result.orderCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đơn hàng:</span>
                    <span className="font-medium">{result.orderCode}</span>
                  </div>
                )}
                {result.amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số tiền:</span>
                    <span className="font-medium">{formatCurrency(result.amount)}</span>
                  </div>
                )}
                {result.transactionNo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã giao dịch VNPAY:</span>
                    <span className="font-medium">{result.transactionNo}</span>
                  </div>
                )}
                {result.responseCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã phản hồi:</span>
                    <span className="font-medium">{result.responseCode}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {isSuccess && result?.orderId && (
                <Button onClick={() => navigate(`/orders`)}>
                  Xem đơn hàng
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/shop')}>
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
