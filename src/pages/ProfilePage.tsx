import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  User,
  Mail,
  LogOut,
  ShoppingBag,
  Package,
  BadgeCheck,
  Loader2,
  Heart,
  Settings,
  LayoutDashboard,
  Lock,
  Phone,
  MapPin,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAppSettingsReadOnly } from '@/context/AppSettingsContext';
import { toast } from '@/lib/toast';
import { ordersApi } from '@/lib/customerApi';
import { OrderCard } from '@/components/orders/OrderCard';
import { cn } from '@/lib/utils';
import type { OrderDto, Page } from '@/types/api';

type ProfileTab = 'overview' | 'orders' | 'wishlist' | 'settings';

const NOTIFY_PREFS_KEY = 'novawear_notify_prefs';

function getNotifyPrefs(userId: string | number): { emailOrders: boolean; emailPromo: boolean } {
  try {
    const raw = localStorage.getItem(NOTIFY_PREFS_KEY);
    if (!raw) return { emailOrders: true, emailPromo: false };
    const all = JSON.parse(raw) as Record<string, { emailOrders: boolean; emailPromo: boolean }>;
    return all[String(userId)] ?? { emailOrders: true, emailPromo: false };
  } catch {
    return { emailOrders: true, emailPromo: false };
  }
}

function setNotifyPrefs(userId: string | number, prefs: { emailOrders: boolean; emailPromo: boolean }) {
  try {
    const raw = localStorage.getItem(NOTIFY_PREFS_KEY);
    const all = (raw ? JSON.parse(raw) : {}) as Record<string, { emailOrders: boolean; emailPromo: boolean }>;
    all[String(userId)] = prefs;
    localStorage.setItem(NOTIFY_PREFS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { store } = useAppSettingsReadOnly();
  const { count: wishlistCount } = useWishlist();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [notifyPrefs, setNotifyPrefsState] = useState(() =>
    user?.id != null ? getNotifyPrefs(user.id) : { emailOrders: true, emailPromo: false }
  );
  const [ordersPage, setOrdersPage] = useState<Page<OrderDto> | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderDto>>({});

  useEffect(() => {
    if (user?.id != null) {
      setNotifyPrefsState(getNotifyPrefs(user.id));
    }
  }, [user?.id]);

  const handleNotifyPrefChange = (key: 'emailOrders' | 'emailPromo', value: boolean) => {
    if (user?.id == null) return;
    const next = { ...notifyPrefs, [key]: value };
    setNotifyPrefsState(next);
    setNotifyPrefs(user.id, next);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    ordersApi
      .myOrders({ page: 0, size: 20 })
      .then(({ data }) => {
        if (!cancelled) setOrdersPage(data);
      })
      .catch(() => {
        if (!cancelled) toast.error('Không tải được đơn hàng. Vui lòng thử lại.');
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

  const orderCount = ordersPage?.totalElements ?? 0;
  const tabs: { id: ProfileTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'orders', label: 'Đơn hàng', icon: Package },
    { id: 'wishlist', label: 'Yêu thích', icon: Heart },
    { id: 'settings', label: 'Cài đặt tài khoản', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container px-4 sm:px-6 max-w-5xl">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Tài khoản của tôi</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar tabs */}
            <nav
              className="flex md:flex-col gap-1 shrink-0 md:w-56"
              aria-label="Menu tài khoản"
            >
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors',
                    activeTab === id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                  {id === 'orders' && orderCount > 0 && (
                    <span className="ml-auto bg-background/20 text-xs px-2 py-0.5 rounded-full">{orderCount}</span>
                  )}
                  {id === 'wishlist' && wishlistCount > 0 && (
                    <span className="ml-auto bg-background/20 text-xs px-2 py-0.5 rounded-full">{wishlistCount}</span>
                  )}
                </button>
              ))}
              <div className="border-t border-border my-2 md:my-0 md:mt-2 md:pt-2" />
              <Button variant="ghost" className="justify-start text-muted-foreground hover:text-destructive" onClick={logout}>
                <LogOut className="h-5 w-5 mr-3 shrink-0" />
                Đăng xuất
              </Button>
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Tab: Tổng quan */}
              {activeTab === 'overview' && (
                <section className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-12 w-12 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-xl truncate">{user?.name ?? '—'}</h2>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{user?.email ?? '—'}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">ID: {user?.id ?? '—'}</p>
                        <span className="inline-flex items-center gap-1.5 mt-2 text-sm">
                          <BadgeCheck className="h-4 w-4 text-primary" />
                          {user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/orders" className="rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors">
                      <Package className="h-8 w-8 text-primary mb-2" />
                      <p className="font-semibold">{orderCount}</p>
                      <p className="text-sm text-muted-foreground">Đơn hàng</p>
                    </Link>
                    <Link to="/wishlist" className="rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors">
                      <Heart className="h-8 w-8 text-destructive mb-2" />
                      <p className="font-semibold">{wishlistCount}</p>
                      <p className="text-sm text-muted-foreground">Yêu thích</p>
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link to="/shop">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Tiếp tục mua sắm
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/orders">Xem đơn hàng</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/wishlist">Xem yêu thích</Link>
                    </Button>
                  </div>
                </section>
              )}

              {/* Tab: Đơn hàng */}
              {activeTab === 'orders' && (
                <section>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="font-semibold text-lg">Đơn hàng của tôi</h2>
                    <Button variant="outline" size="sm" asChild>
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
                    </div>
                  )}
                </section>
              )}

              {/* Tab: Yêu thích */}
              {activeTab === 'wishlist' && (
                <section>
                  <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <Heart className={cn('h-14 w-14 mx-auto mb-4', wishlistCount > 0 ? 'text-destructive fill-destructive' : 'opacity-50')} />
                    <p className="font-semibold text-lg">
                      {wishlistCount > 0 ? `${wishlistCount} sản phẩm yêu thích` : 'Chưa có sản phẩm yêu thích'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                      {wishlistCount > 0 ? 'Xem và quản lý danh sách yêu thích của bạn.' : 'Thêm sản phẩm từ cửa hàng để xem tại đây.'}
                    </p>
                    <Button asChild variant={wishlistCount > 0 ? 'default' : 'outline'}>
                      <Link to="/wishlist">
                        <Heart className="h-4 w-4 mr-2" />
                        {wishlistCount > 0 ? 'Xem danh sách yêu thích' : 'Khám phá cửa hàng'}
                      </Link>
                    </Button>
                  </div>
                </section>
              )}

              {/* Tab: Cài đặt */}
              {activeTab === 'settings' && (
                <section className="space-y-8">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                      <User className="h-5 w-5" />
                      Thông tin cá nhân
                    </h2>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">Tên đăng nhập</dt>
                        <dd className="font-medium mt-1">{user?.name ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Email</dt>
                        <dd className="font-medium mt-1">{user?.email ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Mã tài khoản</dt>
                        <dd className="font-mono text-sm mt-1">{user?.id ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Vai trò</dt>
                        <dd className="mt-1">{user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</dd>
                      </div>
                    </dl>
                    <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                      Để thay đổi thông tin cá nhân, vui lòng liên hệ{' '}
                      {store.supportEmail ? (
                        <a href={`mailto:${store.supportEmail}`} className="text-primary hover:underline">{store.supportEmail}</a>
                      ) : (
                        'bộ phận hỗ trợ'
                      )}.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                      <Bell className="h-5 w-5" />
                      Tùy chọn thông báo
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      Nhận email về đơn hàng và tin khuyến mãi (lưu trên thiết bị này).
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div>
                          <Label className="font-medium">Email thông báo đơn hàng</Label>
                          <p className="text-sm text-muted-foreground mt-0.5">Cập nhật trạng thái đơn, xác nhận đặt hàng</p>
                        </div>
                        <Switch
                          checked={notifyPrefs.emailOrders}
                          onCheckedChange={(v) => handleNotifyPrefChange('emailOrders', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div>
                          <Label className="font-medium">Email khuyến mãi</Label>
                          <p className="text-sm text-muted-foreground mt-0.5">Tin giảm giá, bộ sưu tập mới</p>
                        </div>
                        <Switch
                          checked={notifyPrefs.emailPromo}
                          onCheckedChange={(v) => handleNotifyPrefChange('emailPromo', v)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                      <Lock className="h-5 w-5" />
                      Đổi mật khẩu
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      Tính năng đổi mật khẩu đang được cập nhật. Nếu bạn cần đổi mật khẩu, vui lòng liên hệ chúng tôi.
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {store.supportEmail && (
                        <a href={`mailto:${store.supportEmail}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                          <Mail className="h-4 w-4" />
                          {store.supportEmail}
                        </a>
                      )}
                      {store.supportEmail && store.hotline && <span>hoặc</span>}
                      {store.hotline && (
                        <a href={`tel:${store.hotline.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                          <Phone className="h-4 w-4" />
                          {store.hotline}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5" />
                      Liên hệ & Hỗ trợ
                    </h2>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <Link to="/contact" className="text-primary hover:underline">Trang Liên hệ</Link>
                      </li>
                      <li>
                        <Link to="/faq" className="text-primary hover:underline">Câu hỏi thường gặp</Link>
                      </li>
                    </ul>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
