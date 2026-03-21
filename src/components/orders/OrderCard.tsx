import { Calendar, ChevronDown, ChevronUp, XCircle, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import type { OrderDto } from '@/types/api';

export const ORDER_STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  PROCESSING: { label: 'Đang xử lý', className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400' },
  SHIPPED: { label: 'Đang giao', className: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
  DELIVERED: { label: 'Đã giao', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

// Chỉ cho phép hủy khi đơn ở trạng thái này
const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];

export function OrderStatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUS_MAP[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <span className={['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className].join(' ')}>
      {config.label}
    </span>
  );
}

export function OrderCard({
  order,
  expanded,
  onToggle,
  detail,
  onCancelClick,
  onReturnClick,
}: {
  order: OrderDto;
  expanded: boolean;
  onToggle: () => void;
  detail: OrderDto | null;
  onCancelClick?: () => void;
  onReturnClick?: () => void;
}) {
  const details = detail?.orderDetails ?? order.orderDetails ?? [];
  const orderNumber = order.orderNumber ?? String(order.id).padStart(6, '0');
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-muted-foreground">#{orderNumber}</span>
          <OrderStatusBadge status={order.status} />
          <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(order.orderDate)}
          </span>
          <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-3">
          {details.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có chi tiết đơn hàng.</p>
          ) : (
            <ul className="space-y-1.5">
              {details.map((d) => (
                <li key={d.id} className="flex justify-between text-sm">
                  <span>{d.productName} × {d.quantity}</span>
                  <span className="text-muted-foreground">{formatCurrency(d.subtotal)}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Thông tin giao hàng nếu có */}
          {(detail?.recipientName || detail?.address || detail?.phone) && (
            <div className="pt-3 border-t border-border">
              <h4 className="text-sm font-medium mb-2">Thông tin giao hàng</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {detail?.recipientName && <p>Người nhận: {detail.recipientName}</p>}
                {detail?.phone && <p>SĐT: {detail.phone}</p>}
                {detail?.address && <p>Địa chỉ: {detail.address}</p>}
              </div>
            </div>
          )}

          {/* Voucher / Giảm giá */}
          {detail?.voucherCode && (
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mã giảm giá: <span className="font-mono font-medium text-foreground">{detail.voucherCode}</span></span>
                {detail.discountAmount != null && detail.discountAmount > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium">-{formatCurrency(detail.discountAmount)}</span>
                )}
              </div>
            </div>
          )}

          {/* Thông tin vận chuyển */}
          {(detail?.trackingNumber || detail?.carrier) && (
            <div className="pt-3 border-t border-border">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Truck className="h-4 w-4" />
                Thông tin vận chuyển
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {detail?.carrier && <p>Đơn vị vận chuyển: <span className="font-medium text-foreground">{detail.carrier}</span></p>}
                {detail?.trackingNumber && <p>Mã vận đơn: <span className="font-mono font-medium text-foreground">{detail.trackingNumber}</span></p>}
              </div>
            </div>
          )}

          {/* Timeline trạng thái */}
          <div className="pt-3 border-t border-border">
            <h4 className="text-sm font-medium mb-3">Trạng thái đơn hàng</h4>
            <OrderTimeline status={order.status} />
          </div>

          {/* Nút hủy đơn */}
          {canCancel && onCancelClick && (
            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelClick();
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Hủy đơn hàng
              </Button>
            </div>
          )}

          {/* Nút yêu cầu trả hàng */}
          {order.status === 'DELIVERED' && onReturnClick && (
            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onReturnClick();
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Yêu cầu trả hàng
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
