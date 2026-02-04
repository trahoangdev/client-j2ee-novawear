import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function PromoBanner() {
  return (
    <section className="section-spacing bg-primary text-primary-foreground overflow-hidden" aria-labelledby="promo-heading">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-primary-foreground/85 font-medium text-sm sm:text-base mb-2">
              Ưu đãi độc quyền
            </p>
            <h2 id="promo-heading" className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
              Giảm Đến 50%
            </h2>
            <p className="text-base sm:text-lg text-primary-foreground/85 mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0">
              Đăng ký thành viên ngay hôm nay để nhận mã giảm giá và cập nhật ưu đãi từ NOVAWEAR
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 h-11 px-6 rounded-xl" asChild>
                <Link to="/sale">Mua Ngay</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 rounded-xl border-2 border-white text-white bg-transparent hover:bg-white/15 hover:border-white focus-visible:ring-white/50"
              >
                Tìm Hiểu Thêm
              </Button>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-sm lg:max-w-md">
            <div className="relative aspect-square">
              <div className="absolute inset-0 bg-primary-foreground/10 rounded-[2rem] scale-110" aria-hidden />
              <img
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80"
                alt=""
                className="relative w-full h-full object-cover rounded-[2rem] border-4 border-primary-foreground/20"
              />
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-background text-foreground rounded-full h-20 w-20 sm:h-24 sm:w-24 flex flex-col items-center justify-center shadow-elevated">
                <span className="font-display text-xl sm:text-2xl font-bold">50%</span>
                <span className="text-xs font-medium">OFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
