import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, Loader2, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/customerApi';
import { OrderCard } from '@/components/orders/OrderCard';
import type { OrderDto, Page } from '@/types/api';

const PAGE_SIZE = 10;

export function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [ordersPage, setOrdersPage] = useState<Page<OrderDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderDto>>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    ordersApi
      .myOrders({ page, size: PAGE_SIZE })
      .then(({ data }) => {
        if (!cancelled) setOrdersPage(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
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

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const totalPages = ordersPage?.totalPages ?? 0;
  const totalElements = ordersPage?.totalElements ?? 0;
  const content = ordersPage?.content ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container px-4 sm:px-6 max-w-3xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              Đang tải...
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
    </div>
  );
}
