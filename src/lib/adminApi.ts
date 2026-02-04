import { api } from '@/lib/api';
import type {
  CategoryDto,
  ProductDto,
  OrderDto,
  UserResponse,
  ReviewDto,
  RevenueStatsDto,
  Page,
} from '@/types/api';

/** Auth */
export const authApi = {
  login: (username: string, password: string) =>
    api.post<import('@/types/api').LoginResponse>('/api/auth/login', { username, password }),
  me: () => api.get<UserResponse>('/api/auth/me'),
  register: (data: { username: string; email: string; password: string }) =>
    api.post<UserResponse>('/api/auth/register', data),
};

/** Admin Categories */
export const adminCategoriesApi = {
  list: () => api.get<CategoryDto[]>('/api/admin/categories'),
  getById: (id: number) => api.get<CategoryDto>(`/api/admin/categories/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post<CategoryDto>('/api/admin/categories', data),
  update: (id: number, data: { name: string; description?: string }) =>
    api.put<CategoryDto>(`/api/admin/categories/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/categories/${id}`),
};

/** Admin Products (list from public API; create/update/delete from admin) */
export const productsApi = {
  list: (params?: { page?: number; size?: number; categoryId?: number; search?: string }) =>
    api.get<Page<ProductDto>>('/api/products', { params: { page: params?.page ?? 0, size: params?.size ?? 100 } }),
  getById: (id: number) => api.get<ProductDto>(`/api/products/${id}`),
};
export const adminProductsApi = {
  getById: (id: number) => api.get<ProductDto>(`/api/admin/products/${id}`),
  create: (data: { name: string; price: number; description?: string; imageUrl?: string; categoryId: number; stock: number }) =>
    api.post<ProductDto>('/api/admin/products', data),
  update: (id: number, data: { name: string; price: number; description?: string; imageUrl?: string; categoryId: number; stock: number }) =>
    api.put<ProductDto>(`/api/admin/products/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/products/${id}`),
};

/** Admin Orders */
export const adminOrdersApi = {
  list: (params?: { page?: number; size?: number; status?: string }) =>
    api.get<Page<OrderDto>>('/api/admin/orders', { params: { page: params?.page ?? 0, size: params?.size ?? 10, ...(params?.status && { status: params.status }) } }),
  getById: (id: number) => api.get<OrderDto>(`/api/admin/orders/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch<OrderDto>(`/api/admin/orders/${id}/status`, null, { params: { status } }),
};

/** Admin Users (customers) */
export const adminUsersApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get<Page<UserResponse>>('/api/admin/users', { params: { page: params?.page ?? 0, size: params?.size ?? 10 } }),
  getById: (id: number) => api.get<UserResponse>(`/api/admin/users/${id}`),
  setActive: (id: number, active: boolean) =>
    api.patch<UserResponse>(`/api/admin/users/${id}/active`, null, { params: { active } }),
};

/** Admin Reviews */
export const adminReviewsApi = {
  list: (params?: { page?: number; size?: number; productId?: number }) =>
    api.get<Page<ReviewDto>>('/api/admin/reviews', {
      params: { page: params?.page ?? 0, size: params?.size ?? 10, ...(params?.productId != null && { productId: params.productId }) },
    }),
  approve: (id: number, approved: boolean) =>
    api.patch<ReviewDto>(`/api/admin/reviews/${id}/approve`, null, { params: { approved } }),
  delete: (id: number) => api.delete(`/api/admin/reviews/${id}`),
};

/** Admin Stats */
export const adminStatsApi = {
  revenue: (params?: { from?: string; to?: string }) =>
    api.get<RevenueStatsDto>('/api/admin/stats/revenue', { params }),
};
