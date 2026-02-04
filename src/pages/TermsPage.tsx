import { ContentPageLayout } from '@/components/layout/ContentPageLayout';

export function TermsPage() {
  return (
    <ContentPageLayout title="Điều Khoản Sử Dụng">
      <div className="space-y-6 text-sm text-muted-foreground">
        <p>Khi truy cập và sử dụng website NOVAWEAR, bạn đồng ý tuân thủ các điều khoản dưới đây.</p>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Sử dụng dịch vụ</h2>
          <p>Bạn cam kết cung cấp thông tin chính xác khi đăng ký và đặt hàng; không sử dụng website cho mục đích bất hợp pháp hoặc gây hại đến hệ thống hay người dùng khác.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Đơn hàng và thanh toán</h2>
          <p>Đơn hàng có hiệu lực khi bạn xác nhận và chúng tôi gửi email/xác nhận. Giá hiển thị đã bao gồm VAT (nếu có). Chính sách đổi trả và hoàn tiền áp dụng theo trang Đổi trả & Hoàn tiền.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Sở hữu trí tuệ</h2>
          <p>Nội dung trên website (logo, hình ảnh, text) thuộc quyền sở hữu của NOVAWEAR hoặc bên cấp phép. Bạn không được sao chép, phân phối hoặc sử dụng thương mại mà không có sự cho phép.</p>
        </section>
        <p>Chúng tôi có thể cập nhật điều khoản; phiên bản mới có hiệu lực khi đăng tải. Liên hệ support@novawear.vn nếu có thắc mắc.</p>
      </div>
    </ContentPageLayout>
  );
}
