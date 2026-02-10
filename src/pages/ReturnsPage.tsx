import { ContentPageLayout } from '@/components/layout/ContentPageLayout';

export function ReturnsPage() {
  return (
    <ContentPageLayout title="Đổi Trả & Hoàn Tiền">
      <div className="space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Điều kiện đổi trả</h2>
          <p>Trong vòng 7 ngày kể từ khi nhận hàng, bạn có thể yêu cầu đổi size hoặc trả hàng nếu sản phẩm còn nguyên tem, chưa qua sử dụng, giặt ủi. Không áp dụng với hàng đã cắt may theo yêu cầu hoặc đồ lót (trừ lỗi từ phía NOVAWEAR).</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Cách thức yêu cầu</h2>
          <p>Liên hệ qua email support@novawear.vn hoặc hotline 1900 123 456, ghi rõ mã đơn hàng và lý do. Chúng tôi sẽ hướng dẫn gửi hàng về và xử lý đổi trả hoặc hoàn tiền trong vòng 7–14 ngày làm việc sau khi nhận hàng.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Hoàn tiền</h2>
          <p>Tiền sẽ được hoàn qua phương thức bạn đã thanh toán (ví Momo, PayPal hoặc chuyển khoản). Thời gian nhận tiền tùy ngân hàng/ví, thường từ 3–10 ngày làm việc.</p>
        </section>
      </div>
    </ContentPageLayout>
  );
}
