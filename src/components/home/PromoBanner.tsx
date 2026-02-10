import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { bannersApi } from '@/lib/customerApi';
import type { BannerDto } from '@/types/api';

export function PromoBanner() {
  const [banner, setBanner] = useState<BannerDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bannersApi.getPromo()
      .then(({ data }) => {
        setBanner(data);
      })
      .catch(() => {
        // Không có promo banner hoặc lỗi, không hiển thị section
        setBanner(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Không hiển thị nếu không có banner hoặc đang loading
  if (loading || !banner) {
    return null;
  }

  const badgeText = banner.badgeText || '50% OFF';
  const badgeParts = badgeText.split(/\s+/);
  const badgeMain = badgeParts[0] || '50%';
  const badgeSub = badgeParts.slice(1).join(' ') || 'OFF';

  return (
    <section className="section-spacing bg-primary text-primary-foreground overflow-hidden" aria-labelledby="promo-heading">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16">
          <div className="flex-1 text-center lg:text-left">
            {banner.subtitle && (
              <p className="text-primary-foreground/85 font-medium text-sm sm:text-base mb-2">
                {banner.subtitle}
              </p>
            )}
            {banner.title && (
              <h2 id="promo-heading" className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 whitespace-pre-line">
                {banner.title.replace(/\\n/g, '\n')}
              </h2>
            )}
            {banner.description && (
              <p className="text-base sm:text-lg text-primary-foreground/85 mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0">
                {banner.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {banner.ctaText && banner.linkUrl && (
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 h-11 px-6 rounded-xl" asChild>
                  {banner.linkUrl.startsWith('http') ? (
                    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">{banner.ctaText}</a>
                  ) : (
                    <Link to={banner.linkUrl}>{banner.ctaText}</Link>
                  )}
                </Button>
              )}
              {banner.ctaText2 && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-6 rounded-xl border-2 border-white text-white bg-transparent hover:bg-white/15 hover:border-white focus-visible:ring-white/50"
                  asChild={!!banner.linkUrl2}
                >
                  {banner.linkUrl2 ? (
                    banner.linkUrl2.startsWith('http') ? (
                      <a href={banner.linkUrl2} target="_blank" rel="noopener noreferrer">{banner.ctaText2}</a>
                    ) : (
                      <Link to={banner.linkUrl2}>{banner.ctaText2}</Link>
                    )
                  ) : (
                    <span>{banner.ctaText2}</span>
                  )}
                </Button>
              )}
            </div>
          </div>
          {banner.imageUrl && (
            <div className="flex-1 relative w-full max-w-sm lg:max-w-md">
              <div className="relative aspect-square">
                <div className="absolute inset-0 bg-primary-foreground/10 rounded-[2rem] scale-110" aria-hidden />
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Promo banner'}
                  className="relative w-full h-full object-cover rounded-[2rem] border-4 border-primary-foreground/20"
                />
                {banner.badgeText && (
                  <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-background text-foreground rounded-full h-20 w-20 sm:h-24 sm:w-24 flex flex-col items-center justify-center shadow-elevated">
                    <span className="font-display text-xl sm:text-2xl font-bold">{badgeMain}</span>
                    <span className="text-xs font-medium">{badgeSub}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
