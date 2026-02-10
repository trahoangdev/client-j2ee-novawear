import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const CANCEL_REASONS = [
    'Đổi ý, không muốn mua nữa',
    'Muốn thay đổi sản phẩm trong đơn',
    'Thời gian giao hàng quá lâu',
    'Tìm thấy giá tốt hơn ở nơi khác',
    'Đặt nhầm sản phẩm',
    'Lý do khác',
];

interface CancelOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    orderNumber: string;
    loading?: boolean;
}

export function CancelOrderModal({
    isOpen,
    onClose,
    onConfirm,
    orderNumber,
    loading = false,
}: CancelOrderModalProps) {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const finalReason = selectedReason === 'Lý do khác' ? customReason : selectedReason;
    const canSubmit = finalReason.trim().length > 0 && !loading;

    const handleConfirm = async () => {
        if (!canSubmit) return;
        await onConfirm(finalReason);
        setSelectedReason('');
        setCustomReason('');
    };

    const handleClose = () => {
        if (loading) return;
        setSelectedReason('');
        setCustomReason('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <DialogTitle>Hủy đơn hàng #{orderNumber}</DialogTitle>
                            <DialogDescription>
                                Vui lòng chọn lý do hủy đơn hàng
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {CANCEL_REASONS.map((reason) => (
                        <label
                            key={reason}
                            className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                ${selectedReason === reason
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                }
              `}
                        >
                            <input
                                type="radio"
                                name="cancelReason"
                                value={reason}
                                checked={selectedReason === reason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{reason}</span>
                        </label>
                    ))}

                    {selectedReason === 'Lý do khác' && (
                        <textarea
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder="Nhập lý do của bạn..."
                            className="w-full min-h-[80px] p-3 border border-border rounded-lg text-sm bg-background resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            autoFocus
                        />
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Quay lại
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!canSubmit}
                    >
                        {loading ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
