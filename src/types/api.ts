/** API types matching server-novawear DTOs */

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface ProductColorDto {
  name: string;
  hex: string;
}

export interface ProductDto {
  id: number;
  name: string;
  slug?: string;
  price: number;
  description?: string;
  imageUrl?: string;
  /** Danh sách URL hình ảnh */
  images?: string[];
  categoryId: number;
  categoryName?: string;
  stock: number;
  /** Giá khuyến mãi (null = không giảm). Hiển thị Sale khi salePrice < price */
  salePrice?: number | null;
  /** Nổi bật: hiển thị block "Sản phẩm nổi bật" trang chủ */
  featured?: boolean;
  /** Bán chạy: nhãn do admin đánh dấu */
  bestseller?: boolean;
  /** Hàng mới: badge "Mới" trên thẻ sản phẩm */
  isNew?: boolean;
  sizes?: string[];
  colors?: ProductColorDto[];
  isFlashSale?: boolean;
  /** Giới tính: MALE, FEMALE, UNISEX */
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
}

export interface OrderDetailDto {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderDto {
  id: number;
  /** Mã đơn hàng: dãy 4–6 chữ số */
  orderNumber?: string;
  userId: number;
  username: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  recipientName?: string;
  address?: string;
  phone?: string;
  note?: string;
  orderDetails?: OrderDetailDto[];
  /** Voucher fields */
  voucherId?: number;
  voucherCode?: string;
  discountAmount?: number;
  paymentMethod?: string;
  /** Tracking fields */
  trackingNumber?: string;
  carrier?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role: string;
  active: boolean;
}

export interface ReviewDto {
  id: number;
  productId: number;
  userId: number;
  username: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  images?: string[];
}

export interface RevenueByDayDto {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueStatsDto {
  totalRevenue: number;
  totalOrders: number;
  from: string;
  to: string;
  byDay: RevenueByDayDto[];
}

export interface BannerDto {
  id: number;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  ctaText?: string;
  description?: string;
  ctaText2?: string;
  linkUrl2?: string;
  badgeText?: string;
  bannerType?: 'CAROUSEL' | 'PROMO';
  sortOrder: number;
  active: boolean;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

/** Spring Page<T> */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CartItemDto {
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface TopProductDto {
  id: number;
  name: string;
  imageUrl?: string;
  totalSold: number;
}

/** Voucher DTOs */
export interface VoucherDto {
  id: number;
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount: number;
  usageLimitPerUser?: number;
  active: boolean;
  createdAt: string;
  isValid?: boolean;
  discountDisplay?: string;
}

export interface VoucherValidateResponse {
  valid: boolean;
  message: string;
  voucher?: VoucherDto;
  discountAmount?: number;
  finalTotal?: number;
}


export interface ProductFiltersDto {
  minPrice: number | null;
  maxPrice: number | null;
  sizes: string[];
  colors: import('./api').ProductColorDto[];
}

/** Flash Sale */
export interface FlashSaleItemDto {
  id: number;
  productId: number;
  productName: string;
  productSlug?: string;
  productImage?: string;
  originalPrice: number;
  salePrice: number;
  quantity: number;
  soldCount: number;
}

export interface FlashSaleDto {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  discountPercent: number;
  active: boolean;
  products: FlashSaleItemDto[];
  createdAt: string;
}

/** Notification */
export interface NotificationDto {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  linkTo?: string;
  createdAt: string;
}

/** Return Request */
export interface ReturnRequestDto {
  id: number;
  orderId: number;
  orderCode: string;
  userId: number;
  username: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  images: string[];
  adminNote?: string;
  createdAt: string;
}

/** Subscriber (Newsletter) */
export interface SubscriberDto {
  id: number;
  email: string;
  active: boolean;
  subscribedAt: string;
}

/** Bundle Item */
export interface BundleItemDto {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  productPrice: number;
  quantity: number;
}

/** Product Bundle / Combo */
export interface BundleDto {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  discountPercent: number;
  active: boolean;
  totalOriginalPrice: number;
  bundlePrice: number;
  items: BundleItemDto[];
  createdAt: string;
}

/** Viewed Product DTO */
export interface ViewedProductDto {
  id: number;
  productId: number;
  viewedAt: string;
  product: ProductDto;
}
