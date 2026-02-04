import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAppSettings } from '@/context/AppSettingsContext';
import { defaultAppSettings } from '@/types/settings';
import { toast } from '@/lib/toast';
import {
  Store,
  Sliders,
  Info,
  RotateCcw,
  Save,
  Loader2,
} from 'lucide-react';
import type { StoreInfo, GeneralConfig } from '@/types/settings';

export function AdminSettings() {
  const { settings, updateSettings, save, resetToDefaults } = useAppSettings();
  const [storeForm, setStoreForm] = useState<StoreInfo>(settings.store);
  const [generalForm, setGeneralForm] = useState<GeneralConfig>(settings.general);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setStoreForm(settings.store);
    setGeneralForm(settings.general);
  }, [settings.store, settings.general]);

  const handleStoreChange = (field: keyof StoreInfo, value: string) => {
    setStoreForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleGeneralChange = <K extends keyof GeneralConfig>(field: K, value: GeneralConfig[K]) => {
    setGeneralForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    setSaving(true);
    updateSettings({ store: storeForm, general: generalForm });
    save();
    setDirty(false);
    setSaving(false);
    toast.success('Đã lưu cài đặt.');
  };

  const handleReset = () => {
    if (!confirm('Khôi phục toàn bộ cài đặt về mặc định? Thông tin cửa hàng và cấu hình sẽ bị thay thế.')) return;
    resetToDefaults();
    setStoreForm(defaultAppSettings.store);
    setGeneralForm(defaultAppSettings.general);
    setDirty(false);
    toast.success('Đã khôi phục mặc định.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-display text-h3 text-card-foreground">Cài đặt tổng</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Khôi phục mặc định
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList className="bg-muted/80">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            Thông tin cửa hàng
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Sliders className="h-4 w-4" />
            Cấu hình chung
          </TabsTrigger>
          <TabsTrigger value="tech" className="gap-2">
            <Info className="h-4 w-4" />
            Tham chiếu kỹ thuật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-4">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-card-foreground">Thông tin hiển thị</CardTitle>
              <CardDescription className="text-muted-foreground">
                Tên cửa hàng, liên hệ và mạng xã hội dùng trên Header, Footer và trang Liên hệ.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="storeName">Tên cửa hàng</Label>
                <Input
                  id="storeName"
                  value={storeForm.storeName}
                  onChange={(e) => handleStoreChange('storeName', e.target.value)}
                  placeholder="VD: NOVAWEAR"
                  className="max-w-md"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tagline">Câu mô tả (Footer)</Label>
                <Textarea
                  id="tagline"
                  value={storeForm.tagline}
                  onChange={(e) => handleStoreChange('tagline', e.target.value)}
                  placeholder="Một dòng mô tả ngắn..."
                  rows={2}
                  className="max-w-xl"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div className="grid gap-2">
                  <Label htmlFor="supportEmail">Email hỗ trợ</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={storeForm.supportEmail}
                    onChange={(e) => handleStoreChange('supportEmail', e.target.value)}
                    placeholder="support@novawear.vn"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hotline">Hotline</Label>
                  <Input
                    id="hotline"
                    value={storeForm.hotline}
                    onChange={(e) => handleStoreChange('hotline', e.target.value)}
                    placeholder="1900 123 456"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={storeForm.address}
                  onChange={(e) => handleStoreChange('address', e.target.value)}
                  placeholder="Địa chỉ cửa hàng"
                  rows={2}
                  className="max-w-xl"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                <div className="grid gap-2">
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    value={storeForm.facebookUrl}
                    onChange={(e) => handleStoreChange('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={storeForm.instagramUrl}
                    onChange={(e) => handleStoreChange('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zaloUrl">Zalo (URL hoặc số)</Label>
                  <Input
                    id="zaloUrl"
                    value={storeForm.zaloUrl}
                    onChange={(e) => handleStoreChange('zaloUrl', e.target.value)}
                    placeholder="https://zalo.me/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-card-foreground">Cấu hình chung</CardTitle>
              <CardDescription className="text-muted-foreground">
                Đánh giá, đơn hàng tối thiểu và phương thức thanh toán hiển thị cho khách.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label className="text-base">Đánh giá cần duyệt</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Bình luận/đánh giá chỉ hiển thị sau khi admin duyệt.
                  </p>
                </div>
                <Switch
                  checked={generalForm.reviewRequiresApproval}
                  onCheckedChange={(v) => handleGeneralChange('reviewRequiresApproval', v)}
                />
              </div>
              <div className="grid gap-2 max-w-xs">
                <Label htmlFor="minOrderAmount">Đơn hàng tối thiểu (VNĐ)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min={0}
                  value={generalForm.minOrderAmount || ''}
                  onChange={(e) => handleGeneralChange('minOrderAmount', Number(e.target.value) || 0)}
                  placeholder="0 = không giới hạn"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base">Phương thức thanh toán (ẩn/hiện tại checkout)</Label>
                <p className="text-sm text-muted-foreground">
                  Chỉ điều khiển hiển thị lựa chọn. Tích hợp gateway thật (redirect, webhook) cần cấu hình backend riêng.
                </p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="pay-cod"
                      checked={generalForm.paymentCodEnabled}
                      onCheckedChange={(v) => handleGeneralChange('paymentCodEnabled', v)}
                    />
                    <Label htmlFor="pay-cod">COD</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="pay-momo"
                      checked={generalForm.paymentMomoEnabled}
                      onCheckedChange={(v) => handleGeneralChange('paymentMomoEnabled', v)}
                    />
                    <Label htmlFor="pay-momo">Momo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="pay-paypal"
                      checked={generalForm.paymentPayPalEnabled}
                      onCheckedChange={(v) => handleGeneralChange('paymentPayPalEnabled', v)}
                    />
                    <Label htmlFor="pay-paypal">PayPal</Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label className="text-base">Đăng ký nhận tin (Footer)</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Hiển thị form đăng ký email nhận tin khuyến mãi ở chân trang.
                  </p>
                </div>
                <Switch
                  checked={generalForm.newsletterEnabled}
                  onCheckedChange={(v) => handleGeneralChange('newsletterEnabled', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech" className="space-y-4">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-card-foreground">Tham chiếu kỹ thuật</CardTitle>
              <CardDescription className="text-muted-foreground">
                Thông tin cấu hình backend (chỉ đọc, thay đổi tại server).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <dl className="grid gap-2 rounded-lg bg-muted/50 p-4">
                <div>
                  <dt className="font-medium text-muted-foreground">Xác thực</dt>
                  <dd>JWT (Bearer token), cấu hình tại SecurityConfig, JwtUtil.</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">CORS</dt>
                  <dd>WebCorsConfig: allowedOrigins từ application.properties (cors.allowed-origins).</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Cài đặt lưu ở đâu?</dt>
                  <dd>Hiện tại: localStorage (key: novawear_app_settings). Sau có thể chuyển sang API /api/admin/settings.</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
