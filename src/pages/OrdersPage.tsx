import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/customerApi';
import { toast } from '@/lib/toast';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderCardSkeleton } from '@/components/orders/OrderCardSkeleton';
import { CancelOrderModal } from '@/components/orders/CancelOrderModal';
import type { OrderDto, Page } from '@/types/api';
import { SEO } from '@/components/SEO';

const PAGE_SIZE = 10;

export function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [ordersPage, setOrdersPage] = useState<Page<OrderDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderDto>>({});

  // Cancel order states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<OrderDto | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadOrders = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    ordersApi
      .myOrders({ page, size: PAGE_SIZE })
      .then(({ data }) => {
        setOrdersPage(data);
      })
      .catch(() => {
        toast.error('Không tải được đơn hàng. Vui lòng thử lại.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated, page]);

  const loadOrderDetail = (id: number) => {
    if (orderDetails[id]) return;
    ordersApi.getById(id).then(({ data }) => {
      setOrderDetails((prev) => ({ ...prev, [id]: data }));
    });
  };

  const toggleOrder = (id: number) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
    if (expandedOrderId !== id) loadOrderDetail(id);
  };

  const handleCancelClick = (order: OrderDto) => {
    setCancellingOrder(order);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancellingOrder) return;
    setCancelLoading(true);
    try {
      await ordersApi.cancel(cancellingOrder.id, reason);
      toast.success(`Đơn hàng #${cancellingOrder.orderNumber ?? cancellingOrder.id} đã được hủy thành công`);
      setCancelModalOpen(false);
      setCancellingOrder(null);
      // Reload orders to refresh status
      loadOrders();
      // Clear cached detail
      setOrderDetails((prev) => {
        const copy = { ...prev };
        delete copy[cancellingOrder.id];
        return copy;
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setCancelLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const totalPages = ordersPage?.totalPages ?? 0;
  const totalElements = ordersPage?.totalElements ?? 0;
  const content = ordersPage?.content ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Đơn Hàng Của Tôi" description="Theo dõi đơn hàng của bạn tại NOVAWEAR." url="/orders" noindex />
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container px-4 sm:px-6 max-w-3xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderCardSkeleton key={i} />
              ))}
            </div>
          ) : content.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              <Package className="h-14 w-14 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-foreground mb-1">Bạn chưa có đơn hàng nào</p>
              <p className="text-sm mb-6">Khám phá sản phẩm và đặt hàng để xem đơn tại đây.</p>
              <Button asChild>
                <Link to="/shop">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Mua sắm ngay
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {content.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    expanded={expandedOrderId === order.id}
                    onToggle={() => toggleOrder(order.id)}
                    detail={orderDetails[order.id] ?? null}
                    onCancelClick={() => handleCancelClick(order)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {(page * PAGE_SIZE) + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} / {totalElements} đơn
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[6rem] text-center">
                      Trang {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setCancellingOrder(null);
        }}
        onConfirm={handleCancelConfirm}
        orderNumber={cancellingOrder?.orderNumber ?? String(cancellingOrder?.id ?? '').padStart(6, '0')}
        loading={cancelLoading}
      />
    </div>
  );
}
