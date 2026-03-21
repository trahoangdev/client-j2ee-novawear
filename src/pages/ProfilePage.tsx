import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
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
  Eye,
  EyeOff,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAppSettingsReadOnly } from '@/context/AppSettingsContext';
import { toast } from '@/lib/toast';
import { ordersApi, authApi } from '@/lib/customerApi';
import { OrderCard } from '@/components/orders/OrderCard';
import { cn } from '@/lib/utils';
import type { OrderDto, Page } from '@/types/api';
import { SEO } from '@/components/SEO';

import { NotificationsTab } from '@/components/profile/NotificationsTab';

type ProfileTab = 'overview' | 'orders' | 'wishlist' | 'settings' | 'notifications';

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
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const { store } = useAppSettingsReadOnly();
  const { count: wishlistCount } = useWishlist();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    return location.hash === '#notifications' ? 'notifications' : 'overview';
  });

  useEffect(() => {
    if (location.hash === '#notifications') {
      setActiveTab('notifications');
    }
  }, [location.hash]);
  const [notifyPrefs, setNotifyPrefsState] = useState(() =>
    user?.id != null ? getNotifyPrefs(user.id) : { emailOrders: true, emailPromo: false }
  );
  const [ordersPage, setOrdersPage] = useState<Page<OrderDto> | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderDto>>({});

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.email.trim()) {
      toast.error('Email không được để trống');
      return;
    }
    setProfileLoading(true);
    try {
      await authApi.updateProfile(profileForm);
      await refreshUser();
      setIsEditingProfile(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Cập nhật thất bại';
      toast.error(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword(pwForm);
      toast.success('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPw(false);
      setShowNewPw(false);
      setShowConfirmPw(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Đổi mật khẩu thất bại';
      toast.error(msg);
    } finally {
      setPwLoading(false);
    }
  };

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
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'wishlist', label: 'Yêu thích', icon: Heart },
    { id: 'settings', label: 'Cài đặt tài khoản', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Tài Khoản" description="Quản lý tài khoản của bạn tại NOVAWEAR." url="/profile" noindex />
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
                        <h2 className="font-semibold text-xl truncate">{user?.fullName || user?.name || '—'}</h2>
                        {user?.fullName && (
                          <p className="text-sm text-muted-foreground">@{user.name}</p>
                        )}
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{user?.email ?? '—'}</span>
                        </p>
                        {user?.phone && (
                          <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Phone className="h-4 w-4 shrink-0" />
                            <span>{user.phone}</span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 font-mono">
                          Mã KH: {user?.id != null ? String((Number(user.id) * 9301 + 49297) % 10000).padStart(4, '0') : '—'}
                        </p>
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
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Thông tin cá nhân
                      </h2>
                      {!isEditingProfile ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                          <Pencil className="h-4 w-4 mr-1.5" />
                          Chỉnh sửa
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-1.5" />
                          Hủy
                        </Button>
                      )}
                    </div>

                    {!isEditingProfile ? (
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm text-muted-foreground">Tên đăng nhập</dt>
                          <dd className="font-medium mt-1">{user?.name ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Họ và tên</dt>
                          <dd className="font-medium mt-1">{user?.fullName || <span className="text-muted-foreground italic">Chưa cập nhật</span>}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Email</dt>
                          <dd className="font-medium mt-1">{user?.email ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Số điện thoại</dt>
                          <dd className="font-medium mt-1">{user?.phone || <span className="text-muted-foreground italic">Chưa cập nhật</span>}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Địa chỉ</dt>
                          <dd className="font-medium mt-1">{user?.address || <span className="text-muted-foreground italic">Chưa cập nhật</span>}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Mã tài khoản</dt>
                          <dd className="font-mono text-sm mt-1">{user?.id != null ? String((Number(user.id) * 9301 + 49297) % 10000).padStart(4, '0') : '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Vai trò</dt>
                          <dd className="mt-1">{user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</dd>
                        </div>
                      </dl>
                    ) : (
                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="profileFullName">Họ và tên</Label>
                          <Input
                            id="profileFullName"
                            placeholder="Nhập họ và tên"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                            maxLength={100}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="profileEmail">Email</Label>
                          <Input
                            id="profileEmail"
                            type="email"
                            placeholder="Nhập email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="profilePhone">Số điện thoại</Label>
                          <Input
                            id="profilePhone"
                            type="tel"
                            placeholder="Nhập số điện thoại"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            maxLength={20}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="profileAddress">Địa chỉ</Label>
                          <Input
                            id="profileAddress"
                            placeholder="Nhập địa chỉ"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                            maxLength={500}
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="submit" disabled={profileLoading}>
                            {profileLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Lưu thay đổi
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCancelEdit}>
                            Hủy
                          </Button>
                        </div>
                      </form>
                    )}
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
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPw ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu hiện tại"
                            value={pwForm.currentPassword}
                            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                            required
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            tabIndex={-1}
                          >
                            {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPw ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            value={pwForm.newPassword}
                            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                            required
                            minLength={6}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowNewPw(!showNewPw)}
                            tabIndex={-1}
                          >
                            {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPw ? 'text' : 'password'}
                            placeholder="Nhập lại mật khẩu mới"
                            value={pwForm.confirmPassword}
                            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                            required
                            minLength={6}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                            tabIndex={-1}
                          >
                            {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" disabled={pwLoading} className="w-full sm:w-auto">
                        {pwLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Đổi mật khẩu
                      </Button>
                    </form>
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

              {/* Tab: Thông báo */}
              {activeTab === 'notifications' && (
                <NotificationsTab />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
