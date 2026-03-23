import { useState } from 'react';
import { X, Facebook, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { GoogleLogin } from '@react-oauth/google';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, login, googleLogin, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email hoặc username';
    } else if (authMode === 'register' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Username (only for register)
    if (authMode === 'register') {
      if (!name.trim()) {
        errors.name = 'Vui lòng nhập tên đăng nhập';
      } else if (name.trim().length < 2) {
        errors.name = 'Tên đăng nhập phải có ít nhất 2 ký tự';
      } else if (!/^[a-zA-Z0-9_]+$/.test(name.trim())) {
        errors.name = 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      toast.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }

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
    setFieldErrors({});
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleModeSwitch = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setError('');
    setFieldErrors({});
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
          <div className="flex justify-center mb-6">
            <GoogleLogin
                onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                        setIsLoading(true);
                        const result = await googleLogin(credentialResponse.credential);
                        if (result.ok) {
                            toast.success(`Đăng ${authMode === 'login' ? 'nhập' : 'ký'} thành công`);
                            handleClose();
                        } else {
                            toast.error(`Đăng ${authMode === 'login' ? 'nhập' : 'ký'} Google thất bại`);
                        }
                        setIsLoading(false);
                    }
                }}
                onError={() => {
                    toast.error(`Đăng ${authMode === 'login' ? 'nhập' : 'ký'} Google thất bại`);
                }}
            />
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {authMode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Tên đăng nhập *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="username"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                  className={`h-11 ${fieldErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-destructive">{fieldErrors.name}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="text"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                className={`h-11 ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {fieldErrors.email ? (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              ) : authMode === 'login' ? (
                <p className="text-xs text-muted-foreground">
                  Dùng email hoặc username
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                  className={`h-11 pr-10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
              {fieldErrors.password ? (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              ) : authMode === 'register' ? (
                <p className="text-xs text-muted-foreground">
                  Tối thiểu 6 ký tự
                </p>
              ) : null}
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
                  onClick={() => handleModeSwitch('register')}
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
                  onClick={() => handleModeSwitch('login')}
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
