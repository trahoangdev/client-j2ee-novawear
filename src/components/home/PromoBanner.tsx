import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { bannersApi } from '@/lib/customerApi';
import type { BannerDto } from '@/types/api';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

export function PromoBanner() {
  const [banner, setBanner] = useState<BannerDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bannersApi.getPromo()
      .then(({ data }) => setBanner(data))
      .catch(() => setBanner(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !banner) return null;

  return (
    <section className="py-24 sm:py-32 overflow-hidden px-4 sm:px-6" aria-labelledby="promo-heading">
      <div className="container max-w-6xl mx-auto">
        <motion.div 
          className="relative bg-zinc-950 rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row items-center overflow-hidden border border-white/10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Subtle Abstract Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-orange-500/20 opacity-50 blur-3xl pointer-events-none" />

          {/* Text Content */}
          <div className="flex-1 w-full p-10 sm:p-16 lg:p-20 relative z-10 text-center lg:text-left">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-bold tracking-widest uppercase mb-6"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              {banner.subtitle || "Ưu đãi đặc biệt"}
            </motion.div>
            
            {banner.title && (
              <motion.h2 
                id="promo-heading" 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight whitespace-pre-line"
              >
                {banner.title.replace(/\\n/g, '\n')}
              </motion.h2>
            )}
            
            {banner.description && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg sm:text-xl text-white/70 mb-10 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
              >
                {banner.description}
              </motion.p>
            )}
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {banner.ctaText && banner.linkUrl && (
                <Button size="lg" className="bg-white text-black hover:bg-neutral-200 h-14 px-8 rounded-full text-base font-bold transition-all shadow-xl group" asChild>
                  {banner.linkUrl.startsWith('http') ? (
                    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
                        {banner.ctaText}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <Link to={banner.linkUrl}>
                        {banner.ctaText}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </Button>
              )}
            </motion.div>
          </div>

          {/* Image Content */}
          {banner.imageUrl && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                className="flex-1 relative w-full h-[300px] sm:h-[400px] lg:h-auto min-h-[400px]"
            >
              <img
                src={banner.imageUrl}
                alt={banner.title || 'Promo banner'}
                className="absolute inset-0 w-full h-full object-cover lg:rounded-l-3xl shadow-2xl"
              />
              {/* Gradient mask for smooth blending on desktop */}
              <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
              <div className="lg:hidden absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-950 to-transparent z-10" />
              
              {/* Floating Badge */}
              {banner.badgeText && (
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-6 right-6 sm:top-10 sm:right-10 bg-yellow-400 text-black rounded-full h-24 w-24 sm:h-32 sm:w-32 flex flex-col items-center justify-center shadow-2xl rotate-12 z-20"
                >
                  <span className="font-display text-2xl sm:text-3xl font-black leading-none">{banner.badgeText.split(/\s+/)[0] || 'HOT'}</span>
                  <span className="text-sm font-bold uppercase mt-1">{banner.badgeText.split(/\s+/).slice(1).join(' ') || 'DEAL'}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
