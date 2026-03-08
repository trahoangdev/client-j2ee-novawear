import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Heart, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { productsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAppSettingsReadOnly } from '@/context/AppSettingsContext';


const navLinks = [
  { to: '/shop', label: 'Bộ Sưu Tập' },
  { to: '/nam', label: 'Nam' },
  { to: '/nu', label: 'Nữ' },
  { to: '/unisex', label: 'Unisex' },
];

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_SUGGESTIONS_SIZE = 6;

function BrandName({ name }: { name: string }) {
  if (name === 'NOVAWEAR') {
    return <>NOVA<span className="text-primary">WEAR</span></>;
  }
  return <span>{name}</span>;
}

function GenderMenu({ gender, label, isActive, path }: { gender: string; label: string; isActive: boolean; path: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
      timeoutRef.current = null;
    }, 250);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <DropdownMenu open={open} onOpenChange={(v) => { if (!v && timeoutRef.current) return; setOpen(v); }}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={() => navigate(path)}
            className={cn(
              'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none',
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            {label}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-auto min-w-[180px] p-4 rounded-xl shadow-soft-lg"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sideOffset={2}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground mb-2">{label}</h4>
            <Link
              to={path}
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Xem tất cả
            </Link>
            <Link
              to={`${path}?isNew=true`}
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Hàng Mới Về
            </Link>
            <Link
              to={`${path}?bestseller=true`}
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Bán Chạy Nhất
            </Link>
            <Link
              to={`${path}?onSale=true`}
              className="block text-sm text-destructive hover:underline transition-colors font-medium"
            >
              Đang Khuyến Mãi
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function Header() {
  const { store } = useAppSettingsReadOnly();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductDisplay[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
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

  // Gợi ý sản phẩm khi nhập (debounce)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchLoading(true);
      productsApi
        .list({ search: q, page: 0, size: SEARCH_SUGGESTIONS_SIZE })
        .then(({ data }) => setSearchResults(data.content.map(productDtoToDisplay)))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Click outside đóng dropdown (không đóng cả ô search)
  useEffect(() => {
    if (!isSearchOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/shop?search=${encodeURIComponent(q)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleAuthClick = (mode: 'login' | 'register') => {
    navigate(mode === 'login' ? '/login' : '/register');
  };

  const isActive = (path: string) => {
    if (path === '/shop') return location.pathname === '/shop' && !location.search;
    if (path.startsWith('/shop?')) {
      const query = path.split('?')[1] ?? '';
      return location.pathname === '/shop' && location.search.includes(query);
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
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
              <BrandName name={store.storeName || 'NOVAWEAR'} />
            </h1>
          </Link>

          {/* Desktop Navigation with active state */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Menu chính">
            <Link
              to="/shop"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive('/shop')
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              Bộ Sưu Tập
            </Link>
            <GenderMenu gender="MALE" label="Nam" isActive={isActive('/nam')} path="/nam" />
            <GenderMenu gender="FEMALE" label="Nữ" isActive={isActive('/nu')} path="/nu" />
            <GenderMenu gender="UNISEX" label="Unisex" isActive={isActive('/unisex')} path="/unisex" />
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search - expandable + gợi ý sản phẩm ngay bên dưới */}
            <div className="relative flex items-center" ref={searchContainerRef}>
              {isSearchOpen ? (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-[min(100vw-2rem,22rem)]">
                  <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-1 bg-background border border-border rounded-xl px-2 py-1.5 shadow-soft-lg animate-scale-in"
                  >
                    <Input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Tìm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Escape' && (closeSearch(), searchInputRef.current?.blur())}
                      className="w-full min-w-0 border-0 bg-transparent focus-visible:ring-0 h-9 flex-1"
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
                      onClick={closeSearch}
                      aria-label="Đóng tìm kiếm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                  {/* Danh sách gợi ý ngay dưới thanh search */}
                  {(searchLoading || searchResults.length > 0) && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-soft-lg overflow-hidden max-h-[min(70vh,20rem)] overflow-y-auto">
                      {searchLoading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <ul className="py-1">
                          {searchResults.map((p) => (
                            <li key={p.id}>
                              <Link
                                to={`/product/${p.id}`}
                                onClick={closeSearch}
                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/80 transition-colors"
                              >
                                <div className="h-12 w-12 rounded-lg bg-muted shrink-0 overflow-hidden">
                                  {p.images[0] ? (
                                    <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-sm truncate">{p.name}</p>
                                  <p className="text-primary text-sm font-semibold">{formatCurrency(p.price)}</p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
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

            <Button variant="ghost" size="icon" className="relative h-10 w-10 md:h-11 md:w-11 rounded-lg hover:bg-primary/10 tap-target shrink-0" asChild>
              <Link to="/wishlist" aria-label={`Yêu thích, ${wishlistCount} sản phẩm`}>
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
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
              asChild
            >
              <Link to="/cart" aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}>
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
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
