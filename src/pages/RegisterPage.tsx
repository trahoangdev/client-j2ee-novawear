import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';

export function RegisterPage() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate('/', { replace: true });
        return null;
    }

    const clearFieldError = (field: string) => {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!name.trim()) {
            errors.name = 'Vui lòng nhập tên đăng nhập';
        } else if (name.trim().length < 2) {
            errors.name = 'Tên đăng nhập phải có ít nhất 2 ký tự';
        } else if (!/^[a-zA-Z0-9_]+$/.test(name.trim())) {
            errors.name = 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
        }

        if (!email.trim()) {
            errors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = 'Email không hợp lệ';
        }

        if (!password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        } else if (password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (confirmPassword !== password) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            toast.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsLoading(true);

        const result = await register(name.trim(), email.trim(), password);
        if (result.ok) {
            toast.success('Đăng ký thành công! Chào mừng bạn đến với NOVAWEAR');
            navigate('/', { replace: true });
        } else {
            setError('Đăng ký thất bại. Username hoặc email đã tồn tại.');
            toast.error('Đăng ký thất bại. Username hoặc email đã tồn tại.');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Back button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại trang chủ
                </Link>

                <div className="bg-background/80 backdrop-blur-xl rounded-2xl shadow-elevated p-6 md:p-8 border border-border/50">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <Link to="/" className="inline-block mb-4">
                            <h1 className="font-display text-2xl font-bold">
                                NOVA<span className="text-primary">WEAR</span>
                            </h1>
                        </Link>
                        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                            Đăng Ký
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Tạo tài khoản để mua sắm dễ dàng hơn
                        </p>
                    </div>

                    {/* Social Login */}
                    <div className="space-y-3 mb-6">
                        <Button variant="outline" className="w-full h-11 gap-2" type="button">
                            <Facebook className="h-5 w-5 text-blue-600" />
                            Tiếp tục với Facebook
                        </Button>
                        <Button variant="outline" className="w-full h-11 gap-2" type="button">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Tiếp tục với Google
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
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                                className={`h-11 ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            />
                            {fieldErrors.email && (
                                <p className="text-sm text-destructive">{fieldErrors.email}</p>
                            )}
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
                            ) : (
                                <p className="text-xs text-muted-foreground">Tối thiểu 6 ký tự</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                                className={`h-11 ${fieldErrors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            />
                            {fieldErrors.confirmPassword && (
                                <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
                            )}
                        </div>

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
                            ) : (
                                'Tạo Tài Khoản'
                            )}
                        </Button>
                    </form>

                    {/* Switch to Login */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
