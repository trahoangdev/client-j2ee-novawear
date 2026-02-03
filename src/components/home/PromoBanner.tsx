import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function PromoBanner() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground overflow-hidden">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-primary-foreground/80 font-medium mb-3">
              Ưu đãi độc quyền
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Giảm Đến 50%
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
              Đăng ký thành viên ngay hôm nay để nhận mã giảm giá và cập nhật 
              những ưu đãi hấp dẫn từ NOVAWEAR
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 h-12 px-8"
                asChild
              >
                <Link to="/shop?sale=true">Mua Ngay</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8"
              >
                Tìm Hiểu Thêm
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-primary-foreground/10 rounded-full scale-110" />
              <img
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80"
                alt="Sale Banner"
                className="relative w-full h-full object-cover rounded-full border-4 border-primary-foreground/20"
              />
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-background text-foreground rounded-full h-24 w-24 flex flex-col items-center justify-center shadow-elevated animate-bounce-subtle">
                <span className="font-display text-2xl font-bold">50%</span>
                <span className="text-xs font-medium">OFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
