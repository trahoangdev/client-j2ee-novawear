import { ContentPageLayout } from '@/components/layout/ContentPageLayout';

export function SizeGuidePage() {
  return (
    <ContentPageLayout title="Hướng Dẫn Chọn Size" description="Bảng size chi tiết cho nam nữ. Hướng dẫn cách đo và chọn size phù hợp tại NOVAWEAR.">
      <div className="space-y-6 text-sm text-muted-foreground">
        <p>Tham khảo bảng size dưới đây để chọn size phù hợp. Nếu số đo của bạn nằm giữa hai size, nên chọn size lớn hơn để thoải mái.</p>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Áo (cm)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg overflow-hidden text-left">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 font-medium text-foreground">Size</th>
                  <th className="p-3 font-medium text-foreground">Vòng ngực</th>
                  <th className="p-3 font-medium text-foreground">Vòng eo</th>
                  <th className="p-3 font-medium text-foreground">Vòng mông</th>
                  <th className="p-3 font-medium text-foreground">Dài áo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['S', '86-90', '66-70', '88-92', '58-60'],
                  ['M', '90-94', '70-74', '92-96', '60-62'],
                  ['L', '94-98', '74-78', '96-100', '62-64'],
                  ['XL', '98-102', '78-82', '100-104', '64-66'],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {row.map((cell, j) => (
                      <td key={j} className="p-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Quần (cm)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg overflow-hidden text-left">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 font-medium text-foreground">Size</th>
                  <th className="p-3 font-medium text-foreground">Vòng eo</th>
                  <th className="p-3 font-medium text-foreground">Vòng mông</th>
                  <th className="p-3 font-medium text-foreground">Dài quần</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['S', '66-70', '88-92', '95-98'],
                  ['M', '70-74', '92-96', '98-100'],
                  ['L', '74-78', '96-100', '100-102'],
                  ['XL', '78-82', '100-104', '102-104'],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {row.map((cell, j) => (
                      <td key={j} className="p-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p>Mọi thắc mắc về size vui lòng liên hệ support@novawear.vn hoặc 1900 123 456.</p>
      </div>
    </ContentPageLayout>
  );
}
