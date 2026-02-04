/** API types matching server-novawear DTOs */

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
}

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  stock: number;
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
