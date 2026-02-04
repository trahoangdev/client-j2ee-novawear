import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminSettings() {
  return (
    <div>
      <h2 className="font-display text-h3 mb-4 text-card-foreground">Cài đặt</h2>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-card-foreground">Hệ thống</CardTitle>
          <CardDescription className="text-muted-foreground">
            Phần cài đặt hệ thống sẽ được bổ sung khi tích hợp backend (JWT, CORS, v.v.).
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
