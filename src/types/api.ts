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
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
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
