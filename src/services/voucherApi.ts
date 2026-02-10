import { api } from '@/lib/api';
import { VoucherDto, VoucherValidateResponse, Page } from '@/types/api';

/** API cho voucher (khách hàng) */
export const voucherApi = {
    /** Lấy danh sách voucher đang khả dụng */
    getAvailable: (orderTotal?: number) =>
        api.get<VoucherDto[]>('/api/vouchers/available', { params: { orderTotal } }),

    /** Kiểm tra mã voucher */
    validate: (code: string, orderTotal: number) =>
        api.post<VoucherValidateResponse>('/api/vouchers/validate', null, {
            params: { code, orderTotal },
        }),
};

/** API cho voucher (admin) */
export const adminVoucherApi = {
    /** Danh sách voucher */
    list: (params: { keyword?: string; active?: boolean; page?: number; size?: number }) =>
        api.get<Page<VoucherDto>>('/api/admin/vouchers', { params }),

    /** Chi tiết voucher */
    getById: (id: number) => api.get<VoucherDto>(`/api/admin/vouchers/${id}`),

    /** Tạo voucher */
    create: (data: Partial<VoucherDto>) => api.post<VoucherDto>('/api/admin/vouchers', data),

    /** Cập nhật voucher */
    update: (id: number, data: Partial<VoucherDto>) =>
        api.put<VoucherDto>(`/api/admin/vouchers/${id}`, data),

    /** Xóa voucher */
    delete: (id: number) => api.delete(`/api/admin/vouchers/${id}`),

    /** Bật/tắt voucher */
    toggle: (id: number) => api.patch<VoucherDto>(`/api/admin/vouchers/${id}/toggle`),
};

export default voucherApi;
