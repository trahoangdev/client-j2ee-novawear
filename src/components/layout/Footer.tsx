import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSettingsReadOnly } from '@/context/AppSettingsContext';
import { newsletterApi } from '@/lib/customerApi';

const shopLinks = [
  { to: '/shop', label: 'Tất Cả Sản Phẩm' },
  { to: '/nam', label: 'Nam' },
  { to: '/nu', label: 'Nữ' },
  { to: '/unisex', label: 'Unisex' },
  { to: '/new-arrivals', label: 'Hàng Mới Về' },
  { to: '/bestseller', label: 'Bán Chạy Nhất' },
  { to: '/flash-sale', label: 'Flash Sale', highlight: true },
];

const supportLinks = [
  { to: '/faq', label: 'Câu Hỏi Thường Gặp' },
  { to: '/size-guide', label: 'Hướng Dẫn Chọn Size' },
  { to: '/shipping', label: 'Chính Sách Vận Chuyển' },
  { to: '/returns', label: 'Chính Sách Đổi Trả' },
  { to: '/terms', label: 'Điều Khoản Sử Dụng' },
  { to: '/privacy', label: 'Chính Sách Bảo Mật' },
];

function BrandName({ name }: { name: string }) {
  if (name === 'NOVAWEAR') {
    return <>NOVA<span className="text-primary">WEAR</span></>;
  }
  return <span>{name}</span>;
}

export function Footer() {
  const { store, general } = useAppSettingsReadOnly();
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const telHref = store.hotline ? `tel:${store.hotline.replace(/\s/g, '')}` : undefined;
  const mailHref = store.supportEmail ? `mailto:${store.supportEmail}` : undefined;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlStatus('loading');
    try {
      await newsletterApi.subscribe(nlEmail.trim());
      setNlStatus('success');
      setNlEmail('');
      setTimeout(() => setNlStatus('idle'), 3000);
    } catch {
      setNlStatus('error');
      setTimeout(() => setNlStatus('idle'), 3000);
    }
  };

  return (
    <footer className="bg-[#0a0a0a] text-white pt-16 pb-8 border-t border-white/5" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Brand Column (2 cols wide on LG) */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                <BrandName name={store.storeName || 'NOVAWEAR'} />
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {store.tagline || 'Thời trang phong cách, chất lượng cao cấp. Khám phá bộ sưu tập mới nhất của chúng tôi ngay hôm nay.'}
            </p>

            <div className="flex gap-4">
              {store.facebookUrl && (
                <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group ring-1 ring-white/10 hover:ring-primary" aria-label="Facebook">
                  <Facebook className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                </a>
              )}
              {store.instagramUrl && (
                <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group ring-1 ring-white/10 hover:ring-primary" aria-label="Instagram">
                  <Instagram className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                </a>
              )}
              {store.zaloUrl && (
                <a href={store.zaloUrl.startsWith('http') ? store.zaloUrl : `https://zalo.me/${store.zaloUrl.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group ring-1 ring-white/10 hover:ring-primary" aria-label="Zalo">
                  <svg className="h-5 w-5 opacity-70 group-hover:opacity-100" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg tracking-wide text-white/90">Mua Sắm</h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={cn(
                      "text-sm transition-colors block py-0.5",
                      link.highlight
                        ? "text-red-400 font-medium hover:text-red-300"
                        : "text-gray-400 hover:text-primary hover:translate-x-1 transition-transform"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg tracking-wide text-white/90">Hỗ Trợ</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-primary transition-colors text-sm hover:translate-x-1 transition-transform block py-0.5">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg tracking-wide text-white/90">Liên Hệ</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              {store.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5 relative top-0.5" />
                  <span className="leading-relaxed">{store.address}</span>
                </li>
              )}
              {store.hotline && (
                <li>
                  <a href={telHref} className="flex items-center gap-3 hover:text-white transition-colors">
                    <Phone className="h-5 w-5 text-primary shrink-0" /> <span className="font-medium">{store.hotline}</span>
                  </a>
                </li>
              )}
              {store.supportEmail && (
                <li>
                  <a href={mailHref} className="flex items-center gap-3 hover:text-white transition-colors break-all">
                    <Mail className="h-5 w-5 text-primary shrink-0" /> <span>{store.supportEmail}</span>
                  </a>
                </li>
              )}
            </ul>

            {general.newsletterEnabled && (
              <div className="pt-2">
                <form className="relative" onSubmit={handleNewsletterSubmit}>
                  <Input
                    type="email"
                    placeholder="Email nhận tin..."
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-lg pr-12 focus-visible:ring-primary focus-visible:border-primary/50"
                    disabled={nlStatus === 'loading'}
                  />
                  <Button size="icon" type="submit" disabled={nlStatus === 'loading'} className="absolute right-0 top-0 h-full w-10 bg-trasparent hover:bg-primary/20 text-primary hover:text-primary rounded-r-lg transition-colors">
                    {nlStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> :
                     nlStatus === 'success' ? <Check className="h-4 w-4 text-green-400" /> :
                     <ArrowRight className="h-4 w-4" />}
                  </Button>
                </form>
                {nlStatus === 'success' && <p className="text-green-400 text-xs mt-1">Đăng ký thành công!</p>}
                {nlStatus === 'error' && <p className="text-red-400 text-xs mt-1">Có lỗi xảy ra, thử lại sau.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
            © {new Date().getFullYear()} {store.storeName || 'NOVAWEAR'}. Đã đăng ký bản quyền.
          </p>

          <div className="flex items-center gap-4 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png" alt="VNPay" className="h-8 w-auto object-contain bg-white rounded px-1 py-0.5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8 w-auto object-contain bg-white rounded px-1 py-0.5" />
            <img src="/images/momo.svg" alt="Momo" className="h-8 w-auto object-contain bg-white rounded px-1 py-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
}
