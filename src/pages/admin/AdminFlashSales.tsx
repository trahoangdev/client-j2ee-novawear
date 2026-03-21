import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Switch, Space, Tag, Popconfirm, Select, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { adminFlashSalesApi } from '@/lib/adminApi';
import { productsApi } from '@/lib/adminApi';
import type { FlashSaleDto, ProductDto } from '@/types/api';
import dayjs from 'dayjs';

export function AdminFlashSales() {
  const [sales, setSales] = useState<FlashSaleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FlashSaleDto | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<FlashSaleDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productQty, setProductQty] = useState(50);
  const [form] = Form.useForm();

  const fetchSales = () => {
    setLoading(true);
    adminFlashSalesApi.list({ page, size: 10 })
      .then(({ data }) => { setSales(data.content); setTotal(data.totalElements); })
      .catch(() => message.error('Lỗi tải flash sale'))
      .finally(() => setLoading(false));
  };

  const loadProductsIfEmpty = () => {
    if (products.length === 0) {
      productsApi.list({ page: 0, size: 200 })
        .then(({ data }) => setProducts(data.content))
        .catch(() => message.error('Lỗi tải sản phẩm'));
    }
  };

  useEffect(() => { fetchSales(); }, [page]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        startTime: values.timeRange[0].toISOString(),
        endTime: values.timeRange[1].toISOString(),
        discountPercent: values.discountPercent,
        active: values.active ?? true,
      };
      if (editing) {
        await adminFlashSalesApi.update(editing.id, payload);
        message.success('Cập nhật thành công');
      } else {
        const { data: newSale } = await adminFlashSalesApi.create(payload);
        if (values.productIds && values.productIds.length > 0) {
          for (const pId of values.productIds) {
            await adminFlashSalesApi.addProduct(newSale.id, pId, 50); // Mặc định SL 50
          }
        }
        message.success('Tạo thành công');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      fetchSales();
    } catch (e: any) {
      if (e.response?.data?.message) {
        message.error(e.response.data.message);
      } else if (e.name !== 'ValidationError') {
        message.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminFlashSalesApi.delete(id);
      message.success('Đã xóa');
      fetchSales();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Không thể xóa');
    }
  };

  const openAddProduct = (sale: FlashSaleDto) => {
    setSelectedSale(sale);
    setProductModalOpen(true);
    productsApi.list({ size: 200 }).then(({ data }) => setProducts(data.content));
  };

  const handleAddProduct = async () => {
    if (!selectedSale || !selectedProductId) return;
    try {
      await adminFlashSalesApi.addProduct(selectedSale.id, selectedProductId, productQty);
      message.success('Đã thêm sản phẩm');
      setProductModalOpen(false);
      setSelectedProductId(null);
      setProductQty(50);
      fetchSales();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Lỗi thêm sản phẩm');
    }
  };

  const handleRemoveProduct = async (saleId: number, itemId: number) => {
    try {
      await adminFlashSalesApi.removeProduct(saleId, itemId);
      message.success('Đã xóa sản phẩm');
      fetchSales();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    {
      title: 'Giảm giá',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      render: (v: number) => <Tag color="red">{v}%</Tag>,
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: unknown, r: FlashSaleDto) => (
        <span className="text-xs">
          {dayjs(r.startTime).format('DD/MM/YY HH:mm')} — {dayjs(r.endTime).format('DD/MM/YY HH:mm')}
        </span>
      ),
    },
    {
      title: 'SP',
      key: 'products',
      render: (_: unknown, r: FlashSaleDto) => r.products?.length ?? 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (v: boolean) => v ? <Tag color="green">Hoạt động</Tag> : <Tag>Tắt</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, r: FlashSaleDto) => (
        <Space>
          <Button size="small" icon={<ShoppingOutlined />} onClick={() => openAddProduct(r)}>
            Thêm SP
          </Button>
          <Button size="small" onClick={() => { setEditing(r); form.setFieldsValue({ name: r.name, discountPercent: r.discountPercent, active: r.active, timeRange: [dayjs(r.startTime), dayjs(r.endTime)] }); setModalOpen(true); }}>
            Sửa
          </Button>
          <Popconfirm title="Xóa flash sale này?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Flash Sale</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); loadProductsIfEmpty(); setModalOpen(true); }}>
          Tạo Flash Sale
        </Button>
      </div>

      <Table
        dataSource={sales}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '8px 0' }}>
              {record.products?.length === 0 ? (
                <span style={{ color: '#999' }}>Chưa có sản phẩm</span>
              ) : (
                <Table
                  dataSource={record.products}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
                    { title: 'Giá gốc', dataIndex: 'originalPrice', key: 'originalPrice', render: (v: number) => v?.toLocaleString('vi-VN') + 'đ' },
                    { title: 'Giá sale', dataIndex: 'salePrice', key: 'salePrice', render: (v: number) => <span style={{ color: 'red', fontWeight: 600 }}>{v?.toLocaleString('vi-VN')}đ</span> },
                    { title: 'SL', dataIndex: 'quantity', key: 'quantity' },
                    { title: 'Đã bán', dataIndex: 'soldCount', key: 'soldCount' },
                    {
                      title: '', key: 'del',
                      render: (_: unknown, item: { id: number }) => (
                        <Popconfirm title="Xóa SP này khỏi flash sale?" onConfirm={() => handleRemoveProduct(record.id, item.id)}>
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          ),
        }}
      />

      <Modal
        title={editing ? 'Sửa Flash Sale' : 'Tạo Flash Sale'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="discountPercent" label="Phần trăm giảm" rules={[{ required: true }]}>
            <InputNumber min={1} max={90} addonAfter="%" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <DatePicker.RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          {!editing && (
            <Form.Item name="productIds" label="Chọn sản phẩm (Tuỳ chọn)">
              <Select
                mode="multiple"
                showSearch
                placeholder="Tìm và đưa SP vào đợt Sale (SL: 50 mặc định)"
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                options={products.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
          )}
          <Form.Item name="active" label="Hoạt động" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm sản phẩm vào Flash Sale"
        open={productModalOpen}
        onOk={handleAddProduct}
        onCancel={() => setProductModalOpen(false)}
        okText="Thêm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Select
            showSearch
            placeholder="Chọn sản phẩm"
            optionFilterProp="label"
            value={selectedProductId}
            onChange={(v) => setSelectedProductId(v)}
            options={products.map((p) => ({ value: p.id, label: `${p.name} — ${p.price?.toLocaleString('vi-VN')}đ` }))}
            style={{ width: '100%' }}
          />
          <InputNumber
            min={1}
            value={productQty}
            onChange={(v) => setProductQty(v ?? 50)}
            addonBefore="Số lượng"
            style={{ width: '100%' }}
          />
        </div>
      </Modal>
    </div>
  );
}
