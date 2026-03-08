import { Package, CheckCircle2, Truck, ClipboardCheck, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIMELINE_STEPS = [
  { status: 'PENDING', label: 'Chờ xác nhận', icon: Clock, description: 'Đơn hàng đang chờ xác nhận' },
  { status: 'CONFIRMED', label: 'Đã xác nhận', icon: ClipboardCheck, description: 'Đơn hàng đã được xác nhận' },
  { status: 'PROCESSING', label: 'Đang xử lý', icon: Package, description: 'Đơn hàng đang được chuẩn bị' },
  { status: 'SHIPPED', label: 'Đang giao hàng', icon: Truck, description: 'Đơn hàng đang trên đường giao' },
  { status: 'DELIVERED', label: 'Đã giao hàng', icon: CheckCircle2, description: 'Giao hàng thành công' },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
};

export function OrderTimeline({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Đơn hàng đã bị hủy</p>
          <p className="text-xs text-red-600/70 dark:text-red-400/70">Đơn hàng này đã được hủy và không tiếp tục xử lý.</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_INDEX[status] ?? 0;

  return (
    <div className="relative">
      <div className="space-y-0">
        {TIMELINE_STEPS.map((step, i) => {
          const stepIdx = STATUS_INDEX[step.status];
          const isPast = stepIdx < currentIdx;
          const isCurrent = stepIdx === currentIdx;
          const isFuture = stepIdx > currentIdx;
          const isLast = i === TIMELINE_STEPS.length - 1;
          const StepIcon = step.icon;

          return (
            <div key={step.status} className="flex gap-3">
              {/* Line + Dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                    isPast && 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isFuture && 'bg-muted text-muted-foreground',
                  )}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 h-8 transition-colors',
                      stepIdx < currentIdx ? 'bg-green-300 dark:bg-green-700' : 'bg-border',
                    )}
                  />
                )}
              </div>

              {/* Text */}
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'text-sm font-medium leading-8',
                    isPast && 'text-green-700 dark:text-green-400',
                    isCurrent && 'text-foreground font-semibold',
                    isFuture && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
