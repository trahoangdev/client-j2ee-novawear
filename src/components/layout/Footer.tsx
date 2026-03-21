import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, Check, Loader2, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSettingsReadOnly } from '@/context/AppSettingsContext';
import { newsletterApi } from '@/lib/customerApi';

const shopLinks = [
  { to: '/shop', label: 'Tất Cả Sản Phẩm' },
  { to: '/nam', label: 'Thời Trang Nam' },
  { to: '/nu', label: 'Thời Trang Nữ' },
  { to: '/unisex', label: 'Unisex Bộ Phối' },
  { to: '/shop?isNew=true', label: 'Hàng Mới Về' },
  { to: '/shop?bestseller=true', label: 'Bán Chạy Nhất' },
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
    <footer className="bg-[#050505] text-white pt-20 pb-8 relative overflow-hidden" role="contentinfo">
      {/* Decorative Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -top-40 left-1/4 w-[40rem] h-[20rem] bg-primary/10 rounded-[100%] blur-[100px] pointer-events-none" />
      <div className="absolute -top-40 right-1/4 w-[40rem] h-[20rem] bg-blue-500/5 rounded-[100%] blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Feature / Newsletter Banner */}
        {general.newsletterEnabled && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-20 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 blur-[80px]" />
            <div className="md:w-1/2 relative z-10">
              <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-black mb-4 tracking-tight drop-shadow-lg">
                Đăng ký nhận tin từ <BrandName name={store.storeName || 'NOVAWEAR'} />
              </h3>
              <p className="text-white/60 text-sm md:text-base leading-relaxed">
                Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên của bạn và là người đầu tiên biết về các đợt phát hành mới, bộ sưu tập độc quyền.
              </p>
            </div>
            <div className="w-full md:w-[45%] relative z-10">
              <form onSubmit={handleNewsletterSubmit} className="relative">
                <div className="flex items-center bg-black/40 border border-white/20 p-2 rounded-2xl focus-within:border-primary/60 focus-within:bg-black/60 transition-all shadow-xl">
                  <div className="pl-4 pr-2">
                    <Mail className="h-5 w-5 text-white/40" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Địa chỉ email của bạn..."
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    className="flex-1 border-0 bg-transparent text-white placeholder:text-white/40 shadow-none focus-visible:ring-0 text-base h-12"
                    disabled={nlStatus === 'loading'}
                  />
                  <Button type="submit" disabled={nlStatus === 'loading'} className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-transform active:scale-95 shadow-lg group">
                    {nlStatus === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> :
                     nlStatus === 'success' ? <Check className="h-5 w-5" /> :
                     <span className="flex items-center gap-2">Gửi <Send className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" /></span>}
                  </Button>
                </div>
              </form>
              {nlStatus === 'success' && <p className="text-green-400 text-sm mt-3 ml-2 font-medium flex items-center gap-1.5"><Check className="h-4 w-4" /> Đăng ký thành công!</p>}
              {nlStatus === 'error' && <p className="text-red-400 text-sm mt-3 ml-2 font-medium">Có lỗi xảy ra, vui lòng thử lại sau.</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8 pr-0 lg:pr-8">
            <Link to="/" className="inline-block focus:outline-none">
              <span className="font-display text-4xl font-black tracking-tighter">
                <BrandName name={store.storeName || 'NOVAWEAR'} />
              </span>
            </Link>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-md">
              {store.tagline || 'Thương hiệu thời trang mang dấn ấn hiện đại, mang đến sự tự tin và chuẩn mực cho cuộc sống của bạn.'}
            </p>

            <div className="flex gap-4">
              {store.facebookUrl && (
                <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 group border border-white/10 hover:border-blue-500 shadow-sm hover:shadow-blue-600/20 hover:-translate-y-1" aria-label="Facebook">
                  <Facebook className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                </a>
              )}
              {store.instagramUrl && (
                <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300 group border border-white/10 hover:border-pink-500 shadow-sm hover:shadow-pink-600/20 hover:-translate-y-1" aria-label="Instagram">
                  <Instagram className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                </a>
              )}
              {store.zaloUrl && (
                <a href={store.zaloUrl.startsWith('http') ? store.zaloUrl : `https://zalo.me/${store.zaloUrl.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all duration-300 group border border-white/10 hover:border-blue-400 shadow-sm hover:shadow-blue-500/20 hover:-translate-y-1" aria-label="Zalo">
                  <svg className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-lg text-white font-display tracking-wide uppercase">Mua Sắm</h3>
            <ul className="space-y-4">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className={cn(
                      "text-[15px] transition-all flex items-center w-fit",
                      link.highlight
                        ? "text-red-400 font-bold hover:text-red-300 hover:translate-x-1.5"
                        : "text-white/60 hover:text-primary hover:translate-x-1.5 font-medium"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-lg text-white font-display tracking-wide uppercase">Hỗ Trợ</h3>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/60 hover:text-primary transition-all text-[15px] font-medium hover:translate-x-1.5 flex items-center w-fit">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-bold text-lg text-white font-display tracking-wide uppercase">Liên Hệ</h3>
            <ul className="space-y-5 text-[15px] text-white/60 font-medium">
              {store.address && (
                <li className="flex items-start gap-4 group">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <span className="leading-relaxed mt-1.5">{store.address}</span>
                </li>
              )}
              {store.hotline && (
                <li>
                  <a href={telHref} className="flex items-center gap-4 group w-fit">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <span className="group-hover:text-white transition-colors">{store.hotline}</span>
                  </a>
                </li>
              )}
              {store.supportEmail && (
                <li>
                  <a href={mailHref} className="flex items-center gap-4 group w-fit break-all">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span className="group-hover:text-white transition-colors">{store.supportEmail}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/40 text-sm font-medium text-center md:text-left">
            © {new Date().getFullYear()} {store.storeName || 'NOVAWEAR'}. Tất cả quyền được bảo lưu.
          </p>

          <div className="flex items-center gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png" alt="VNPay" className="h-9 w-auto object-contain bg-white rounded flex items-center justify-center p-1" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-9 w-auto object-contain bg-white rounded flex items-center justify-center p-1" />
            <img src="/images/momo.svg" alt="Momo" className="h-9 w-auto object-contain bg-white rounded flex items-center justify-center p-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
