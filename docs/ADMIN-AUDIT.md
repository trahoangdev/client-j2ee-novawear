# Rà soát phía Admin – NovaWear

Tài liệu này liệt kê những gì **đã có**, **còn thiếu** và **cần bổ sung** cho khu vực Admin so với PRD và backend hiện tại.

---

## 1. Bảo mật & phân quyền

| Hạng mục | Hiện trạng | Cần làm |
|----------|------------|---------|
| **Bảo vệ route /admin** | Chưa có. Bất kỳ ai vào `/admin` đều xem được (không kiểm tra đăng nhập hay role). | Trong `AdminLayout` (hoặc wrapper): nếu chưa đăng nhập → redirect về `/` và mở modal đăng nhập; nếu đã đăng nhập nhưng không phải admin → redirect về `/`. |
| **Đăng nhập thật** | Auth đang **mock**: so sánh email/password với `mockUsers`, không gọi API. | Gọi `POST /api/auth/login`, lưu JWT (localStorage/sessionStorage hoặc state), gửi header `Authorization: Bearer <token>` cho mọi request admin. |
| **Đăng xuất** | Chỉ xóa user trong state, không xóa token. | Khi logout: xóa token khỏi storage và clear state. |

---

## 2. Tích hợp Backend API

| Hạng mục | Hiện trạng | Cần làm |
|----------|------------|---------|
| **API client** | Không có. Không có `axios`/`fetch` với baseURL và auth. | Tạo module API (ví dụ `src/lib/api.ts`): baseURL từ env, interceptor gắn JWT vào header, xử lý 401 (redirect login). |
| **Danh mục** | `AdminCategories` dùng `categories` từ `mock-data.ts`. | Gọi `GET /api/admin/categories` khi load; thêm/sửa/xóa gọi `POST/PUT/DELETE /api/admin/categories`. Lưu ý backend dùng `id` number, frontend type hiện tại `id: string` cần map. |
| **Sản phẩm** | `AdminProducts` + `AdminProductForm` dùng `AdminProductsContext` khởi tạo từ `mock-data`. | Lấy danh sách: `GET /api/products` (public, có phân trang). Tạo/sửa/xóa: `POST/PUT/DELETE /api/admin/products`. Form tạo/sửa cần map DTO backend (categoryId, image_url, ...). |
| **Đơn hàng** | `AdminOrders` dùng `mockOrders`. | Gọi `GET /api/admin/orders?page=&size=&status=`, `GET /api/admin/orders/:id`; cập nhật trạng thái: `PATCH /api/admin/orders/:id/status?status=`. |
| **Khách hàng** | `AdminCustomers` dùng `mockUsers`. | Gọi `GET /api/admin/users?page=&size=`; bật/tắt tài khoản: `PATCH /api/admin/users/:id/active?active=`. Backend không có API đổi role. |
| **Đánh giá** | `AdminReviews` dùng `mockReviews`. | Gọi `GET /api/admin/reviews?page=&size=&productId=`; duyệt: `PATCH /api/admin/reviews/:id/approve?approved=`; xóa: `DELETE /api/admin/reviews/:id`. |
| **Thống kê** | `AdminDashboard` và `AdminAnalytics` dùng `dashboardStats`, `salesData` từ mock. | Gọi `GET /api/admin/stats/revenue` (có thể thêm query `from`, `to`). Map `RevenueStatsDto` (totalRevenue, totalOrders, byDay) vào biểu đồ. |

---

## 3. Trang Cài đặt (Admin Settings)

| Hạng mục | Hiện trạng | Cần làm |
|----------|------------|---------|
| **AdminSettings** | Placeholder: chỉ một Card mô tả “sẽ bổ sung khi tích hợp backend”. Đang dùng component shadcn (Card), không đồng bộ theme admin (Ant Design + CSS variables). | (1) Đổi sang Ant Design (Card, Form, …) và dùng biến `var(--admin-*)` cho đồng bộ theme. (2) Bổ sung nội dung hữu ích: ví dụ đổi mật khẩu (nếu backend có API), hiển thị phiên bản app, link tới Swagger/API docs. |

---

## 4. Backend – Thống kê dashboard

| Hạng mục | Hiện trạng | Gợi ý |
|----------|------------|--------|
| **Stats** | `GET /api/admin/stats/revenue` trả về `RevenueStatsDto`: totalRevenue, totalOrders, byDay. | Dashboard cần thêm **totalCustomers**, **totalProducts**. Có thể: thêm endpoint `GET /api/admin/stats/summary` trả về các count đó, hoặc mở rộng DTO revenue (nếu hợp lý). |

---

## 5. Danh sách trang Admin và nguồn dữ liệu hiện tại

| Trang | Route | Nguồn dữ liệu hiện tại |
|-------|--------|-------------------------|
| Tổng quan | `/admin` | `dashboardStats`, `salesData`, `topProducts`, `mockOrders` (mock-data) |
| Danh mục | `/admin/categories` | `categories` (mock-data) |
| Sản phẩm | `/admin/products` | `AdminProductsContext` ← mock `products` |
| Form sản phẩm | `/admin/products/new`, `/admin/products/:id/edit` | `categories` (mock), product từ context |
| Đơn hàng | `/admin/orders` | `mockOrders` |
| Khách hàng | `/admin/customers` | `mockUsers` |
| Đánh giá | `/admin/reviews` | `mockReviews` |
| Thống kê | `/admin/analytics` | `dashboardStats`, `salesData` (mock) |
| Cài đặt | `/admin/settings` | Chỉ placeholder |

---

## 6. Thứ tự ưu tiên gợi ý

1. **Bảo vệ route /admin** + **Đăng nhập thật (JWT)** + **API client có Bearer token** → nền tảng cho toàn bộ admin.
2. **AdminCategories** → CRUD đơn giản, dễ nối API.
3. **AdminOrders** → GET list + PATCH status.
4. **AdminCustomers** → GET list + PATCH active.
5. **AdminReviews** → GET list + approve + delete.
6. **AdminProducts + AdminProductForm** → GET list từ `/api/products`, POST/PUT/DELETE admin.
7. **AdminDashboard + AdminAnalytics** → GET `/api/admin/stats/revenue`, (sau đó) bổ sung summary totalCustomers/totalProducts nếu backend hỗ trợ.
8. **AdminSettings** → Đồng bộ theme + nội dung cơ bản.

---

*Tài liệu tạo sau rà soát ngày 04/02/2025.*
