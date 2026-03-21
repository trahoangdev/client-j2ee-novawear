import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Timer, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { flashSalesApi } from '@/lib/customerApi';
import { formatCurrency } from '@/lib/utils';
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
    <div className="flex items-center gap-2">
      {[
        { val: timeLeft.hours, label: 'Giờ' },
        { val: timeLeft.minutes, label: 'Phút' },
        { val: timeLeft.seconds, label: 'Giây' },
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 text-white font-black text-xl sm:text-2xl px-3 py-2 rounded-xl min-w-[3rem] text-center tabular-nums shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            {pad(item.val)}
          </div>
          <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mt-1.5 font-bold">{item.label}</span>
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
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="rounded-[2.5rem] bg-gradient-to-br from-red-700 via-rose-600 to-orange-600 overflow-hidden shadow-2xl relative border border-white/10"
        >
          {/* Decorative background grid and flares */}
          <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          {/* Header Section */}
          <div className="relative z-10 p-6 sm:p-10 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 backdrop-blur-sm bg-black/10">
            <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
              <div className="bg-gradient-to-br from-yellow-300 to-orange-500 p-3 sm:p-4 rounded-2xl shadow-lg ring-4 ring-yellow-400/20">
                <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-red-900" strokeWidth={2.5} />
              </div>
              <div>
                <motion.h2 
                    animate={{ textShadow: ["0px 0px 8px rgba(255,255,255,0.5)", "0px 0px 16px rgba(255,255,255,0.8)", "0px 0px 8px rgba(255,255,255,0.5)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-white font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-1"
                >
                    {sale.name}
                </motion.h2>
                <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <p className="text-yellow-400 text-sm font-bold tracking-widest uppercase">Giảm sốc đến {sale.discountPercent}%</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center sm:items-end w-full md:w-auto bg-black/20 p-5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-3 font-bold uppercase tracking-widest">
                  <Timer className="w-4 h-4" /> Kết thúc sau
              </div>
              <CountdownTimer endTime={sale.endTime} />
            </div>
          </div>

          {/* Products Scroll Area */}
          <div className="relative z-10 p-6 sm:p-10 bg-white/5 backdrop-blur-3xl group">
             {/* Navigation Buttons */}
             <button 
               onClick={() => scroll('left')}
               className="absolute left-4 sm:left-6 top-[60%] -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background border border-border/50 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center justify-center text-foreground hover:bg-red-600 hover:text-white hover:border-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none"
               aria-label="Cuộn qua trái"
             >
               <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
             </button>
             <button 
               onClick={() => scroll('right')}
               className="absolute right-4 sm:right-6 top-[60%] -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background border border-border/50 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center justify-center text-foreground hover:bg-red-600 hover:text-white hover:border-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none"
               aria-label="Cuộn qua phải"
             >
               <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
             </button>

            <div 
              ref={scrollContainerRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar scroll-smooth"
            >
              {sale.products.map((item, index) => {
                const percent = item.quantity > 0 ? Math.round((item.soldCount / item.quantity) * 100) : 0;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                        <Link
                            to={`/product/${item.productSlug || item.productId}`}
                            className="group flex-shrink-0 w-[240px] sm:w-[280px] snap-center block rounded-3xl bg-background border border-border overflow-hidden hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="relative aspect-square overflow-hidden bg-muted">
                                {item.productImage ? (
                                    <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm font-medium">No image</div>
                                )}
                                
                                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs sm:text-sm font-black px-3 py-1.5 rounded-full shadow-lg border border-red-500/50 flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 fill-current" /> -{sale.discountPercent}%
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            
                            <div className="p-5">
                                <h3 className="text-base font-bold line-clamp-2 mb-3 group-hover:text-red-600 transition-colors">{item.productName}</h3>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-red-600 font-black text-lg">{formatCurrency(item.salePrice)}</span>
                                    <span className="text-muted-foreground text-sm line-through font-medium">{formatCurrency(item.originalPrice)}</span>
                                </div>
                                {/* Advanced Progress bar */}
                                <div className="relative h-2 bg-red-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                                        style={{ width: `${Math.min(percent, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                                    <span className="text-red-600 flex items-center gap-1"><Flame className="w-3 h-3"/> Đã bán {item.soldCount}</span>
                                    <span>Còn {item.quantity - item.soldCount}</span>
                                </div>
                            </div>
                        </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
        </motion.div>
      </div>
    </section>
  );
}
