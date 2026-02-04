import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, Mail, LogOut, ShoppingBag, Package, Hash, BadgeCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/customerApi';
import { OrderCard } from '@/components/orders/OrderCard';
import type { OrderDto, Page } from '@/types/api';

export function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [ordersPage, setOrdersPage] = useState<Page<OrderDto> | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderDto>>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    ordersApi
      .myOrders({ page: 0, size: 20 })
      .then(({ data }) => {
        if (!cancelled) setOrdersPage(data);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container px-4 sm:px-6 max-w-4xl">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Tài khoản của tôi</h1>

          <div className="grid gap-8 md:grid-cols-[320px_1fr]">
            {/* Thông tin cá nhân */}
            <section className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="font-semibold text-lg">{user?.name ?? '—'}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-center mt-1">
                    <Mail className="h-4 w-4 shrink-0" />
                    {user?.email ?? '—'}
                  </p>
                </div>
                <dl className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Mã tài khoản
                    </dt>
                    <dd className="font-mono">{user?.id ?? '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-muted-foreground flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4" />
                      Vai trò
                    </dt>
                    <dd>{user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-border">
                  <Button asChild variant="default" className="w-full">
                    <Link to="/shop">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Tiếp tục mua sắm
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={logout} className="w-full text-muted-foreground">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </Button>
                </div>
              </div>
            </section>

            {/* Đơn hàng gần đây */}
            <section>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Đơn hàng gần đây
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/orders">Xem tất cả</Link>
                </Button>
              </div>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  Đang tải...
                </div>
              ) : !ordersPage?.content?.length ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Bạn chưa có đơn hàng nào.</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/shop">Xem cửa hàng</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersPage.content.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      expanded={expandedOrderId === order.id}
                      onToggle={() => toggleOrder(order.id)}
                      detail={orderDetails[order.id] ?? null}
                    />
                  ))}
                  {ordersPage.totalPages > 1 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      Hiển thị {ordersPage.content.length} / {ordersPage.totalElements} đơn hàng
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
