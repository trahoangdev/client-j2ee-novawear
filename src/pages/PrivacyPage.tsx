import { ContentPageLayout } from '@/components/layout/ContentPageLayout';

export function PrivacyPage() {
  return (
    <ContentPageLayout title="Chính Sách Bảo Mật">
      <div className="space-y-6 text-sm text-muted-foreground">
        <p>NOVAWEAR cam kết bảo vệ thông tin cá nhân của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo mật dữ liệu.</p>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Thông tin chúng tôi thu thập</h2>
          <p>Chúng tôi thu thập thông tin bạn cung cấp khi đăng ký, đặt hàng hoặc liên hệ: họ tên, email, số điện thoại, địa chỉ giao hàng. Dữ liệu thanh toán được xử lý qua cổng thanh toán (Momo, PayPal) và không lưu thẻ trên hệ thống của chúng tôi.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Mục đích sử dụng</h2>
          <p>Thông tin được dùng để xử lý đơn hàng, giao hàng, hỗ trợ khách hàng và gửi thông báo liên quan đến đơn (nếu cần). Chúng tôi không bán hoặc chuyển dữ liệu cá nhân cho bên thứ ba vì mục đích marketing mà không có sự đồng ý của bạn.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Bảo mật</h2>
          <p>Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu khỏi truy cập trái phép, mất mát hoặc lạm dụng.</p>
        </section>
        <p>Mọi thắc mắc về bảo mật vui lòng gửi đến support@novawear.vn.</p>
      </div>
    </ContentPageLayout>
  );
}
