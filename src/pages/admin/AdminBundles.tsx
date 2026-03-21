import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Tag,
  Popconfirm,
  Select,
  message,
  Image,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { adminBundlesApi, productsApi } from '@/lib/adminApi';
import type { BundleDto, ProductDto } from '@/types/api';

export function AdminBundles() {
  const [bundles, setBundles] = useState<BundleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BundleDto | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<BundleDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [form] = Form.useForm();

  const fetchBundles = () => {
    setLoading(true);
    adminBundlesApi
      .list({ page, size: 10 })
      .then(({ data }) => {
        setBundles(data.content);
        setTotal(data.totalElements);
      })
      .catch(() => message.error('Lỗi tải danh sách combo'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBundles();
  }, [page]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      name: values.name,
      description: values.description,
      imageUrl: values.imageUrl,
      discountPercent: values.discountPercent,
      active: values.active ?? true,
    };
    if (editing) {
      await adminBundlesApi.update(editing.id, payload);
      message.success('Cập nhật thành công');
    } else {
      await adminBundlesApi.create(payload);
      message.success('Tạo thành công');
    }
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    fetchBundles();
  };

  const openAddItem = (bundle: BundleDto) => {
    setSelectedBundle(bundle);
    setSelectedProductId(null);
    setItemQty(1);
    setItemModalOpen(true);
    productsApi
      .list({ page: 0, size: 200 })
      .then(({ data }) => setProducts(data.content))
      .catch(() => message.error('Lỗi tải sản phẩm'));
  };

  const handleAddItem = async () => {
    if (!selectedBundle || !selectedProductId) return;
    await adminBundlesApi.addItem(selectedBundle.id, selectedProductId, itemQty);
    message.success('Đã thêm sản phẩm vào combo');
    setItemModalOpen(false);
    fetchBundles();
  };

  const handleRemoveItem = async (bundleId: number, itemId: number) => {
    await adminBundlesApi.removeItem(bundleId, itemId);
    message.success('Đã xoá sản phẩm khỏi combo');
    fetchBundles();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Tên combo', dataIndex: 'name' },
    {
      title: 'Giảm giá',
      dataIndex: 'discountPercent',
      width: 100,
      render: (v: number) => <Tag color="red">-{v}%</Tag>,
    },
    {
      title: 'Giá gốc',
      dataIndex: 'totalOriginalPrice',
      width: 130,
      render: (v: number) =>
        v ? `${Number(v).toLocaleString('vi-VN')}₫` : '—',
    },
    {
      title: 'Giá combo',
      dataIndex: 'bundlePrice',
      width: 130,
      render: (v: number) =>
        v ? `${Number(v).toLocaleString('vi-VN')}₫` : '—',
    },
    {
      title: 'SP',
      key: 'items',
      width: 60,
      render: (_: unknown, r: BundleDto) => r.items?.length ?? 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      width: 100,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 200,
      render: (_: unknown, r: BundleDto) => (
        <Space>
          <Button
            size="small"
            icon={<ShoppingOutlined />}
            onClick={() => openAddItem(r)}
          >
            Thêm SP
          </Button>
          <Button
            size="small"
            onClick={() => {
              setEditing(r);
              form.setFieldsValue({
                name: r.name,
                description: r.description,
                imageUrl: r.imageUrl,
                discountPercent: r.discountPercent,
                active: r.active,
              });
              setModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xoá combo này?"
            onConfirm={async () => {
              await adminBundlesApi.delete(r.id);
              message.success('Đã xoá');
              fetchBundles();
            }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: BundleDto) => {
    const itemCols = [
      { title: 'Sản phẩm', dataIndex: 'productName' },
      {
        title: 'Ảnh',
        dataIndex: 'productImage',
        width: 80,
        render: (v: string) =>
          v ? <Image src={v} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '—',
      },
      {
        title: 'Giá',
        dataIndex: 'productPrice',
        width: 120,
        render: (v: number) => `${Number(v).toLocaleString('vi-VN')}₫`,
      },
      { title: 'SL', dataIndex: 'quantity', width: 60 },
      {
        title: '',
        key: 'action',
        width: 80,
        render: (_: unknown, item: BundleDto['items'][0]) => (
          <Popconfirm
            title="Xoá sản phẩm khỏi combo?"
            onConfirm={() => handleRemoveItem(record.id, item.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
      },
    ];
    return (
      <Table
        columns={itemCols}
        dataSource={record.items || []}
        rowKey="id"
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Quản lý Combo / Set</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Tạo combo
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={bundles}
        rowKey="id"
        loading={loading}
        expandable={{ expandedRowRender }}
        pagination={{
          current: page + 1,
          pageSize: 10,
          total,
          onChange: (p) => setPage(p - 1),
        }}
      />

      {/* Create / Edit modal */}
      <Modal
        title={editing ? 'Sửa combo' : 'Tạo combo'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên combo" rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="imageUrl" label="Ảnh bìa (URL)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            name="discountPercent"
            label="% Giảm giá"
            rules={[{ required: true, message: 'Nhập %' }]}
          >
            <InputNumber min={1} max={90} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="active" label="Kích hoạt" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add item modal */}
      <Modal
        title="Thêm sản phẩm vào combo"
        open={itemModalOpen}
        onOk={handleAddItem}
        onCancel={() => setItemModalOpen(false)}
        okText="Thêm"
      >
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Sản phẩm</label>
          <Select
            showSearch
            placeholder="Tìm sản phẩm"
            style={{ width: '100%' }}
            value={selectedProductId}
            onChange={setSelectedProductId}
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            options={products.map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Số lượng</label>
          <InputNumber min={1} max={10} value={itemQty} onChange={(v) => setItemQty(v ?? 1)} />
        </div>
      </Modal>
    </div>
  );
}
