import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const slides = [
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

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1)' : 'scale(1.1)',
              transition: 'transform 6s ease-out',
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />

          {/* Content */}
          <div className="relative h-full container flex items-center">
            <div
              className={cn(
                'max-w-xl text-background transition-all duration-700 delay-300',
                index === currentSlide
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              )}
            >
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight whitespace-pre-line mb-4 md:mb-6">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-background/80 mb-6 md:mb-8">
                {slide.subtitle}
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 md:h-14 px-8 md:px-10 text-base font-semibold"
                asChild
              >
                <Link to={slide.link}>{slide.cta}</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-4 flex items-center z-20">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm text-background hover:bg-background/40"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center z-20">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm text-background hover:bg-background/40"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === currentSlide
                ? 'w-8 bg-primary'
                : 'w-2 bg-background/50 hover:bg-background/80'
            )}
          />
        ))}
      </div>
    </section>
  );
}
