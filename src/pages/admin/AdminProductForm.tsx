import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Typography, Space, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { adminProductsApi, adminCategoriesApi } from '@/lib/adminApi';
import type { CategoryDto, ProductDto } from '@/types/api';

export function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [product, setProduct] = useState<ProductDto | null | 'loading'>('loading');

  const isNew = id === undefined || id === 'new';

  useEffect(() => {
    adminCategoriesApi.list().then(({ data }) => setCategories(data)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (isNew) {
      setProduct(null);
      form.resetFields();
      return;
    }
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      setProduct(null);
      return;
    }
    setProduct('loading');
    adminProductsApi
      .getById(numId)
      .then(({ data }) => {
        setProduct(data);
        form.setFieldsValue({
          name: data.name,
          price: data.price,
          description: data.description,
          imageUrl: data.imageUrl,
          categoryId: data.categoryId,
          stock: data.stock,
        });
      })
      .catch(() => {
        setProduct(null);
      });
  }, [id, isNew, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const body = {
        name: values.name,
        price: Number(values.price),
        description: values.description,
        imageUrl: values.imageUrl,
        categoryId: values.categoryId,
        stock: Number(values.stock),
      };

      if (isNew) {
        await adminProductsApi.create(body);
        message.success('Đã thêm sản phẩm');
      } else if (product && product !== 'loading') {
        await adminProductsApi.update(product.id, body);
        message.success('Đã cập nhật sản phẩm');
      }
      navigate('/admin/products');
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error(isNew ? 'Thêm sản phẩm thất bại' : 'Cập nhật thất bại');
    }
  };

  if (product === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isNew && !product) {
    return (
      <div>
        <Typography.Text style={{ color: 'var(--admin-text-secondary)' }}>Không tìm thấy sản phẩm.</Typography.Text>
        <Button type="link" onClick={() => navigate('/admin/products')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/products')}
          style={{ color: 'var(--admin-text-secondary)', marginBottom: 8, padding: 0 }}
        >
          Quay lại danh sách
        </Button>
        <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
          {isNew ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}
        </Typography.Title>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
            <Input placeholder="Ví dụ: Áo Blazer Premium" />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
            <Select
              placeholder="Chọn danh mục"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
          </Form.Item>
          <Form.Item name="price" label="Giá (₫)" rules={[{ required: true, message: 'Nhập giá' }]}>
            <InputNumber min={0} style={{ width: 180 }} addonAfter="₫" />
          </Form.Item>
          <Form.Item name="stock" label="Tồn kho" rules={[{ required: true, message: 'Nhập số lượng' }]}>
            <InputNumber min={0} style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                {isNew ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
              </Button>
              <Button onClick={() => navigate('/admin/products')}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
