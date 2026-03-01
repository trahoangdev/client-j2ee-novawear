import { ContentPageLayout } from '@/components/layout/ContentPageLayout';

const faqs = [
  {
    q: 'Làm thế nào để đặt hàng?',
    a: 'Bạn chọn sản phẩm, thêm vào giỏ hàng, vào Giỏ hàng và tiến hành Thanh toán. Điền thông tin giao hàng, chọn phương thức thanh toán (COD, Momo, PayPal) và xác nhận đơn.',
  },
  {
    q: 'Thời gian giao hàng là bao lâu?',
    a: 'Đơn nội thành TP.HCM/Hà Nội: 1–3 ngày. Các tỉnh khác: 3–7 ngày làm việc tùy khu vực.',
  },
  {
    q: 'Tôi có thể đổi/trả hàng không?',
    a: 'Có. Bạn được đổi size/trả hàng trong vòng 7 ngày kể từ khi nhận, sản phẩm còn nguyên tem, chưa qua sử dụng. Xem chi tiết tại trang Chính sách Đổi trả & Hoàn tiền.',
  },
  {
    q: 'Thanh toán qua những hình thức nào?',
    a: 'Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD), Ví Momo và PayPal.',
  },
  {
    q: 'Làm sao để kiểm tra đơn hàng?',
    a: 'Sau khi đặt hàng bạn nhận mã đơn (6 chữ số). Đăng nhập và vào mục Đơn hàng để xem trạng thái và chi tiết đơn.',
  },
];

export function FaqPage() {
  return (
    <ContentPageLayout title="Câu Hỏi Thường Gặp" description="Giải đáp các thắc mắc về đặt hàng, vận chuyển, đổi trả và thanh toán tại NOVAWEAR.">
      <ul className="space-y-6 list-none pl-0">
        {faqs.map((item, i) => (
          <li key={i} className="border-b border-border pb-6 last:border-0">
            <h2 className="text-lg font-semibold mb-2">{item.q}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
          </li>
        ))}
      </ul>
    </ContentPageLayout>
  );
}
