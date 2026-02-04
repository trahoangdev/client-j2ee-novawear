import { MapPin, Phone, Mail } from 'lucide-react';
import { ContentPageLayout } from '@/components/layout/ContentPageLayout';
import { useAppSettingsReadOnly } from '@/context/AppSettingsContext';

export function ContactPage() {
  const { store } = useAppSettingsReadOnly();
  const telHref = store.hotline ? `tel:${store.hotline.replace(/\s/g, '')}` : undefined;
  const mailHref = store.supportEmail ? `mailto:${store.supportEmail}` : undefined;

  return (
    <ContentPageLayout title="Liên Hệ">
      <div className="space-y-6 text-sm text-muted-foreground">
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn. Liên hệ qua các kênh sau:</p>
        <ul className="space-y-4 list-none pl-0">
          {store.address && (
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Địa chỉ</span>
                <p className="mt-1">{store.address}</p>
              </div>
            </li>
          )}
          {store.hotline && (
            <li className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Hotline</span>
                <p className="mt-1">
                  <a href={telHref} className="hover:text-foreground underline">{store.hotline}</a>
                </p>
              </div>
            </li>
          )}
          {store.supportEmail && (
            <li className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Email</span>
                <p className="mt-1">
                  <a href={mailHref} className="hover:text-foreground underline">{store.supportEmail}</a>
                </p>
              </div>
            </li>
          )}
        </ul>
        <p>Giờ làm việc: Thứ 2 – Thứ 7, 8:00 – 17:00.</p>
      </div>
    </ContentPageLayout>
  );
}
