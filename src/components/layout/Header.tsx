import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleCart, itemCount } = useCart();
  const { isAuthenticated, user, logout, setShowAuthModal, setAuthMode, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-soft border-b border-border/50">
      <div className="container mx-auto">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              NOVA<span className="text-primary">WEAR</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/shop"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Bộ Sưu Tập
            </Link>
            <Link
              to="/shop?category=tops"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Áo
            </Link>
            <Link
              to="/shop?category=pants"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Quần
            </Link>
            <Link
              to="/shop?category=dresses"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Váy
            </Link>
            <Link
              to="/shop?category=accessories"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Phụ Kiện
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2">
                  <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1 shadow-soft animate-scale-in">
                    <Input
                      type="search"
                      placeholder="Tìm kiếm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 md:w-64 border-0 focus-visible:ring-0"
                      autoFocus
                    />
                    <Button type="submit" size="icon" variant="ghost">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="hover:bg-primary/10"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-primary/10">
              <Heart className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
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
                        <Link to="/admin" className="text-primary font-medium">
                          Quản Trị
                        </Link>
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
                onClick={() => handleAuthClick('login')}
                className="hover:bg-primary/10"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative hover:bg-primary/10"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center animate-scale-in">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-soft overflow-hidden transition-all duration-300',
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="container py-4 flex flex-col gap-2">
          <Link
            to="/shop"
            className="px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Bộ Sưu Tập
          </Link>
          <Link
            to="/shop?category=tops"
            className="px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Áo
          </Link>
          <Link
            to="/shop?category=pants"
            className="px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Quần
          </Link>
          <Link
            to="/shop?category=dresses"
            className="px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Váy
          </Link>
          <Link
            to="/shop?category=accessories"
            className="px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Phụ Kiện
          </Link>
          {!isAuthenticated && (
            <div className="flex gap-2 px-4 pt-2 border-t border-border mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  handleAuthClick('login');
                  setIsMobileMenuOpen(false);
                }}
              >
                Đăng Nhập
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  handleAuthClick('register');
                  setIsMobileMenuOpen(false);
                }}
              >
                Đăng Ký
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
