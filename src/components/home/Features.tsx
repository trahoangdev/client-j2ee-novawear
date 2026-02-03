import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Miễn Phí Vận Chuyển', description: 'Cho đơn hàng từ 500K' },
  { icon: ShieldCheck, title: 'Thanh Toán An Toàn', description: 'Bảo mật 100%' },
  { icon: RefreshCw, title: 'Đổi Trả Dễ Dàng', description: 'Trong vòng 30 ngày' },
  { icon: Headphones, title: 'Hỗ Trợ 24/7', description: 'Tư vấn tận tâm' },
];

export function Features() {
  return (
    <section className="py-8 sm:py-10 border-y border-border/50 bg-muted/20" aria-label="Tiện ích">
      <div className="container px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0" aria-hidden>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
