import { useState } from 'react';
import { Card, Table, Select, Button, Typography, Modal, Descriptions, Form, Input, InputNumber, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { mockOrders, formatCurrency, products, mockUsers } from '@/data/mock-data';
import type { Order, OrderStatus, OrderItem, Address, PaymentMethod } from '@/types';

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const paymentLabels: Record<PaymentMethod, string> = {
  cod: 'COD',
  momo: 'MOMO',
  paypal: 'PayPal',
};

const SHIPPING_FEE = 30000;

function generateOrderNumber(orders: Order[]) {
  const max = orders.reduce((acc, o) => {
    const num = parseInt(o.orderNumber.split('-').pop() ?? '0', 10);
    return Math.max(acc, num);
  }, 0);
  return `NW-2024-${String(max + 1).padStart(4, '0')}`;
}

export function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );
  };

  const handleDelete = (record: Order) => {
    Modal.confirm({
      title: 'Xóa đơn hàng?',
      content: `Bạn có chắc muốn xóa đơn ${record.orderNumber}? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        setOrders((prev) => prev.filter((o) => o.id !== record.id));
        message.success('Đã xóa đơn hàng');
      },
    });
  };

  const handleCreateOrder = () => {
    form.validateFields().then((values) => {
      const user = mockUsers.find((u) => u.id === values.userId);
      if (!user) {
        message.error('Chọn khách hàng');
        return;
      }
      const address: Address = {
        fullName: values.fullName,
        phone: values.phone,
        street: values.street,
        city: values.city,
        district: values.district,
        ward: values.ward,
        country: values.country || 'Việt Nam',
      };
      const orderItems: OrderItem[] = values.items.map((item: { productId: string; size: string; quantity: number }, index: number) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error('Sản phẩm không tồn tại');
        const price = product.salePrice ?? product.price;
        return {
          id: String(Date.now() + index),
          product,
          quantity: item.quantity,
          size: item.size,
          color: product.colors[0],
          price,
        };
      });
      const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const shipping = values.shipping ?? SHIPPING_FEE;
      const total = subtotal + shipping;
      const now = new Date().toISOString();
      const newOrder: Order = {
        id: String(Date.now()),
        orderNumber: generateOrderNumber(orders),
        user,
        items: orderItems,
        status: 'pending',
        shippingAddress: address,
        paymentMethod: values.paymentMethod,
        subtotal,
        shipping,
        total,
        createdAt: now,
        updatedAt: now,
      };
      setOrders((prev) => [newOrder, ...prev]);
      message.success('Đã tạo đơn hàng');
      setCreateModalOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 130,
      render: (t: string) => <Typography.Text code>{t}</Typography.Text>,
    },
    {
      title: 'Khách hàng',
      key: 'user',
      width: 140,
      ellipsis: true,
      render: (_, r) => r.user.name,
    },
    {
      title: 'SL',
      key: 'itemsCount',
      width: 70,
      align: 'center',
      render: (_, r) => r.items.length,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (v: string) => (v === 'cod' ? 'COD' : v.toUpperCase()),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: OrderStatus, record: Order) => (
        <Select
          value={status}
          size="small"
          style={{ width: '100%', minWidth: 120 }}
          options={Object.entries(orderStatusLabels).map(([value, label]) => ({ value: value as OrderStatus, label }))}
          onChange={(v) => handleStatusChange(record.id, v)}
        />
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (t: string) => new Date(t).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetailOrder(record)}>
            Chi tiết
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
          Quản lý đơn hàng
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          Thêm đơn hàng
        </Button>
      </div>
      <Card>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} đơn` }}
          size="middle"
          scroll={{ x: 960 }}
          tableLayout="fixed"
        />
      </Card>

      {/* Modal Chi tiết */}
      <Modal
        title={`Chi tiết đơn ${detailOrder?.orderNumber ?? ''}`}
        open={!!detailOrder}
        onCancel={() => setDetailOrder(null)}
        footer={null}
        width={640}
      >
        {detailOrder && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã đơn">{detailOrder.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {detailOrder.user.name} ({detailOrder.user.email})
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {detailOrder.paymentMethod === 'cod' ? 'COD' : detailOrder.paymentMethod.toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{orderStatusLabels[detailOrder.status]}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                {detailOrder.shippingAddress.fullName}, {detailOrder.shippingAddress.phone}
                <br />
                {detailOrder.shippingAddress.street}, {detailOrder.shippingAddress.ward},{' '}
                {detailOrder.shippingAddress.district}, {detailOrder.shippingAddress.city},{' '}
                {detailOrder.shippingAddress.country}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {new Date(detailOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật">
                {new Date(detailOrder.updatedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
            <Typography.Text strong style={{ color: 'var(--admin-text)', display: 'block', marginBottom: 8 }}>
              Sản phẩm
            </Typography.Text>
            <Table
              size="small"
              dataSource={detailOrder.items}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Sản phẩm', key: 'product', render: (_, item) => item.product.name },
                { title: 'Size', dataIndex: 'size', key: 'size', width: 80 },
                { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' as const },
                { title: 'Đơn giá', key: 'price', width: 110, render: (_, item) => formatCurrency(item.price) },
                { title: 'Thành tiền', key: 'total', width: 120, render: (_, item) => formatCurrency(item.price * item.quantity) },
              ]}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Typography.Text style={{ color: 'var(--admin-text-secondary)' }}>
                Phụ phí: {formatCurrency(detailOrder.shipping)}
              </Typography.Text>
              <br />
              <Typography.Text strong style={{ color: 'var(--admin-text)', fontSize: 16 }}>
                Tổng: {formatCurrency(detailOrder.total)}
              </Typography.Text>
            </div>
          </>
        )}
      </Modal>

      {/* Modal Thêm đơn hàng */}
      <Modal
        title="Thêm đơn hàng"
        open={createModalOpen}
        onOk={handleCreateOrder}
        onCancel={() => { setCreateModalOpen(false); form.resetFields(); }}
        okText="Tạo đơn"
        cancelText="Hủy"
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} initialValues={{ shipping: SHIPPING_FEE }}>
          <Form.Item name="userId" label="Khách hàng" rules={[{ required: true, message: 'Chọn khách hàng' }]}>
            <Select
              placeholder="Chọn khách hàng"
              options={mockUsers.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))}
            />
          </Form.Item>
          <Typography.Text strong style={{ marginBottom: 8, display: 'block' }}>Địa chỉ giao hàng</Typography.Text>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
              <Input placeholder="0901234567" />
            </Form.Item>
            <Form.Item name="street" label="Đường / Số nhà" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
              <Input placeholder="123 Nguyễn Huệ" />
            </Form.Item>
            <Space style={{ width: '100%' }} wrap>
              <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
                <Input placeholder="Phường Bến Nghé" style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
                <Input placeholder="Quận 1" style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="city" label="Thành phố" rules={[{ required: true }]}>
                <Input placeholder="Hồ Chí Minh" style={{ width: 160 }} />
              </Form.Item>
            </Space>
            <Form.Item name="country" label="Quốc gia">
              <Input placeholder="Việt Nam" />
            </Form.Item>
          </Space>
          <Form.Item name="paymentMethod" label="Thanh toán" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn phương thức"
              options={Object.entries(paymentLabels).map(([value, label]) => ({ value, label }))}
            />
          </Form.Item>
          <Form.Item name="shipping" label="Phí ship (₫)">
            <InputNumber min={0} style={{ width: 140 }} addonAfter="₫" />
          </Form.Item>
          <Typography.Text strong style={{ marginBottom: 8, display: 'block' }}>Sản phẩm</Typography.Text>
          <Form.List name="items" initialValue={[{ productId: undefined, size: 'M', quantity: 1 }]} rules={[{ required: true, message: 'Thêm ít nhất 1 sản phẩm' }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="start" style={{ marginBottom: 8, display: 'flex' }}>
                    <Form.Item {...rest} name={[name, 'productId']} rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 200 }}>
                      <Select
                        placeholder="Chọn sản phẩm"
                        options={products.map((p) => ({ value: p.id, label: p.name }))}
                        showSearch
                        optionFilterProp="label"
                      />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'size']} rules={[{ required: true }]} style={{ marginBottom: 0, width: 90 }}>
                      <Select placeholder="Size" options={['S', 'M', 'L', 'XL', 'One Size'].map((s) => ({ value: s, label: s }))} />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'quantity']} rules={[{ required: true, min: 1 }]} style={{ marginBottom: 0, width: 80 }}>
                      <InputNumber min={1} placeholder="SL" />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)}>
                      Xóa
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm dòng
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
