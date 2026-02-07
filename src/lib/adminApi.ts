import { api } from '@/lib/api';
import type {
  CategoryDto,
  ProductDto,
  OrderDto,
  UserResponse,
  ReviewDto,
  RevenueStatsDto,
  BannerDto,
  Page,
  TopProductDto,
} from '@/types/api';

/** Auth */
export const authApi = {
  login: (username: string, password: string) =>
    api.post<import('@/types/api').LoginResponse>('/api/auth/login', { username, password }),
  me: () => api.get<UserResponse>('/api/auth/me'),
  register: (data: { username: string; email: string; password: string }) =>
    api.post<UserResponse>('/api/auth/register', data),
};

/** Admin Upload */
export const adminUploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/api/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/** Admin Categories */
export const adminCategoriesApi = {
  list: () => api.get<CategoryDto[]>('/api/admin/categories'),
  getById: (id: number) => api.get<CategoryDto>(`/api/admin/categories/${id}`),
  create: (data: { name: string; description?: string; imageUrl?: string }) =>
    api.post<CategoryDto>('/api/admin/categories', data),
  update: (id: number, data: { name: string; description?: string; imageUrl?: string }) =>
    api.put<CategoryDto>(`/api/admin/categories/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/categories/${id}`),
};

/** Admin Products (list from public API; create/update/delete from admin) */
export const productsApi = {
  list: (params?: { page?: number; size?: number; categoryId?: number; search?: string; lowStock?: boolean }) =>
    api.get<Page<ProductDto>>('/api/products', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 100,
        ...(params?.categoryId != null && { categoryId: params.categoryId }),
        ...(params?.search != null && params.search.trim() !== '' && { search: params.search.trim() }),
        ...(params?.lowStock != null && { lowStock: params.lowStock }),
      },
    }),
  getById: (id: number) => api.get<ProductDto>(`/api/products/${id}`),
};
export const adminProductsApi = {
  getById: (id: number) => api.get<ProductDto>(`/api/admin/products/${id}`),
  create: (data: { name: string; price: number; description?: string; imageUrl?: string; categoryId: number; stock: number; salePrice?: number | null; featured?: boolean; bestseller?: boolean; isNew?: boolean; sizes?: string[]; colors?: import('@/types/api').ProductColorDto[] }) =>
    api.post<ProductDto>('/api/admin/products', data),
  update: (id: number, data: { name: string; price: number; description?: string; imageUrl?: string; categoryId: number; stock: number; salePrice?: number | null; featured?: boolean; bestseller?: boolean; isNew?: boolean; sizes?: string[]; colors?: import('@/types/api').ProductColorDto[] }) =>
    api.put<ProductDto>(`/api/admin/products/${id}`, data),
  updateFlags: (id: number, data: { featured?: boolean; bestseller?: boolean }) =>
    api.patch<ProductDto>(`/api/admin/products/${id}/flags`, data),
  delete: (id: number) => api.delete(`/api/admin/products/${id}`),
};

/** Admin Orders */
export const adminOrdersApi = {
  list: (params?: { page?: number; size?: number; status?: string; search?: string; fromDate?: string; toDate?: string }) =>
    api.get<Page<OrderDto>>('/api/admin/orders', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        ...(params?.status && { status: params.status }),
        ...(params?.search && { search: params.search }),
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
      },
    }),
  getById: (id: number) => api.get<OrderDto>(`/api/admin/orders/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch<OrderDto>(`/api/admin/orders/${id}/status`, null, { params: { status } }),
};

/** Admin Users (customers) */
export const adminUsersApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get<Page<UserResponse>>('/api/admin/users', { params: { page: params?.page ?? 0, size: params?.size ?? 10 } }),
  getById: (id: number) => api.get<UserResponse>(`/api/admin/users/${id}`),
  create: (data: { username: string; email: string; password: string; role?: string }) =>
    api.post<UserResponse>('/api/admin/users', data),
  update: (id: number, data: { username: string; email: string; password?: string; role?: string; active?: boolean }) =>
    api.put<UserResponse>(`/api/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/users/${id}`),
  setActive: (id: number, active: boolean) =>
    api.patch<UserResponse>(`/api/admin/users/${id}/active`, null, { params: { active } }),
};

/** Admin Reviews */
export const adminReviewsApi = {
  list: (params?: { page?: number; size?: number; productId?: number }) =>
    api.get<Page<ReviewDto>>('/api/admin/reviews', {
      params: { page: params?.page ?? 0, size: params?.size ?? 10, ...(params?.productId != null && { productId: params.productId }) },
    }),
  getById: (id: number) => api.get<ReviewDto>(`/api/admin/reviews/${id}`),
  create: (data: { userId: number; productId: number; rating: number; comment?: string; approved?: boolean }) =>
    api.post<ReviewDto>('/api/admin/reviews', data),
  update: (id: number, data: { rating?: number; comment?: string; approved?: boolean }) =>
    api.put<ReviewDto>(`/api/admin/reviews/${id}`, data),
  approve: (id: number, approved: boolean) =>
    api.patch<ReviewDto>(`/api/admin/reviews/${id}/approve`, null, { params: { approved } }),
  delete: (id: number) => api.delete(`/api/admin/reviews/${id}`),
};

/** Admin Stats */
export const adminStatsApi = {
  revenue: (params?: { from?: string; to?: string }) =>
    api.get<RevenueStatsDto>('/api/admin/stats/revenue', { params }),
  topProducts: (params?: { from?: string; to?: string; limit?: number }) =>
    api.get<TopProductDto[]>('/api/admin/stats/top-products', { params }),
};

/** Admin Banners (Public Management) */
export const adminBannersApi = {
  list: () => api.get<BannerDto[]>('/api/admin/banners'),
  getById: (id: number) => api.get<BannerDto>(`/api/admin/banners/${id}`),
  create: (data: { title?: string; subtitle?: string; imageUrl: string; linkUrl?: string; ctaText?: string; sortOrder?: number; active?: boolean }) =>
    api.post<BannerDto>('/api/admin/banners', data),
  update: (id: number, data: { title?: string; subtitle?: string; imageUrl?: string; linkUrl?: string; ctaText?: string; sortOrder?: number; active?: boolean }) =>
    api.put<BannerDto>(`/api/admin/banners/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/banners/${id}`),
};
