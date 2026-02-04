import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { bannersApi } from '@/lib/customerApi';
import type { BannerDto } from '@/types/api';

type Slide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
};

const defaultSlides: Slide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
    title: 'Bộ Sưu Tập\nXuân Hè 2024',
    subtitle: 'Khám phá những xu hướng thời trang mới nhất',
    cta: 'Khám Phá Ngay',
    link: '/shop',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80',
    title: 'Thanh Lịch\nMỗi Ngày',
    subtitle: 'Phong cách công sở hiện đại, tinh tế',
    cta: 'Xem Bộ Sưu Tập',
    link: '/shop?category=tops',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80',
    title: 'Giảm Giá\nĐến 50%',
    subtitle: 'Ưu đãi đặc biệt cho thành viên mới',
    cta: 'Mua Ngay',
    link: '/shop?sale=true',
  },
];

function bannerToSlide(b: BannerDto): Slide {
  return {
    id: b.id,
    image: b.imageUrl || '',
    title: b.title?.replace(/\\n/g, '\n') ?? '',
    subtitle: b.subtitle ?? '',
    cta: b.ctaText ?? 'Xem thêm',
    link: b.linkUrl?.startsWith('http') ? b.linkUrl : (b.linkUrl || '/shop'),
  };
}

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    bannersApi
      .listActive()
      .then(({ data }) => {
        if (data.length > 0) {
          setSlides(data.map(bannerToSlide).filter((s) => s.image));
        }
      })
      .catch(() => {
        // Giữ defaultSlides
      });
  }, []);

  const length = slides.length;

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 8000);
    },
    []
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + length) % length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [length]);

  useEffect(() => {
    if (!isAutoPlaying || length === 0) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % length), 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrentSlide((p) => (p - 1 + length) % length);
      if (e.key === 'ArrowRight') setCurrentSlide((p) => (p + 1) % length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [length]);

  if (length === 0) return null;

  return (
    <section
      className="relative h-[65vh] min-h-[420px] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden"
      aria-label="Carousel quảng bá"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} of ${length}`}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-out',
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          )}
        >
          <div
            className="absolute inset-0 bg-cover bg-center motion-safe:transition-transform motion-safe:duration-[6s] motion-safe:ease-out"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1)' : 'scale(1.08)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/35 to-transparent" />

          <div className="relative h-full container flex items-center px-4 sm:px-6">
            <div
              className={cn(
                'max-w-xl text-background transition-all duration-700 delay-150',
                index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
            >
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.15] whitespace-pre-line mb-3 md:mb-5">
                {slide.title || 'NOVAWEAR'}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-background/85 mb-5 md:mb-7 max-w-md">
                {slide.subtitle}
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 md:h-12 px-6 md:px-8 text-sm font-semibold rounded-xl tap-target"
                asChild
              >
                {slide.link.startsWith('http') ? (
                  <a href={slide.link} target="_blank" rel="noopener noreferrer">{slide.cta}</a>
                ) : (
                  <Link to={slide.link}>{slide.cta}</Link>
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-y-0 left-2 sm:left-4 flex items-center z-20">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/20 hover:bg-black/35 text-white backdrop-blur-sm tap-target"
          onClick={prevSlide}
          aria-label="Slide trước"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center z-20">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/20 hover:bg-black/35 text-white backdrop-blur-sm tap-target"
          onClick={nextSlide}
          aria-label="Slide sau"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5" role="tablist" aria-label="Chọn slide">
        {slides.map((_, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Slide ${index + 1}`}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-1.5 sm:h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
              index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white/80'
            )}
          />
        ))}
      </div>
    </section>
  );
}
