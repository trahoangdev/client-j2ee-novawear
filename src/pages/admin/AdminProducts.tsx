import { useState, useEffect } from 'react';
import { Card, Table, Typography, Image, Button, Space, Modal, message, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productsApi, adminProductsApi } from '@/lib/adminApi';
import type { ProductDto } from '@/types/api';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export function AdminProducts() {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchProducts = async (pageNum = 0) => {
    setLoading(true);
    try {
      const { data } = await productsApi.list({ page: pageNum, size: pageSize });
      setDataSource(data.content);
      setTotal(data.totalElements);
    } catch {
      message.error('Không tải được sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleDelete = (record: ProductDto) => {
    Modal.confirm({
      title: 'Xóa sản phẩm?',
      content: `Bạn có chắc muốn xóa "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminProductsApi.delete(record.id);
          message.success('Đã xóa sản phẩm');
          fetchProducts(page);
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  const columns: ColumnsType<ProductDto> = [
    {
      title: 'Hình',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 70,
      align: 'center',
      render: (url: string) => (
        <Image
          src={url}
          alt=""
          width={48}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='60' viewBox='0 0 48 60'%3E%3Crect fill='%23334155' width='48' height='60'/%3E%3Ctext fill='%2394a3b8' x='24' y='32' text-anchor='middle' font-size='10'%3E?%3C/text%3E%3C/svg%3E"
        />
      ),
    },
    { title: 'Tên', dataIndex: 'name', key: 'name', width: 200, ellipsis: true },
    { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName', width: 110, align: 'center' },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      align: 'center',
      render: (val: number) => formatCurrency(val),
    },
    { title: 'Tồn', dataIndex: 'stock', key: 'stock', width: 70, align: 'center' },
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
        <Spin spinning={loading}>
          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey="id"
            pagination={{
              current: page + 1,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `Tổng ${t} sản phẩm`,
              onChange: (p) => setPage(p - 1),
            }}
            size="middle"
            scroll={{ x: 720 }}
            tableLayout="fixed"
          />
        </Spin>
      </Card>
    </div>
  );
}
