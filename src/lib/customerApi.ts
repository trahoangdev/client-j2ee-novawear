import { api } from '@/lib/api';
import type {
  CategoryDto,
  ProductDto,
  OrderDto,
  ReviewDto,
  CartItemDto,
  BannerDto,
  Page,
} from '@/types/api';

/** Public – không cần đăng nhập */
export const bannersApi = {
  listActive: () => api.get<BannerDto[]>('/api/banners'),
};

export const categoriesApi = {
  list: () => api.get<CategoryDto[]>('/api/categories'),
  getById: (id: number) => api.get<CategoryDto>(`/api/categories/${id}`),
};

export const productsApi = {
  list: (params?: { page?: number; size?: number; categoryId?: number; search?: string; onSale?: boolean; bestseller?: boolean; isNew?: boolean }) =>
    api.get<Page<ProductDto>>('/api/products', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 12,
        ...(params?.categoryId != null && { categoryId: params.categoryId }),
        ...(params?.search != null && params.search !== '' && { search: params.search }),
        ...(params?.onSale === true && { onSale: true }),
        ...(params?.bestseller === true && { bestseller: true }),
        ...(params?.isNew === true && { isNew: true }),
      },
    }),
  featured: () => api.get<ProductDto[]>('/api/products/featured'),
  bestseller: () => api.get<ProductDto[]>('/api/products/bestseller'),
  getById: (id: number) => api.get<ProductDto>(`/api/products/${id}`),
  getBySlug: (slug: string) => api.get<ProductDto>(`/api/products/slug/${slug}`),
};

export const reviewsApi = {
  getByProduct: (productId: number, params?: { page?: number; size?: number }) =>
    api.get<ReviewDto[]>(`/api/reviews/product/${productId}`, {
      params: { page: params?.page ?? 0, size: params?.size ?? 10 },
    }),
  create: (productId: number, data: { rating: number; comment: string }) =>
    api.post<ReviewDto>(`/api/reviews/product/${productId}`, data),
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
  checkout: (paymentMethod: string, items: { productId: number; quantity: number }[]) =>
    api.post<OrderDto>('/api/orders/checkout', { paymentMethod, items }),
};
