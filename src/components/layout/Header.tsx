import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Heart, Loader2, ChevronDown, Bell, ArrowRight } from 'lucide-react';
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
import { productsApi, notificationsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';
import { formatCurrency, cn } from '@/lib/utils';
import { useAppSettingsReadOnly } from '@/context/AppSettingsContext';
import { AnimatePresence, motion } from 'framer-motion';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_SUGGESTIONS_SIZE = 6;

function TopAnnouncement() {
  return (
    <div className="bg-foreground text-background text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 tracking-wide z-50 relative">
      <motion.span 
        animate={{ scale: [1, 1.2, 1] }} 
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        ✨
      </motion.span> 
      <span>MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO ĐƠN HÀNG TỪ 500K</span>
    </div>
  );
}

function BrandName({ name }: { name: string }) {
  if (name === 'NOVAWEAR') {
    return <span className="tracking-tighter font-extrabold uppercase text-2xl lg:text-3xl">NOVA<span className="text-primary">WEAR</span></span>;
  }
  return <span className="tracking-tighter font-extrabold uppercase text-2xl lg:text-3xl">{name}</span>;
}

function NavLink({ to, label, isActive }: { to: string, label: string, isActive: boolean }) {
  return (
    <Link to={to} className="relative px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors group">
      {label}
      {isActive && (
        <motion.div 
          layoutId="header-active-tab" 
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" 
          initial={false} 
          animate={{ opacity: 1 }} 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      {!isActive && (
         <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
      )}
    </Link>
  );
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
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative group"
    >
      <DropdownMenu open={open} onOpenChange={(v) => { if (!v && timeoutRef.current) return; setOpen(v); }}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={() => navigate(path)}
            className="relative px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1 focus:outline-none"
          >
            {label}
            <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", open && "rotate-180")} />
            {isActive && (
              <motion.div layoutId="header-active-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" initial={false} />
            )}
             {!isActive && (
               <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
             )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 p-2 rounded-xl border border-border/40 bg-background/80 backdrop-blur-2xl shadow-2xl z-50 mb-1"
          sideOffset={14}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-1 space-y-1">
             <h4 className="font-bold text-sm text-foreground mb-3 px-2 mt-1 flex items-center justify-between">
               {label} <ArrowRight className="h-4 w-4 text-muted-foreground" />
             </h4>
             <Link to={path} className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-colors">
               Xem tất cả
             </Link>
             <Link to={`${path}?isNew=true`} className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-colors">
               Hàng Mới Về
             </Link>
             <Link to={`${path}?bestseller=true`} className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-colors">
               Bán Chạy Nhất
             </Link>
             <Link to={`${path}?onSale=true`} className="flex items-center w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors rounded-lg">
               Đang Khuyến Mãi
             </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function NotificationDropdown({ unreadCount, setUnreadCount }: { unreadCount: number, setUnreadCount: React.Dispatch<React.SetStateAction<number>> }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<import('@/types/api').NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = () => {
    setLoading(true);
    notificationsApi.list({ page: 0, size: 5 })
      .then(({ data }) => setNotifications(data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && notifications.length === 0) {
      fetchNotifs();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground">
          <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-[2px] right-[2px] min-w-5 h-5 px-1 rounded-full bg-red-500 border-[2px] border-background text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-sm"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] rounded-2xl shadow-2xl p-0 border border-border/40 bg-background/95 backdrop-blur-md overflow-hidden z-50">
        <div className="px-4 py-3 bg-muted/40 border-b border-border/40 flex items-center justify-between">
          <h4 className="font-bold text-sm text-foreground">Thông Báo Mới</h4>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-2.5 py-0.5 rounded-full">{unreadCount} chưa đọc</span>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="flex justify-center p-6 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
              <Bell className="w-8 h-8 opacity-20 mb-2" />
              Bạn chưa có thông báo nào.
            </div>
          ) : (
            <ul className="divide-y divide-border/30">
              {notifications.map((notif) => (
                <li key={notif.id} className={cn("p-4 hover:bg-muted/50 transition-colors cursor-pointer", !notif.isRead && "bg-primary/5")}>
                 <Link to={notif.linkTo || '/notifications'} onClick={() => setOpen(false)} className="flex gap-3">
                   <div className="mt-0.5 relative shrink-0">
                     <div className={cn("w-2 h-2 rounded-full absolute -top-1 -right-1", !notif.isRead ? "bg-primary" : "hidden")} />
                     <div className="p-2 bg-background border border-border shadow-sm rounded-full text-primary">
                        <Bell className="w-4 h-4" />
                     </div>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className={cn("text-sm line-clamp-2", !notif.isRead ? "font-bold text-foreground" : "font-medium text-foreground/80")}>{notif.title}</p>
                     <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{notif.message}</p>
                     <p className="text-[10px] text-muted-foreground/60 mt-2 font-bold uppercase">{new Date(notif.createdAt).toLocaleDateString()}</p>
                   </div>
                 </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-2 border-t border-border/40 bg-muted/20">
          <Button asChild variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary/10 transition-colors h-10">
            <Link to="/profile#notifications" onClick={() => setOpen(false)}>Xem tất cả thông báo <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return; }
    notificationsApi.unreadCount()
      .then(({ data }) => setUnreadCount(data.count))
      .catch(() => {});
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  useEffect(() => {
    if (!isSearchOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
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
    <>
      <TopAnnouncement />
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4">
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden tap-target rounded-full hover:bg-muted"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Mở menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              <BrandName name={store.storeName || 'NOVAWEAR'} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center space-x-2 flex-1 relative top-[2px]" aria-label="Menu chính">
              <NavLink to="/shop" label="Bộ Sưu Tập" isActive={isActive('/shop')} />
              <GenderMenu gender="MALE" label="Nam" isActive={isActive('/nam')} path="/nam" />
              <GenderMenu gender="FEMALE" label="Nữ" isActive={isActive('/nu')} path="/nu" />
              <GenderMenu gender="UNISEX" label="Unisex" isActive={isActive('/unisex')} path="/unisex" />
              <NavLink to="/bundles" label="Combo" isActive={isActive('/bundles')} />
              <div className="relative flex items-center h-full">
                <NavLink to="/flash-sale" label="Flash Sale" isActive={isActive('/flash-sale')} />
                <span className="absolute -top-1 right-0 sm:-right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 lg:gap-3 flex-1 md:flex-none relative">
              
              {/* Search Box */}
              <div className="flex items-center justify-end" ref={searchContainerRef}>
                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.div
                      key="search-input"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "100%", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-full sm:w-[24rem] md:w-[30rem] lg:w-[35rem] max-w-[calc(100vw-2rem)]"
                    >
                      <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2 bg-background border-2 border-primary rounded-full px-4 py-2 shadow-2xl animate-in relative"
                      >
                        <Search className="h-5 w-5 text-primary shrink-0" />
                        <Input
                          ref={searchInputRef}
                          type="search"
                          placeholder="Nhập tên sản phẩm để tìm kiếm..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                          className="w-full border-0 bg-transparent focus-visible:ring-0 shadow-none px-0 h-8 sm:h-9 text-base"
                        />
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full shrink-0 hover:bg-muted text-muted-foreground" onClick={closeSearch}>
                          <X className="h-5 w-5" />
                        </Button>
                      </form>
                      
                      {/* Search Suggestions */}
                      <AnimatePresence>
                        {(searchLoading || searchResults.length > 0) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 right-0 top-[calc(100%+12px)] bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto"
                          >
                            {searchLoading ? (
                              <div className="flex items-center justify-center py-12 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                              </div>
                            ) : (
                              <div className="p-2">
                                <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sản Phẩm Đề Xuất</h4>
                                <ul className="space-y-1">
                                  {searchResults.map((p) => (
                                    <li key={p.id}>
                                      <Link
                                        to={`/product/${p.id}`}
                                        onClick={closeSearch}
                                        className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-muted transition-colors group"
                                      >
                                        <div className="h-14 w-14 rounded-lg bg-muted shrink-0 overflow-hidden border border-border/50">
                                          {p.images[0] ? (
                                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                          ) : (
                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs" />
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                                          <p className="font-medium text-[15px] sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">{p.name}</p>
                                          <p className="text-muted-foreground font-semibold mt-1 text-sm">{formatCurrency(p.price)}</p>
                                        </div>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="search-icon"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-colors custom-focus"
                      onClick={() => setIsSearchOpen(true)}
                      aria-label="Mở tìm kiếm"
                    >
                      <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist Icon */}
              <Button asChild variant="ghost" size="icon" className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground hidden sm:flex">
                <Link to="/wishlist" aria-label={`Yêu thích, ${wishlistCount} sản phẩm`}>
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-[2px] right-[2px] min-w-5 h-5 px-1 rounded-full bg-destructive border-[2px] border-background text-destructive-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-sm">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* User Dropdown / Auth Icons */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-border" />
                      ) : (
                        <User className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-2xl p-2 border border-border/40 bg-background/95 backdrop-blur-md">
                    <div className="px-3 py-3 rounded-lg bg-muted/50 mb-2">
                      <p className="font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg focus:bg-primary/10 focus:text-primary">
                      <Link to="/profile">Hồ Sơ Cá Nhân</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg focus:bg-primary/10 focus:text-primary">
                      <Link to="/orders">Quản Lý Đơn Hàng</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg focus:bg-primary/10 focus:text-primary sm:hidden">
                      <Link to="/wishlist">Danh Sách Yêu Thích</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg focus:bg-primary focus:text-primary-foreground text-primary focus:text-primary font-medium">
                          <Link to="/admin">Trang Quản Trị</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer py-2.5 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive">
                      Đăng Xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground"
                  onClick={() => handleAuthClick('login')}
                  aria-label="Đăng nhập"
                >
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              )}

              {/* Header Notifications */}
              {isAuthenticated && (
                <NotificationDropdown unreadCount={unreadCount} setUnreadCount={setUnreadCount} />
              )}

              {/* Cart Bag */}
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground"
              >
                <Link to="/cart" aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}>
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                  {itemCount > 0 && (
                    <motion.span 
                      key={itemCount}
                      initial={{ scale: 0.5, y: -5 }}
                      animate={{ scale: 1, y: 0 }}
                      className="absolute top-[2px] right-[2px] min-w-5 h-5 px-1 rounded-full bg-primary border-[2px] border-background text-primary-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-sm"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-background z-[70] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 flex items-center justify-between border-b border-border/40 bg-muted/30">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <BrandName name={store.storeName || 'NOVAWEAR'} />
                </Link>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">Menu Khám Phá</div>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3.5 rounded-2xl font-semibold text-foreground/90 hover:bg-muted hover:text-foreground transition-all">Bộ Sưu Tập</Link>
                <Link to="/nam" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3.5 rounded-2xl font-semibold text-foreground/90 hover:bg-muted hover:text-foreground transition-all">Thời Trang Nam</Link>
                <Link to="/nu" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3.5 rounded-2xl font-semibold text-foreground/90 hover:bg-muted hover:text-foreground transition-all">Thời Trang Nữ</Link>
                <Link to="/unisex" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3.5 rounded-2xl font-semibold text-foreground/90 hover:bg-muted hover:text-foreground transition-all">Unisex Bộ Phối</Link>
                <Link to="/bundles" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3.5 rounded-2xl font-semibold text-foreground/90 hover:bg-muted hover:text-foreground transition-all">Combo Đặc Biệt</Link>
                <Link to="/flash-sale" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3.5 rounded-2xl font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all mt-6 shadow-sm">🔥 Flash Sale</Link>
              </div>

              {!isAuthenticated && (
                <div className="p-5 border-t border-border/40 bg-background space-y-3 pb-8">
                  <Button className="w-full rounded-2xl h-14 text-[15px] font-bold shadow-md" onClick={() => { handleAuthClick('login'); setIsMobileMenuOpen(false); }}>
                    Đăng Nhập
                  </Button>
                  <Button variant="outline" className="w-full rounded-2xl h-14 text-[15px] font-bold border-2" onClick={() => { handleAuthClick('register'); setIsMobileMenuOpen(false); }}>
                    Đăng Ký
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
