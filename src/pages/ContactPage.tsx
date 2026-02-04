import { MapPin, Phone, Mail } from 'lucide-react';
import { ContentPageLayout } from '@/components/layout/ContentPageLayout';

export function ContactPage() {
  return (
    <ContentPageLayout title="Liên Hệ">
      <div className="space-y-6 text-sm text-muted-foreground">
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn. Liên hệ qua các kênh sau:</p>
        <ul className="space-y-4 list-none pl-0">
          <li className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Địa chỉ</span>
              <p className="mt-1">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Hotline</span>
              <p className="mt-1">
                <a href="tel:1900123456" className="hover:text-foreground underline">1900 123 456</a>
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Email</span>
              <p className="mt-1">
                <a href="mailto:support@novawear.vn" className="hover:text-foreground underline">support@novawear.vn</a>
              </p>
            </div>
          </li>
        </ul>
        <p>Giờ làm việc: Thứ 2 – Thứ 7, 8:00 – 17:00.</p>
      </div>
    </ContentPageLayout>
  );
}
