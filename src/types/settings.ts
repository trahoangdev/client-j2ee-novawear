/**
 * Cài đặt tổng cho dự án NovaWear.
 * Admin chỉnh tại /admin/settings; lưu localStorage (sau có thể chuyển sang API).
 */

export interface StoreInfo {
  /** Tên cửa hàng (hiển thị Header/Footer) */
  storeName: string;
  /** Câu mô tả ngắn (Footer) */
  tagline: string;
  /** Email hỗ trợ */
  supportEmail: string;
  /** Số hotline (hiển thị, có thể có khoảng trắng) */
  hotline: string;
  /** Địa chỉ (một dòng hoặc nhiều dòng) */
  address: string;
  /** URL Facebook trang cửa hàng */
  facebookUrl: string;
  /** URL Instagram */
  instagramUrl: string;
  /** URL Zalo (trang hoặc số) */
  zaloUrl: string;
}

export interface GeneralConfig {
  /** Đánh giá sản phẩm cần duyệt trước khi hiển thị */
  reviewRequiresApproval: boolean;
  /** Đơn hàng tối thiểu (VNĐ), 0 = không giới hạn */
  minOrderAmount: number;
  /** Bật phương thức thanh toán Momo (chỉ ẩn/hiện lựa chọn, chưa tích hợp gateway) */
  paymentMomoEnabled: boolean;
  /** Bật phương thức thanh toán PayPal */
  paymentPayPalEnabled: boolean;
  /** Bật phương thức COD */
  paymentCodEnabled: boolean;
  /** Hiển thị form đăng ký nhận tin ở Footer */
  newsletterEnabled: boolean;
}

export interface AppSettings {
  store: StoreInfo;
  general: GeneralConfig;
  /** Timestamp lần cập nhật cuối (để sync sau này) */
  updatedAt?: number;
}

const defaultStore: StoreInfo = {
  storeName: 'NOVAWEAR',
  tagline: 'Thời trang Việt Nam hiện đại, kết hợp phong cách đương đại và chất lượng cao cấp.',
  supportEmail: 'support@novawear.vn',
  hotline: '1900 123 456',
  address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  zaloUrl: 'https://zalo.me',
};

const defaultGeneral: GeneralConfig = {
  reviewRequiresApproval: true,
  minOrderAmount: 0,
  paymentMomoEnabled: true,
  paymentPayPalEnabled: true,
  paymentCodEnabled: true,
  newsletterEnabled: false,
};

export const defaultAppSettings: AppSettings = {
  store: defaultStore,
  general: defaultGeneral,
};

const STORAGE_KEY = 'novawear_app_settings';

function loadFromStorage(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      store: { ...defaultStore, ...parsed.store },
      general: { ...defaultGeneral, ...parsed.general },
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return defaultAppSettings;
  }
}

export function saveAppSettingsToStorage(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...settings,
      updatedAt: Date.now(),
    }));
  } catch {
    // ignore
  }
}

export function getAppSettingsFromStorage(): AppSettings {
  return loadFromStorage();
}
