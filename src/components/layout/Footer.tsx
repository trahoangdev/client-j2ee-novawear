import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSettingsReadOnly } from '@/context/AppSettingsContext';

const shopLinks = [
  { to: '/shop', label: 'Tất Cả Sản Phẩm' },
  { to: '/shop?category=tops', label: 'Áo' },
  { to: '/shop?category=pants', label: 'Quần' },
  { to: '/shop?category=dresses', label: 'Váy' },
  { to: '/shop?category=accessories', label: 'Phụ Kiện' },
  { to: '/sale', label: 'Khuyến Mãi', highlight: true },
  { to: '/bestseller', label: 'Bán Chạy' },
  { to: '/new-arrivals', label: 'Hàng Mới' },
];

const supportLinks = [
  { to: '/faq', label: 'Câu Hỏi Thường Gặp' },
  { to: '/shipping', label: 'Chính Sách Vận Chuyển' },
  { to: '/returns', label: 'Đổi Trả & Hoàn Tiền' },
  { to: '/size-guide', label: 'Hướng Dẫn Chọn Size' },
  { to: '/contact', label: 'Liên Hệ' },
];

function BrandName({ name }: { name: string }) {
  if (name === 'NOVAWEAR') {
    return <>NOVA<span className="text-primary">WEAR</span></>;
  }
  return <span>{name}</span>;
}

export function Footer() {
  const { store, general } = useAppSettingsReadOnly();
  const telHref = store.hotline ? `tel:${store.hotline.replace(/\s/g, '')}` : undefined;
  const mailHref = store.supportEmail ? `mailto:${store.supportEmail}` : undefined;

  return (
    <footer className="bg-foreground text-background" role="contentinfo">
      {general.newsletterEnabled && (
        <div className="border-b border-background/10">
          <div className="container px-4 sm:px-6 py-12 md:py-16">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="font-display text-xl md:text-2xl font-bold mb-3">
                Đăng Ký Nhận Tin
              </h2>
              <p className="text-background/75 text-sm mb-6">
                Nhận thông tin bộ sưu tập mới và ưu đãi độc quyền
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  aria-label="Email đăng ký"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus-visible:ring-primary flex-1 min-w-0"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 shrink-0 rounded-lg">
                  Đăng Ký
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main footer grid */}
      <div className="container px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-x-12 lg:gap-x-14">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              <span className="font-display text-xl font-bold"><BrandName name={store.storeName} /></span>
            </Link>
            <p className="text-background/75 text-sm leading-relaxed max-w-xs">
              {store.tagline}
            </p>
            <div className="flex gap-3 pt-1">
              {store.facebookUrl && (
                <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {store.instagramUrl && (
                <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {store.zaloUrl && (
                <a href={store.zaloUrl.startsWith('http') ? store.zaloUrl : `https://zalo.me/${store.zaloUrl.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Zalo">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                </a>
              )}
            </div>
          </div>

          <nav aria-label="Mua sắm" className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-background/90">Mua Sắm</h3>
            <ul className="space-y-3">
              {shopLinks.map(({ to, label, highlight }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      'text-sm transition-colors hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded',
                      highlight ? 'text-primary hover:text-primary/90 font-medium' : 'text-background/75'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Hỗ trợ" className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-background/90">Hỗ Trợ</h3>
            <ul className="space-y-3">
              {supportLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-background/75 hover:text-background text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-background/90">Liên Hệ</h3>
            <ul className="space-y-3 text-sm text-background/75">
              {store.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
                  <span>{store.address}</span>
                </li>
              )}
              {store.hotline && (
                <li>
                  <a href={telHref} className="flex items-center gap-3 hover:text-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                    <Phone className="h-5 w-5 text-primary shrink-0" aria-hidden /> {store.hotline}
                  </a>
                </li>
              )}
              {store.supportEmail && (
                <li>
                  <a href={mailHref} className="flex items-center gap-3 hover:text-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                    <Mail className="h-5 w-5 text-primary shrink-0" aria-hidden /> {store.supportEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-background/50 text-xs sm:text-sm order-2 sm:order-1">
            © {new Date().getFullYear()} {store.storeName || 'NOVAWEAR'}. Đã đăng ký bản quyền.
          </p>
          <div className="flex items-center gap-5 order-1 sm:order-2">
            <span className="sr-only">Thanh toán: </span>
            <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png" alt="VNPay" className="h-5 opacity-70" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 opacity-70" />
            <img src="/public/images/momo.svg" alt="Momo" className="h-10 opacity-70" />
          </div>
          <div className="flex items-center gap-6 text-xs sm:text-sm text-background/50 order-3">
            <Link to="/privacy" className="hover:text-background transition-colors">Chính Sách Bảo Mật</Link>
            <Link to="/terms" className="hover:text-background transition-colors">Điều Khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
