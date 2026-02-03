import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/admin' },
  { icon: Package, label: 'Sản phẩm', href: '/admin/products' },
  { icon: ShoppingCart, label: 'Đơn hàng', href: '/admin/orders' },
  { icon: Users, label: 'Khách hàng', href: '/admin/customers' },
  { icon: Star, label: 'Đánh giá', href: '/admin/reviews' },
  { icon: BarChart3, label: 'Thống kê', href: '/admin/analytics' },
  { icon: Settings, label: 'Cài đặt', href: '/admin/settings' },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-navy">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-navy-light border-r border-white/10 z-50 transition-all duration-300',
          isSidebarCollapsed ? 'w-20' : 'w-64',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
            {!isSidebarCollapsed && (
              <Link to="/" className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-white">
                  NOVA<span className="text-cyan">WEAR</span>
                </h1>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 hidden lg:flex"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              <ChevronRight
                className={cn(
                  'h-5 w-5 transition-transform',
                  isSidebarCollapsed && 'rotate-180'
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-cyan/20 text-cyan'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User */}
          <div className="p-4 border-t border-white/10">
            <div className={cn('flex items-center gap-3', isSidebarCollapsed && 'justify-center')}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'}
                alt={user?.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    {user?.email || 'admin@novawear.vn'}
                  </p>
                </div>
              )}
              {!isSidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/50 hover:text-white hover:bg-white/10"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-navy-light border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Xem cửa hàng
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
