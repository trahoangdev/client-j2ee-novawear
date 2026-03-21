import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Miễn Phí Giao Hàng', description: 'Cho đơn hàng trên 200K toàn quốc' },
  { icon: ShieldCheck, title: 'Thanh Toán An Toàn', description: 'Đa phương thức, bảo mật 100%' },
  { icon: RefreshCw, title: 'Đổi Trả Dễ Dàng', description: 'Hỗ trợ đổi trả trong vòng 30 ngày' },
  { icon: Headphones, title: 'Hỗ Trợ Tận Tâm 24/7', description: 'Luôn lắng nghe, giải quyết nhanh' },
];

export function Features() {
  return (
    <section className="relative z-30 px-4 sm:px-6 md:px-8 mt-[-3rem] md:mt-[-4rem] mb-12 sm:mb-16 max-w-7xl mx-auto" aria-label="Tiện ích khách hàng">
      <div className="bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center pt-6 first:pt-0 sm:pt-0 px-4 transition-transform hover:-translate-y-1"
            >
              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:shadow-primary/30 transition-shadow">
                  <Icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                </div>
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-[200px]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
