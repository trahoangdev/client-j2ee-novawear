import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { bannersApi } from '@/lib/customerApi';
import type { BannerDto } from '@/types/api';
import { motion, AnimatePresence } from 'framer-motion';

type Slide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
};

function bannerToSlide(b: BannerDto): Slide {
  return {
    id: b.id,
    image: b.imageUrl || '',
    title: b.title?.replace(/\\n/g, '\n') ?? '',
    subtitle: b.subtitle ?? '',
    cta: b.ctaText ?? 'Mua ngay',
    link: b.linkUrl?.startsWith('http') ? b.linkUrl : (b.linkUrl || '/shop'),
  };
}

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    bannersApi
      .listActive()
      .then(({ data }) => {
        const carouselBanners = data.filter(b => !b.bannerType || b.bannerType === 'CAROUSEL');
        const validSlides = carouselBanners.map(bannerToSlide).filter((s) => s.image);
        setSlides(validSlides);
      })
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, []);

  const length = slides.length;

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + length) % length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [length]);

  useEffect(() => {
    if (!isAutoPlaying || length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, length]);

  if (loading) {
    return <div className="h-[75vh] w-full bg-muted animate-pulse" />;
  }
  
  if (length === 0) return null;

  return (
    <section className="relative h-[75vh] min-h-[500px] w-full overflow-hidden bg-black" aria-label="Hero Carousel">
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentSlide}
          custom={direction}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image with Zoom Effect */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />

          {/* Premium Gradient Overlays */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          
          <div className="relative h-full container mx-auto px-6 sm:px-10 md:px-12 flex flex-col justify-center">
            <div className="max-w-2xl mt-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white cursor-default text-xs font-bold tracking-widest uppercase mb-6"
              >
                Cửa hàng NOVAWEAR
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight whitespace-pre-line mb-6 drop-shadow-lg"
              >
                {slides[currentSlide].title || 'NOVAWEAR'}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                className="text-lg sm:text-xl text-white/80 max-w-xl mb-10 leading-relaxed drop-shadow-sm font-medium"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              >
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-neutral-200 h-14 px-8 rounded-full text-base font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
                  asChild
                >
                  {slides[currentSlide].link.startsWith('http') ? (
                    <a href={slides[currentSlide].link} target="_blank" rel="noopener noreferrer">
                      {slides[currentSlide].cta}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <Link to={slides[currentSlide].link}>
                      {slides[currentSlide].cta}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-4 sm:left-8 flex items-center z-20 pointer-events-none">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/20 hover:bg-white text-white hover:text-black border-white/20 hover:border-white backdrop-blur-md pointer-events-auto transition-all"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="absolute inset-y-0 right-4 sm:right-8 flex items-center z-20 pointer-events-none">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/20 hover:bg-white text-white hover:text-black border-white/20 hover:border-white backdrop-blur-md pointer-events-auto transition-all"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="group relative h-2 py-2 focus:outline-none"
          >
            <div className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              currentSlide === index ? "w-10 bg-white" : "w-2.5 bg-white/40 group-hover:bg-white/70"
            )} />
          </button>
        ))}
      </div>
    </section>
  );
}
