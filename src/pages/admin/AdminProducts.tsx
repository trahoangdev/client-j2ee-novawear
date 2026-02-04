import { Card, Table, Tag, Typography, Image, Button, Space, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { categories, formatCurrency } from '@/data/mock-data';
import { useAdminProducts } from '@/context/AdminProductsContext';
import type { Product } from '@/types';

export function AdminProducts() {
  const navigate = useNavigate();
  const { products: dataSource, setProducts } = useAdminProducts();

  const handleDelete = (record: Product) => {
    Modal.confirm({
      title: 'Xóa sản phẩm?',
      content: `Bạn có chắc muốn xóa "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        setProducts((prev) => prev.filter((p) => p.id !== record.id));
        message.success('Đã xóa sản phẩm');
      },
    });
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Hình',
      dataIndex: 'images',
      key: 'image',
      width: 70,
      align: 'center',
      render: (imgs: string[]) => (
        <Image
          src={imgs?.[0]}
          alt=""
          width={48}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='60' viewBox='0 0 48 60'%3E%3Crect fill='%23334155' width='48' height='60'/%3E%3Ctext fill='%2394a3b8' x='24' y='32' text-anchor='middle' font-size='10'%3E?%3C/text%3E%3C/svg%3E"
        />
      ),
    },
    { title: 'Tên', dataIndex: 'name', key: 'name', width: 200, ellipsis: true },
    {
      title: 'Danh mục',
      key: 'category',
      width: 110,
      align: 'center',
      render: (_, r) => r.category.name,
    },
    {
      title: 'Giá',
      key: 'price',
      width: 130,
      align: 'center',
      render: (_, r) => (
        <>
          <span style={{ color: r.salePrice ? 'var(--admin-error)' : 'inherit' }}>
            {formatCurrency(r.salePrice ?? r.price)}
          </span>
          {r.salePrice && (
            <Typography.Text type="secondary" delete style={{ marginLeft: 8, fontSize: 12 }}>
              {formatCurrency(r.price)}
            </Typography.Text>
          )}
        </>
      ),
    },
    {
      title: 'Tồn',
      dataIndex: 'stockCount',
      key: 'stockCount',
      width: 70,
      align: 'center',
    },
    {
      title: 'Trạng thái',
      key: 'tags',
      width: 140,
      align: 'center',
      render: (_, r) => (
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {r.isNew && <Tag color="blue">Mới</Tag>}
          {r.isFeatured && <Tag color="green">Nổi bật</Tag>}
          {!r.inStock && <Tag color="red">Hết hàng</Tag>}
        </span>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 95,
      align: 'center',
      render: (_, r) => `${r.rating} (${r.reviewCount})`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/products/${record.id}/edit`)}
          >
            Sửa
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
          Quản lý sản phẩm
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/products/new')}>
          Thêm sản phẩm
        </Button>
      </div>
      <Card>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} sản phẩm` }}
          size="middle"
          scroll={{ x: 920 }}
          tableLayout="fixed"
        />
      </Card>
    </div>
  );
}
