import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { SEO } from '@/components/SEO';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const clearFieldError = (field: string) => {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!email.trim()) {
            errors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = 'Email không hợp lệ';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            toast.warning('Vui lòng nhập email hợp lệ');
            return;
        }

        setIsLoading(true);

        // Simulate API call - replace with actual API
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            // TODO: Call actual forgot password API
            // await authApi.forgotPassword(email);
            setIsSuccess(true);
            toast.success('Email đặt lại mật khẩu đã được gửi');
        } catch {
            setError('Không thể gửi email. Vui lòng thử lại sau.');
            toast.error('Không thể gửi email. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
            <SEO title="Quên Mật Khẩu" description="Khôi phục mật khẩu tài khoản NOVAWEAR của bạn." url="/forgot-password" noindex />
            {/* Background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Back button */}
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại đăng nhập
                </Link>

                <div className="bg-background/80 backdrop-blur-xl rounded-2xl shadow-elevated p-6 md:p-8 border border-border/50">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <Link to="/" className="inline-block mb-4">
                            <h1 className="font-display text-2xl font-bold">
                                NOVA<span className="text-primary">WEAR</span>
                            </h1>
                        </Link>

                        {isSuccess ? (
                            <>
                                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-success" />
                                </div>
                                <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                                    Kiểm Tra Email
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến
                                    <span className="block font-medium text-foreground mt-1">{email}</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                                    Quên Mật Khẩu?
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                                </p>
                            </>
                        )}
                    </div>

                    {isSuccess ? (
                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                className="w-full h-11"
                                onClick={() => {
                                    setIsSuccess(false);
                                    setEmail('');
                                }}
                            >
                                Gửi lại email
                            </Button>
                            <Button asChild className="w-full h-11 bg-primary hover:bg-primary/90">
                                <Link to="/login">Quay lại đăng nhập</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                                    'Gửi Email Đặt Lại'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Back to Login */}
                    {!isSuccess && (
                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Nhớ mật khẩu rồi?{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Đăng nhập
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
