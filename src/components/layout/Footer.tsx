import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const shopLinks = [
  { to: '/shop', label: 'Tất Cả Sản Phẩm' },
  { to: '/shop?category=tops', label: 'Áo' },
  { to: '/shop?category=pants', label: 'Quần' },
  { to: '/shop?category=dresses', label: 'Váy' },
  { to: '/shop?category=accessories', label: 'Phụ Kiện' },
  { to: '/shop?sale=true', label: 'Khuyến Mãi', highlight: true },
];

const supportLinks = [
  { to: '/faq', label: 'Câu Hỏi Thường Gặp' },
  { to: '/shipping', label: 'Chính Sách Vận Chuyển' },
  { to: '/returns', label: 'Đổi Trả & Hoàn Tiền' },
  { to: '/size-guide', label: 'Hướng Dẫn Chọn Size' },
  { to: '/contact', label: 'Liên Hệ' },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background" role="contentinfo">
      {/* Newsletter */}
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

      {/* Main footer grid */}
      <div className="container px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-x-12 lg:gap-x-14">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              <span className="font-display text-xl font-bold">NOVA<span className="text-primary">WEAR</span></span>
            </Link>
            <p className="text-background/75 text-sm leading-relaxed max-w-xs">
              Thời trang Việt Nam hiện đại, kết hợp phong cách đương đại và chất lượng cao cấp.
            </p>
            <div className="flex gap-3 pt-1">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
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
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li>
                <a href="tel:1900123456" className="flex items-center gap-3 hover:text-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  <Phone className="h-5 w-5 text-primary shrink-0" aria-hidden /> 1900 123 456
                </a>
              </li>
              <li>
                <a href="mailto:support@novawear.vn" className="flex items-center gap-3 hover:text-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  <Mail className="h-5 w-5 text-primary shrink-0" aria-hidden /> support@novawear.vn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-background/50 text-xs sm:text-sm order-2 sm:order-1">
            © {new Date().getFullYear()} NOVAWEAR. Đã đăng ký bản quyền.
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
