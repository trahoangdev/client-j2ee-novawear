import { api } from '@/lib/api';
import type {
  CategoryDto,
  ProductDto,
  OrderDto,
  ReviewDto,
  CartItemDto,
  BannerDto,
  Page,
  FlashSaleDto,
  NotificationDto,
  ReturnRequestDto,
  BundleDto,
} from '@/types/api';

/** Public – không cần đăng nhập */
export const bannersApi = {
  listActive: () => api.get<BannerDto[]>('/api/banners'),
  getPromo: () => api.get<BannerDto>('/api/banners/promo'),
};

export const categoriesApi = {
  list: () => api.get<CategoryDto[]>('/api/categories'),
  getById: (id: number) => api.get<CategoryDto>(`/api/categories/${id}`),
};

export const productsApi = {
  list: (params?: {
    page?: number;
    size?: number;
    categoryId?: number;
    search?: string;
    onSale?: boolean;
    bestseller?: boolean;
    isNew?: boolean;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    colors?: string[];
    rating?: number;
  }) =>
    api.get<Page<ProductDto>>('/api/products', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 12,
        ...(params?.categoryId != null && { categoryId: params.categoryId }),
        ...(params?.search != null && params.search !== '' && { search: params.search }),
        ...(params?.onSale === true && { onSale: true }),
        ...(params?.bestseller === true && { bestseller: true }),
        ...(params?.isNew === true && { isNew: true }),
        ...(params?.gender != null && params.gender !== '' && { gender: params.gender }),
        ...(params?.minPrice != null && { minPrice: params.minPrice }),
        ...(params?.maxPrice != null && { maxPrice: params.maxPrice }),
        ...(params?.sizes != null && params.sizes.length > 0 && { sizes: params.sizes.join(',') }),
        ...(params?.colors != null && params.colors.length > 0 && { colors: params.colors.join(',') }),
        ...(params?.rating != null && { rating: params.rating }),
      },
    }),
  featured: () => api.get<ProductDto[]>('/api/products/featured'),
  bestseller: () => api.get<ProductDto[]>('/api/products/bestseller'),
  getById: (id: number) => api.get<ProductDto>(`/api/products/${id}`),
  getBySlug: (slug: string) => api.get<ProductDto>(`/api/products/slug/${slug}`),
  getFilters: () => api.get<import('@/types/api').ProductFiltersDto>('/api/products/filters'),
};

export const reviewsApi = {
  getByProduct: (productId: number, params?: { page?: number; size?: number }) =>
    api.get<ReviewDto[]>(`/api/reviews/product/${productId}`, {
      params: { page: params?.page ?? 0, size: params?.size ?? 10 },
    }),
  create: (productId: number, data: { rating: number; comment: string }) =>
    api.post<ReviewDto>(`/api/reviews/product/${productId}`, data),
  createWithImages: (productId: number, data: { rating: number; comment: string; images?: File[] }) => {
    const formData = new FormData();
    formData.append('rating', String(data.rating));
    formData.append('comment', data.comment);
    if (data.images) {
      data.images.forEach((file) => formData.append('images', file));
    }
    return api.post<ReviewDto>(`/api/reviews/product/${productId}/with-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/** Cart – cần đăng nhập */
export const cartApi = {
  get: () => api.get<CartItemDto[]>('/api/cart'),
  add: (productId: number, quantity: number) =>
    api.post<CartItemDto[]>('/api/cart/add', { productId, quantity }),
  update: (productId: number, quantity: number) =>
    api.put<CartItemDto[]>(`/api/cart/items/${productId}`, null, { params: { quantity } }),
  remove: (productId: number) => api.delete<CartItemDto[]>(`/api/cart/items/${productId}`),
};

/** Orders – cần đăng nhập */
export const ordersApi = {
  myOrders: (params?: { page?: number; size?: number }) =>
    api.get<Page<OrderDto>>('/api/orders', {
      params: { page: params?.page ?? 0, size: params?.size ?? 10 },
    }),
  getById: (id: number) => api.get<OrderDto>(`/api/orders/${id}`),
  checkout: (
    paymentMethod: string,
    items: { productId: number; quantity: number }[],
    shipping?: { recipientName: string; address: string; phone: string; note: string },
    voucherCode?: string
  ) =>
    api.post<OrderDto>('/api/orders/checkout', {
      paymentMethod,
      items,
      ...(shipping && {
        recipientName: shipping.recipientName,
        address: shipping.address,
        phone: shipping.phone,
        note: shipping.note,
      }),
      ...(voucherCode && { voucherCode }),
    }),
  cancel: (id: number, reason: string) =>
    api.post<OrderDto>(`/api/orders/${id}/cancel`, null, { params: { reason } }),
};

/** VNPAY Payment */
export const vnpayApi = {
  createPaymentUrl: (orderId: number) =>
    api.post<{ code: string; message: string; data: string }>(
      '/api/payment/vnpay/create-payment-url',
      null,
      { params: { orderId } }
    ),
  processReturn: (params: Record<string, string>) =>
    api.get<{
      success: boolean;
      orderId?: number;
      orderCode?: string;
      amount?: number;
      responseCode?: string;
      transactionNo?: string;
      message: string;
    }>('/api/payment/vnpay/return', { params }),
};

/** Auth – đổi mật khẩu & cập nhật hồ sơ */
export const authApi = {
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => api.post<{ message: string }>('/api/auth/change-password', data),

  updateProfile: (data: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => api.put<import('@/types/api').UserResponse>('/api/auth/profile', data),
};

/** Newsletter */
export const newsletterApi = {
  subscribe: (email: string) =>
    api.post<import('@/types/api').SubscriberDto>('/api/newsletter/subscribe', { email }),
  unsubscribe: (email: string) =>
    api.post<{ message: string }>('/api/newsletter/unsubscribe', { email }),
};

/** Flash Sales – public */
export const flashSalesApi = {
  getActive: () => api.get<FlashSaleDto[]>('/api/flash-sales/active'),
};

/** Notifications – authenticated */
export const notificationsApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get<Page<NotificationDto>>('/api/notifications', {
      params: { page: params?.page ?? 0, size: params?.size ?? 20 },
    }),
  unreadCount: () => api.get<{ count: number }>('/api/notifications/unread-count'),
  markAsRead: (id: number) => api.patch<NotificationDto>(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.post<{ message: string }>('/api/notifications/read-all'),
};

/** Return Requests – authenticated */
export const returnsApi = {
  create: (orderId: number, reason: string, images?: File[]) => {
    const formData = new FormData();
    formData.append('orderId', String(orderId));
    formData.append('reason', reason);
    if (images) {
      images.forEach((file) => formData.append('images', file));
    }
    return api.post<ReturnRequestDto>('/api/returns', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  myReturns: (params?: { page?: number; size?: number }) =>
    api.get<Page<ReturnRequestDto>>('/api/returns/my', {
      params: { page: params?.page ?? 0, size: params?.size ?? 10 },
    }),
};

/** Bundles / Combo */
export const bundlesApi = {
  list: () => api.get<BundleDto[]>('/api/bundles'),
  getById: (id: number) => api.get<BundleDto>(`/api/bundles/${id}`),
};
