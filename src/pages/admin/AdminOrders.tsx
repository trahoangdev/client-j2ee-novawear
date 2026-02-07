import { useState, useEffect } from 'react';
import { Card, Table, Select, Button, Typography, Modal, Descriptions, message, Spin, Tag, Dropdown, Space, Input, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, EditOutlined, SearchOutlined, PrinterOutlined, MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { adminOrdersApi } from '@/lib/adminApi';
import type { OrderDto } from '@/types/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

const printInvoice = (order: OrderDto) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const date = order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hóa đơn #${order.id}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; mx-auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .store-name { font-size: 24px; font-weight: bold; text-transform: uppercase; }
        .invoice-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
        .info-group { margin-bottom: 20px; display: flex; justify-content: space-between; }
        .customer-info { margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
        .total-section { text-align: right; font-weight: bold; font-size: 16px; }
        .footer { margin-top: 50px; text-align: center; font-style: italic; }
        @media print {
          @page { margin: 2cm; }
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">NOVAWEAR FASHION</div>
        <div>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</div>
        <div>Hotline: 0123.456.789</div>
      </div>
      
      <div style="text-align: center;">
        <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
        <div>Mã đơn: #${order.id}</div>
        <div>Ngày đặt: ${date}</div>
      </div>

      <div class="customer-info">
        <p><strong>Khách hàng:</strong> ${order.recipientName || order.username}</p>
        <p><strong>Số điện thoại:</strong> ${order.phone || '---'}</p>
        <p><strong>Địa chỉ:</strong> ${order.address || '---'}</p>
        <p><strong>Ghi chú:</strong> ${order.note || '---'}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">STT</th>
            <th>Sản phẩm</th>
            <th style="width: 80px; text-align: center;">SL</th>
            <th style="width: 120px; text-align: right;">Đơn giá</th>
            <th style="width: 120px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${order.orderDetails?.map((item, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td>${item.productName}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${formatCurrency(item.price)}</td>
              <td style="text-align: right;">${formatCurrency(item.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <p>Tổng cộng: ${formatCurrency(order.totalAmount)}</p>
      </div>

      <div class="footer">
        <p>Cảm ơn quý khách đã mua sắm tại NOVAWEAR!</p>
        <p>Hẹn gặp lại quý khách.</p>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

const orderStatusOptions = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPED', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

/** Màu Tag theo trạng thái đơn hàng */
const orderStatusColor: Record<string, string> = {
  PENDING: 'orange',      // Chờ xác nhận
  CONFIRMED: 'blue',       // Đã xác nhận
  PROCESSING: 'cyan',      // Đang xử lý
  SHIPPED: 'geekblue',     // Đang giao
  DELIVERED: 'green',      // Đã giao
  CANCELLED: 'red',        // Đã hủy
};

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [detailOrder, setDetailOrder] = useState<OrderDto | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const pageSize = 10;

  const fetchOrders = async (pageNum = 0) => {
    setLoading(true);
    try {
      const { data } = await adminOrdersApi.list({
        page: pageNum,
        size: pageSize,
        status: statusFilter,
        search: searchText,
        fromDate: dateRange?.[0]?.toISOString(),
        toDate: dateRange?.[1]?.toISOString(),
      });
      setOrders(data.content);
      setTotal(data.totalElements);
    } catch {
      message.error('Không tải được đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
    setPage(0);
  }, [statusFilter, searchText, dateRange]);

  useEffect(() => {
    if (page > 0) fetchOrders(page);
  }, [page]);

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await adminOrdersApi.updateStatus(orderId, status);
      message.success('Đã cập nhật trạng thái');
      fetchOrders(page);
      if (detailOrder?.id === orderId) {
        setDetailOrder((prev) => (prev ? { ...prev, status } : null));
      }
    } catch {
      message.error('Cập nhật thất bại');
    }
  };

  const columns: ColumnsType<OrderDto> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (t) => <Typography.Text code>#{t}</Typography.Text>,
    },
    { title: 'Khách hàng', dataIndex: 'username', key: 'username', width: 140, ellipsis: true },
    {
      title: 'SL',
      key: 'itemsCount',
      width: 70,
      align: 'center',
      render: (_, r) => (r.orderDetails?.length ?? 0),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const label = orderStatusOptions.find((o) => o.value === status)?.label ?? status;
        const color = orderStatusColor[status] ?? 'default';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 110,
      render: (t: string) => (t ? new Date(t).toLocaleDateString('vi-VN') : '—'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const statusMenuItems = orderStatusOptions.map((opt) => ({
          key: `status-${opt.value}`,
          label: opt.label,
          onClick: () => handleStatusChange(record.id, opt.value),
        }));
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: 'Chi tiết',
                  icon: <EyeOutlined />,
                  onClick: () => setDetailOrder(record),
                },
                {
                  key: 'print',
                  label: 'In hóa đơn',
                  icon: <PrinterOutlined />,
                  onClick: () => printInvoice(record),
                },
                { type: 'divider' },
                {
                  key: 'status',
                  label: 'Cập nhật trạng thái',
                  icon: <EditOutlined />,
                  children: statusMenuItems,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: '0 0 16px', color: 'var(--admin-text)' }}>
          Quản lý đơn hàng
        </Typography.Title>
        <Space wrap>
          <Input
            placeholder="Tìm theo ID, Tên, SĐT,..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Lọc trạng thái"
            allowClear
            style={{ width: 160 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={orderStatusOptions}
          />
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            value={dateRange}
            onChange={setDateRange}
          />
        </Space>
      </div>
      <Card>
        <Spin spinning={loading}>
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            pagination={{
              current: page + 1,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `Tổng ${t} đơn`,
              onChange: (p) => setPage(p - 1),
            }}
            size="middle"
            scroll={{ x: 760 }}
            tableLayout="fixed"
          />
        </Spin>
      </Card>

      <Modal
        title={`Chi tiết đơn #${detailOrder?.id ?? ''}`}
        open={!!detailOrder}
        onCancel={() => setDetailOrder(null)}
        footer={null}
        width={560}
      >
        {detailOrder && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button icon={<PrinterOutlined />} onClick={() => printInvoice(detailOrder)}>
                In hóa đơn
              </Button>
            </div>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="ID">#{detailOrder.id}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{detailOrder.username}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={orderStatusColor[detailOrder.status] ?? 'default'}>
                  {orderStatusOptions.find((o) => o.value === detailOrder.status)?.label ?? detailOrder.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {detailOrder.orderDate ? new Date(detailOrder.orderDate).toLocaleString('vi-VN') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">{detailOrder.recipientName || '—'}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{detailOrder.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{detailOrder.address || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{detailOrder.note || '—'}</Descriptions.Item>
            </Descriptions>
            <Typography.Text strong style={{ color: 'var(--admin-text)', display: 'block', marginBottom: 8 }}>
              Sản phẩm
            </Typography.Text>
            <Table
              size="small"
              dataSource={detailOrder.orderDetails ?? []}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
                { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' },
                { title: 'Đơn giá', dataIndex: 'price', key: 'price', width: 110, render: (v: number) => formatCurrency(v) },
                { title: 'Thành tiền', dataIndex: 'subtotal', key: 'subtotal', width: 120, render: (v: number) => formatCurrency(v) },
              ]}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Typography.Text strong style={{ color: 'var(--admin-text)', fontSize: 16 }}>
                Tổng: {formatCurrency(detailOrder.totalAmount)}
              </Typography.Text>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
