import { useState } from 'react';
import { X, Facebook, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (authMode === 'login') {
      const result = await login(email, password);
      if (result.ok) {
        toast.success('Đăng nhập thành công');
      } else {
        setError('Email/username hoặc mật khẩu không đúng');
        toast.error('Email/username hoặc mật khẩu không đúng');
      }
    } else {
      const result = await register(name.trim() || email, email, password);
      if (result.ok) {
        toast.success('Đăng ký thành công');
      } else {
        setError('Đăng ký thất bại. Kiểm tra username/email hoặc thử lại.');
        toast.error('Đăng ký thất bại. Kiểm tra username/email hoặc thử lại.');
      }
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setShowAuthModal(false);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  if (!showAuthModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 animate-fade-up"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
        <div className="bg-background rounded-2xl shadow-elevated p-6 md:p-8 m-4 animate-scale-in">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              {authMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {authMode === 'login'
                ? 'Chào mừng bạn quay trở lại!'
                : 'Tạo tài khoản để mua sắm dễ dàng hơn'}
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full h-11 gap-2"
              type="button"
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              Tiếp tục với Facebook
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 gap-2 text-green-600 border-green-200 hover:bg-green-50"
              type="button"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4a8 8 0 110 16 8 8 0 010-16z"/>
              </svg>
              Tiếp tục với Zalo
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">hoặc</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Tên đăng nhập</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  required
                  minLength={2}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
              {authMode === 'login' && (
                <p className="text-xs text-muted-foreground">
                  Dùng email hoặc username
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {authMode === 'register' && (
                <p className="text-xs text-muted-foreground">
                  Tối thiểu 6 ký tự
                </p>
              )}
            </div>

            {authMode === 'login' && (
              <div className="flex justify-end">
                <Button variant="link" className="px-0 text-sm h-auto" type="button">
                  Quên mật khẩu?
                </Button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : authMode === 'login' ? (
                'Đăng Nhập'
              ) : (
                'Tạo Tài Khoản'
              )}
            </Button>
          </form>

          {/* Switch Mode */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {authMode === 'login' ? (
              <>
                Chưa có tài khoản?{' '}
                <Button
                  variant="link"
                  className="px-0 text-primary h-auto"
                  onClick={() => setAuthMode('register')}
                >
                  Đăng ký ngay
                </Button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <Button
                  variant="link"
                  className="px-0 text-primary h-auto"
                  onClick={() => setAuthMode('login')}
                >
                  Đăng nhập
                </Button>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
