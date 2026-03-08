import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { voucherApi } from '@/services/voucherApi';
import type { VoucherDto, VoucherValidateResponse } from '@/types/api';
import { Loader2, TicketPercent, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

interface VoucherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderTotal: number;
  appliedCode?: string;
  onApply: (voucher: VoucherDto, discountAmount: number) => void;
  onRemove: () => void;
}

export function VoucherModal({ open, onOpenChange, orderTotal, appliedCode, onApply, onRemove }: VoucherModalProps) {
  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError('');
      voucherApi.getAvailable(orderTotal)
        .then(({ data }) => setVouchers(data))
        .catch(() => setVouchers([]))
        .finally(() => setLoading(false));
    }
  }, [open, orderTotal]);

  const handleValidateAndApply = async (voucherCode: string) => {
    setValidating(true);
    setError('');
    try {
      const { data }: { data: VoucherValidateResponse } = await voucherApi.validate(voucherCode, orderTotal);
      if (data.valid && data.voucher) {
        onApply(data.voucher, data.discountAmount || 0);
        toast.success(`Áp dụng mã ${voucherCode} thành công!`);
        onOpenChange(false);
      } else {
        setError(data.message || 'Mã voucher không hợp lệ');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setValidating(false);
    }
  };

  const handleManualApply = () => {
    if (!code.trim()) return;
    handleValidateAndApply(code.trim());
  };

  const handleSelectVoucher = (v: VoucherDto) => {
    if (!v.isValid) return;
    handleValidateAndApply(v.code);
  };

  const getDiscountDisplay = (v: VoucherDto) => {
    if (v.discountDisplay) return v.discountDisplay;
    return v.discountType === 'PERCENT'
      ? `Giảm ${v.discountValue}%`
      : `Giảm ${formatCurrency(v.discountValue)}`;
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TicketPercent className="h-5 w-5 text-primary" />
            Chọn mã giảm giá
          </DialogTitle>
        </DialogHeader>

        {/* Manual input */}
        <div className="flex gap-2">
          <Input
            placeholder="Nhập mã voucher"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleManualApply()}
            className="flex-1 uppercase font-mono text-sm"
            disabled={validating}
          />
          <Button onClick={handleManualApply} disabled={validating || !code.trim()} className="shrink-0">
            {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Áp dụng'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive -mt-1">{error}</p>}

        {/* Applied voucher */}
        {appliedCode && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-mono text-sm font-bold text-green-700 dark:text-green-400">{appliedCode}</span>
              <span className="text-xs text-green-600/80">đang áp dụng</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-destructive h-7" onClick={() => { onRemove(); onOpenChange(false); }}>
              Bỏ
            </Button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">hoặc chọn voucher</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Voucher list */}
        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2.5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <TicketPercent className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">Chưa có voucher khả dụng</p>
            </div>
          ) : (
            vouchers.map((v) => {
              const isApplied = appliedCode === v.code;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!v.isValid || validating}
                  onClick={() => handleSelectVoucher(v)}
                  className={cn(
                    'w-full flex items-stretch rounded-xl border overflow-hidden text-left transition-all',
                    isApplied && 'border-green-400 dark:border-green-600 ring-2 ring-green-200 dark:ring-green-800',
                    !isApplied && v.isValid && 'border-border hover:border-primary hover:shadow-soft cursor-pointer',
                    !v.isValid && 'border-border/50 opacity-50 cursor-not-allowed',
                  )}
                >
                  {/* Left badge */}
                  <div className="flex flex-col justify-center items-center min-w-[90px] p-3 bg-primary text-primary-foreground text-center relative">
                    <span className="font-bold text-xs leading-tight">{getDiscountDisplay(v)}</span>
                    {v.maxDiscount && v.discountType === 'PERCENT' && (
                      <span className="text-[10px] opacity-80 mt-0.5">Tối đa {formatCurrency(v.maxDiscount)}</span>
                    )}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background" />
                  </div>
                  {/* Right info */}
                  <div className="flex-1 p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{v.code}</span>
                      {isApplied && <Check className="h-3.5 w-3.5 text-green-600" />}
                    </div>
                    {v.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{v.description}</p>}
                    <div className="flex flex-wrap gap-x-3 mt-1.5 text-[11px] text-muted-foreground">
                      {v.minOrderValue != null && v.minOrderValue > 0 && (
                        <span>Đơn tối thiểu {formatCurrency(v.minOrderValue)}</span>
                      )}
                      {v.endDate && <span className="text-destructive">HSD: {formatDate(v.endDate)}</span>}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
