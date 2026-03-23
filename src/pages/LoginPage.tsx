import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { SEO } from '@/components/SEO';
import { GoogleLogin } from '@react-oauth/google';

export function LoginPage() {
    const navigate = useNavigate();
    const { login, googleLogin, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

        if (!email.trim()) {
            errors.email = 'Vui lòng nhập email hoặc username';
        }

        if (!password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        } else if (password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
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

        const result = await login(email, password);
        if (result.ok) {
            toast.success('Đăng nhập thành công');
            navigate('/', { replace: true });
        } else {
            setError('Email/username hoặc mật khẩu không đúng');
            toast.error('Email/username hoặc mật khẩu không đúng');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
            <SEO title="Đăng Nhập" description="Đăng nhập tài khoản NOVAWEAR để mua sắm và theo dõi đơn hàng." url="/login" noindex />
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
                            Đăng Nhập
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Chào mừng bạn quay trở lại!
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
                                        toast.success('Đăng nhập thành công');
                                        navigate('/', { replace: true });
                                    } else {
                                        toast.error('Đăng nhập Google thất bại');
                                    }
                                    setIsLoading(false);
                                }
                            }}
                            onError={() => {
                                toast.error('Đăng nhập Google thất bại');
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
                        <div className="space-y-2">
                            <Label htmlFor="email">Email hoặc Username *</Label>
                            <Input
                                id="email"
                                type="text"
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
                            {fieldErrors.password && (
                                <p className="text-sm text-destructive">{fieldErrors.password}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                Quên mật khẩu?
                            </Link>
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
                                'Đăng Nhập'
                            )}
                        </Button>
                    </form>

                    {/* Switch to Register */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-primary hover:underline font-medium">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
