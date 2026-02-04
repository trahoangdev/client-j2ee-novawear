import { ContentPageLayout } from '@/components/layout/ContentPageLayout';

export function ShippingPage() {
  return (
    <ContentPageLayout title="Chính Sách Vận Chuyển">
      <div className="space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Phạm vi giao hàng</h2>
          <p>NOVAWEAR giao hàng toàn quốc. Đơn nội thành TP. Hồ Chí Minh và Hà Nội thường giao trong 1–3 ngày; các tỉnh thành khác từ 3–7 ngày làm việc tùy địa chỉ.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Phí vận chuyển</h2>
          <p>Đơn từ 500.000₫ trở lên được miễn phí vận chuyển. Dưới 500.000₫ phí 30.000₫. Một số khu vực xa có thể áp dụng phí bổ sung (sẽ thông báo khi đặt hàng).</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Theo dõi đơn hàng</h2>
          <p>Bạn có thể xem trạng thái đơn tại mục Đơn hàng (sau khi đăng nhập). Khi đơn được giao cho đơn vị vận chuyển, chúng tôi sẽ cập nhật thông tin theo dõi nếu có.</p>
        </section>
      </div>
    </ContentPageLayout>
  );
}
