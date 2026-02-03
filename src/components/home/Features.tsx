import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Miễn Phí Vận Chuyển',
    description: 'Cho đơn hàng từ 500K',
  },
  {
    icon: ShieldCheck,
    title: 'Thanh Toán An Toàn',
    description: 'Bảo mật 100%',
  },
  {
    icon: RefreshCw,
    title: 'Đổi Trả Dễ Dàng',
    description: 'Trong vòng 30 ngày',
  },
  {
    icon: Headphones,
    title: 'Hỗ Trợ 24/7',
    description: 'Tư vấn tận tâm',
  },
];

export function Features() {
  return (
    <section className="py-12 border-y border-border/50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center md:items-start gap-3 text-center md:text-left"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
