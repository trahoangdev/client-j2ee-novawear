import { useState, useEffect } from 'react';
import { Card, Table, Select, Button, Typography, Modal, Descriptions, message, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';
import { adminOrdersApi } from '@/lib/adminApi';
import type { OrderDto } from '@/types/api';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

const orderStatusOptions = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPED', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [detailOrder, setDetailOrder] = useState<OrderDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const pageSize = 10;

  const fetchOrders = async (pageNum = 0) => {
    setLoading(true);
    try {
      const { data } = await adminOrdersApi.list({
        page: pageNum,
        size: pageSize,
        status: statusFilter,
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
    fetchOrders(page);
  }, [page, statusFilter]);

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
      width: 150,
      render: (status: string, record: OrderDto) => (
        <Select
          value={status}
          size="small"
          style={{ width: '100%', minWidth: 120 }}
          options={orderStatusOptions}
          onChange={(v) => handleStatusChange(record.id, v)}
        />
      ),
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
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetailOrder(record)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
          Quản lý đơn hàng
        </Typography.Title>
        <Select
          placeholder="Lọc trạng thái"
          allowClear
          style={{ width: 160 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={orderStatusOptions}
        />
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
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="ID">#{detailOrder.id}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{detailOrder.username}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {orderStatusOptions.find((o) => o.value === detailOrder.status)?.label ?? detailOrder.status}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {detailOrder.orderDate ? new Date(detailOrder.orderDate).toLocaleString('vi-VN') : '—'}
              </Descriptions.Item>
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
