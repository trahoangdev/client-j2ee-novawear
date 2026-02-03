import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/shop', label: 'Bộ Sưu Tập' },
  { to: '/shop?category=tops', label: 'Áo' },
  { to: '/shop?category=pants', label: 'Quần' },
  { to: '/shop?category=dresses', label: 'Váy' },
  { to: '/shop?category=accessories', label: 'Phụ Kiện' },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toggleCart, itemCount } = useCart();
  const { isAuthenticated, user, logout, setShowAuthModal, setAuthMode, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/shop?search=${encodeURIComponent(q)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const isActive = (path: string) => {
    if (path === '/shop') return location.pathname === '/shop' && !location.search;
    if (path.startsWith('/shop?')) {
      const query = path.split('?')[1] ?? '';
      return location.pathname === '/shop' && location.search.includes(query);
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/60 supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 md:h-[4.5rem] items-center justify-between gap-3">
          {/* Mobile Menu Button - tap target */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden tap-target h-11 w-11 rounded-lg"
            aria-label="Menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              NOVA<span className="text-primary">WEAR</span>
            </h1>
          </Link>

          {/* Desktop Navigation with active state */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Menu chính">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(to)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search - expandable */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 bg-background border border-border rounded-xl px-2 py-1.5 shadow-soft-lg animate-scale-in"
                >
                  <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Tìm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && (setIsSearchOpen(false), searchInputRef.current?.blur())}
                    className="w-40 sm:w-52 md:w-64 border-0 bg-transparent focus-visible:ring-0 h-9"
                    aria-label="Tìm kiếm"
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                    aria-label="Đóng tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 md:h-11 md:w-11 rounded-lg hover:bg-primary/10 tap-target"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Mở tìm kiếm"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            <Button variant="ghost" size="icon" className="hidden md:flex h-10 w-10 rounded-lg hover:bg-primary/10 tap-target" aria-label="Yêu thích">
              <Heart className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-lg hover:bg-primary/10 tap-target" aria-label="Tài khoản">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-soft-lg">
                  <div className="px-3 py-2.5">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Tài Khoản</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">Đơn Hàng</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="text-primary font-medium">Quản Trị</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Đăng Xuất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 md:h-11 md:w-11 rounded-lg hover:bg-primary/10 tap-target"
                onClick={() => handleAuthClick('login')}
                aria-label="Đăng nhập"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 md:h-11 md:w-11 rounded-lg hover:bg-primary/10 tap-target"
              onClick={toggleCart}
              aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - slide down */}
      <div
        className={cn(
          'md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-soft-lg overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
          isMobileMenuOpen ? 'max-h-[min(80vh,28rem)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        )}
        role="navigation"
        aria-label="Menu di động"
      >
        <nav className="container py-4 flex flex-col gap-0.5">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'px-4 py-3.5 text-sm font-medium rounded-lg transition-colors',
                isActive(to) ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="flex gap-2 px-4 pt-4 mt-2 border-t border-border">
              <Button variant="outline" className="flex-1 h-11" onClick={() => { handleAuthClick('login'); setIsMobileMenuOpen(false); }}>
                Đăng Nhập
              </Button>
              <Button className="flex-1 h-11 bg-primary hover:bg-primary/90" onClick={() => { handleAuthClick('register'); setIsMobileMenuOpen(false); }}>
                Đăng Ký
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
