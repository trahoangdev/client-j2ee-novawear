import { useState } from 'react';
import { voucherApi } from '../../services/voucherApi';
import { VoucherDto, VoucherValidateResponse } from '../../types/api';
import { TicketPercent, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

interface VoucherInputProps {
    orderTotal: number;
    onApplyVoucher: (voucher: VoucherDto | null, discountAmount: number) => void;
}

const VoucherInput = ({ orderTotal, onApplyVoucher }: VoucherInputProps) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appliedVoucher, setAppliedVoucher] = useState<VoucherDto | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const handleApply = async () => {
        if (!code.trim()) {
            setError('Vui lòng nhập mã voucher');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await voucherApi.validate(code.trim(), orderTotal);
            const data: VoucherValidateResponse = res.data;

            if (data.valid && data.voucher) {
                setAppliedVoucher(data.voucher);
                setDiscountAmount(data.discountAmount || 0);
                onApplyVoucher(data.voucher, data.discountAmount || 0);
                setError(null);
            } else {
                setError(data.message || 'Mã voucher không hợp lệ');
                setAppliedVoucher(null);
                setDiscountAmount(0);
                onApplyVoucher(null, 0);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra voucher');
            setAppliedVoucher(null);
            setDiscountAmount(0);
            onApplyVoucher(null, 0);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setCode('');
        setAppliedVoucher(null);
        setDiscountAmount(0);
        setError(null);
        onApplyVoucher(null, 0);
    };

    return (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
                <TicketPercent className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Mã giảm giá</span>
            </div>

            {appliedVoucher ? (
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <div className="flex-1 min-w-0">
                        <div className="font-mono font-bold text-green-700 dark:text-green-400">
                            {appliedVoucher.code}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                            {appliedVoucher.description || appliedVoucher.discountDisplay}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                            Giảm: {formatCurrency(discountAmount)}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <Input
                        type="text"
                        className="flex-1 uppercase font-mono text-sm"
                        placeholder="Nhập mã voucher"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        disabled={loading}
                    />
                    <Button
                        onClick={handleApply}
                        disabled={loading || !code.trim()}
                        className="shrink-0"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Áp dụng'
                        )}
                    </Button>
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
        </div>
    );
};

export default VoucherInput;
