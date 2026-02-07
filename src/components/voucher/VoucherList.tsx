import { useState, useEffect } from 'react';
import { voucherApi } from '../../services/voucherApi';
import { VoucherDto } from '../../types/api';
import { TicketPercent, Loader2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VoucherListProps {
    orderTotal?: number;
    onSelectVoucher?: (voucher: VoucherDto) => void;
}

const VoucherList = ({ orderTotal, onSelectVoucher }: VoucherListProps) => {
    const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchVouchers();
    }, [orderTotal]);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await voucherApi.getAvailable(orderTotal);
            setVouchers(res.data);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách voucher');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const getDiscountDisplay = (v: VoucherDto) => {
        if (v.discountDisplay) return v.discountDisplay;
        return v.discountType === 'PERCENT'
            ? `Giảm ${v.discountValue}%`
            : `Giảm ${formatCurrency(v.discountValue)}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang tải voucher...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-4 px-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                {error}
            </div>
        );
    }

    if (vouchers.length === 0) {
        return (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
                <TicketPercent className="h-12 w-12 mb-2 opacity-40" />
                <p>Chưa có voucher khả dụng</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Voucher dành cho bạn
            </h3>
            <div className="space-y-3">
                {vouchers.map((v) => (
                    <div
                        key={v.id}
                        className={cn(
                            "flex items-stretch rounded-xl border overflow-hidden transition-all cursor-pointer",
                            v.isValid
                                ? "border-border hover:border-primary hover:shadow-soft"
                                : "border-border/50 opacity-60 cursor-not-allowed"
                        )}
                        onClick={() => v.isValid && onSelectVoucher?.(v)}
                    >
                        {/* Left side - Discount */}
                        <div className="flex flex-col justify-center items-center min-w-[100px] p-3 bg-primary text-primary-foreground text-center relative">
                            <div className="font-display font-bold text-sm leading-tight">
                                {getDiscountDisplay(v)}
                            </div>
                            {v.maxDiscount && v.discountType === 'PERCENT' && (
                                <div className="text-xs opacity-80 mt-0.5">
                                    Tối đa {formatCurrency(v.maxDiscount)}
                                </div>
                            )}
                            {/* Decorative circle */}
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background" />
                        </div>

                        {/* Right side - Info */}
                        <div className="flex-1 p-3 bg-card">
                            <div className="font-mono font-bold text-sm text-foreground">
                                {v.code}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {v.description}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                                {v.minOrderValue && v.minOrderValue > 0 && (
                                    <span>Đơn tối thiểu {formatCurrency(v.minOrderValue)}</span>
                                )}
                                {v.endDate && (
                                    <span className="text-destructive">
                                        HSD: {formatDate(v.endDate)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Use button */}
                        {onSelectVoucher && v.isValid && (
                            <div className="flex items-center px-3 bg-card border-l border-border">
                                <Button size="sm" variant="outline" className="text-xs">
                                    Dùng
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoucherList;
