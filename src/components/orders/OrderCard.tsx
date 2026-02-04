import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderDto } from '@/types/api';

export const ORDER_STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  PROCESSING: { label: 'Đang xử lý', className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400' },
  SHIPPED: { label: 'Đang giao', className: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
  DELIVERED: { label: 'Đã giao', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

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
}: {
  order: OrderDto;
  expanded: boolean;
  onToggle: () => void;
  detail: OrderDto | null;
}) {
  const details = detail?.orderDetails ?? order.orderDetails ?? [];
  const orderNumber = order.orderNumber ?? String(order.id).padStart(6, '0');

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
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-2">
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
        </div>
      )}
    </div>
  );
}
