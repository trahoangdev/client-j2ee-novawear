import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container py-12 md:py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Đăng Ký Nhận Tin
            </h3>
            <p className="text-background/70 mb-6">
              Nhận thông tin về các bộ sưu tập mới và ưu đãi độc quyền
            </p>
            <form className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus-visible:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90 shrink-0">
                Đăng Ký
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h2 className="font-display text-2xl font-bold">
                NOVA<span className="text-primary">WEAR</span>
              </h2>
            </Link>
            <p className="text-background/70 text-sm mb-6 leading-relaxed">
              Thời trang Việt Nam hiện đại, kết hợp hoàn hảo giữa phong cách đương đại và chất lượng cao cấp.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.894c-.198.198-.518.198-.716 0l-2.122-2.122c-.198-.198-.518-.198-.716 0l-2.122 2.122c-.198.198-.518.198-.716 0-.198-.198-.198-.518 0-.716l2.122-2.122c.198-.198.198-.518 0-.716l-2.122-2.122c-.198-.198-.198-.518 0-.716.198-.198.518-.198.716 0l2.122 2.122c.198.198.518.198.716 0l2.122-2.122c.198-.198.518-.198.716 0 .198.198.198.518 0 .716l-2.122 2.122c-.198.198-.198.518 0 .716l2.122 2.122c.198.198.198.518 0 .716z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Mua Sắm</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-background/70 hover:text-background text-sm transition-colors">
                  Tất Cả Sản Phẩm
                </Link>
              </li>
              <li>
                <Link to="/shop?category=tops" className="text-background/70 hover:text-background text-sm transition-colors">
                  Áo
                </Link>
              </li>
              <li>
                <Link to="/shop?category=pants" className="text-background/70 hover:text-background text-sm transition-colors">
                  Quần
                </Link>
              </li>
              <li>
                <Link to="/shop?category=dresses" className="text-background/70 hover:text-background text-sm transition-colors">
                  Váy
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="text-background/70 hover:text-background text-sm transition-colors">
                  Phụ Kiện
                </Link>
              </li>
              <li>
                <Link to="/shop?sale=true" className="text-primary hover:text-primary/80 text-sm transition-colors font-medium">
                  Khuyến Mãi
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-background/70 hover:text-background text-sm transition-colors">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-background/70 hover:text-background text-sm transition-colors">
                  Chính Sách Vận Chuyển
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-background/70 hover:text-background text-sm transition-colors">
                  Đổi Trả & Hoàn Tiền
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-background/70 hover:text-background text-sm transition-colors">
                  Hướng Dẫn Chọn Size
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-background text-sm transition-colors">
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên Hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-background/70 text-sm">
                  123 Nguyễn Huệ, Quận 1,<br />TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:1900123456" className="text-background/70 hover:text-background text-sm transition-colors">
                  1900 123 456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:support@novawear.vn" className="text-background/70 hover:text-background text-sm transition-colors">
                  support@novawear.vn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © 2024 NOVAWEAR. Đã đăng ký bản quyền.
          </p>
          <div className="flex items-center gap-4">
            <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png" alt="VNPay" className="h-6 opacity-70" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-70" />
            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="Momo" className="h-6 opacity-70" />
          </div>
          <div className="flex items-center gap-4 text-sm text-background/50">
            <Link to="/privacy" className="hover:text-background transition-colors">
              Chính Sách Bảo Mật
            </Link>
            <Link to="/terms" className="hover:text-background transition-colors">
              Điều Khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
