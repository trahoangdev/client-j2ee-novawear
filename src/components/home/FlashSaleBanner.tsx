import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Timer, Flame, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { flashSalesApi } from '@/lib/customerApi';
import { formatCurrency, cn } from '@/lib/utils';
import type { FlashSaleDto } from '@/types/api';
import { motion } from 'framer-motion';

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {[
        { val: timeLeft.hours, label: 'Giờ' },
        { val: timeLeft.minutes, label: 'Phút' },
        { val: timeLeft.seconds, label: 'Giây' },
      ].map((item, i, arr) => (
        <div key={i} className="flex items-center gap-1.5 sm:gap-2">
          <div className="bg-destructive text-destructive-foreground font-bold text-lg sm:text-2xl px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl min-w-[3rem] sm:min-w-[4rem] text-center tabular-nums shadow-sm border border-border/50">
            {pad(item.val)}
          </div>
          {i < arr.length - 1 && <span className="text-destructive font-black text-xl sm:text-2xl animate-pulse">:</span>}
        </div>
      ))}
    </div>
  );
}

export function FlashSaleBanner() {
  const [sale, setSale] = useState<FlashSaleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    flashSalesApi.getActive()
      .then(({ data }) => { if (data.length > 0) setSale(data[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !sale || sale.products.length === 0) return null;

  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-[85rem] relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col gap-8"
        >
          
          {/* Header Section Clean */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-2 border-b border-border/50">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-destructive font-black tracking-widest uppercase text-sm">
                <Zap className="h-5 w-5 fill-current animate-pulse" /> KẾT THÚC CHƯƠNG TRÌNH SAU
              </div>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
                {sale.name}
              </h2>
              <p className="text-muted-foreground font-medium text-lg flex items-center gap-2">
                Sở hữu siêu phẩm với mức giá giảm đến <span className="font-bold text-destructive">-{sale.discountPercent}%</span>
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-2 pb-1">
              <CountdownTimer endTime={sale.endTime} />
            </div>
          </div>

          {/* Products Scroll Area */}
          <div className="relative group -mx-4 px-4 sm:mx-0 sm:px-0 mt-2">
             {/* Navigation Buttons */}
             <button 
               onClick={() => scroll('left')}
               className="absolute left-4 sm:-left-6 top-[40%] -translate-y-1/2 z-20 h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-foreground hover:text-background hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none"
               aria-label="Cuộn qua trái"
             >
               <ChevronLeft className="h-5 w-5 sm:h-7 sm:w-7" />
             </button>
             <button 
               onClick={() => scroll('right')}
               className="absolute right-4 sm:-right-6 top-[40%] -translate-y-1/2 z-20 h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-foreground hover:text-background hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none"
               aria-label="Cuộn qua phải"
             >
               <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7" />
             </button>

            <div 
              ref={scrollContainerRef}
              className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-10 pt-4 snap-x hide-scrollbar"
            >
              {sale.products.map((item, index) => {
                const percent = item.quantity > 0 ? Math.round((item.soldCount / item.quantity) * 100) : 0;
                const isSoldOut = item.soldCount >= item.quantity;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="shrink-0 snap-center"
                  >
                        <Link
                            to={`/product/${item.productSlug || item.productId}`}
                            className="group flex flex-col w-[260px] sm:w-[280px] lg:w-[320px] rounded-[2rem] bg-card border border-border/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500"
                        >
                            {/* Image Section */}
                            <div className="relative aspect-[4/5] overflow-hidden bg-muted/30 p-4 sm:p-6 flex flex-col items-center justify-center">
                                {item.productImage ? (
                                    <img src={item.productImage} alt={item.productName} className={cn("h-full w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700 ease-out", isSoldOut && "grayscale opacity-70")} />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm font-medium">No image</div>
                                )}
                                
                                <div className="absolute top-5 left-5 sm:top-6 sm:left-6 flex flex-col gap-2">
                                  <div className="bg-destructive text-destructive-foreground text-xs sm:text-sm font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 w-fit uppercase tracking-widest">
                                      <Zap className="w-3.5 h-3.5 fill-current" /> -{sale.discountPercent}%
                                  </div>
                                </div>

                                {isSoldOut && (
                                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
                                      <div className="bg-foreground text-background text-sm font-black px-5 py-2.5 rounded-full shadow-xl uppercase tracking-widest rotate-[-10deg]">
                                          ĐÃ HẾT HÀNG
                                      </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Content Section */}
                            <div className="p-5 sm:p-6 flex flex-col flex-1 bg-card">
                                <h3 className="text-base sm:text-lg font-semibold line-clamp-2 mb-4 group-hover:text-primary transition-colors text-foreground">{item.productName}</h3>
                                
                                <div className="mt-auto">
                                  <div className="flex flex-col gap-0.5 mb-5">
                                      <span className="text-destructive font-black tracking-tight text-2xl sm:text-3xl">{formatCurrency(item.salePrice)}</span>
                                      <span className="text-muted-foreground text-sm line-through font-medium">{formatCurrency(item.originalPrice)}</span>
                                  </div>

                                  {/* Sleek Progress bar */}
                                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2.5">
                                      <span className="flex items-center gap-1.5 text-foreground/80"><Flame className="w-4 h-4 text-orange-500"/> Đã bán {item.soldCount}</span>
                                      {isSoldOut ? (
                                        <span className="text-destructive font-bold uppercase tracking-wider">HẾT HÀNG</span>
                                      ) : (
                                        <span className="bg-muted px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">Còn {item.quantity - item.soldCount}</span>
                                      )}
                                  </div>
                                  <div className="relative h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                                      <div
                                          className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out", isSoldOut ? "bg-muted-foreground opacity-50" : percent > 80 ? "bg-orange-500" : "bg-primary")}
                                          style={{ width: `${Math.min(percent, 100)}%` }}
                                      />
                                  </div>
                                </div>
                            </div>
                        </Link>
                  </motion.div>
                );
              })}
              
              {/* "View More" Fake Card */}
              <motion.div className="shrink-0 snap-center flex items-center justify-center p-4">
                 <Link to="/flash-sale" className="group flex flex-col items-center justify-center w-[200px] h-[300px] rounded-[2rem] bg-muted/20 border border-border/50 hover:bg-muted hover:border-primary/30 transition-all duration-300">
                    <div className="h-14 w-14 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                    <span className="font-bold text-foreground hover:text-primary">Xem tất cả</span>
                 </Link>
              </motion.div>
            </div>
          </div>
          
        </motion.div>
      </div>
    </section>
  );
}
