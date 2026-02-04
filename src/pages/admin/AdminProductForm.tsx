import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Switch, Button, Typography, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { categories } from '@/data/mock-data';
import { useAdminProducts } from '@/context/AdminProductsContext';
import type { Product } from '@/types';

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, setProducts, getProductById } = useAdminProducts();
  const [form] = Form.useForm();
  const nameValue = Form.useWatch('name', form);

  const isNew = id === undefined || id === 'new';
  const product = !isNew && id ? getProductById(id) : null;

  // Tự động cập nhật slug khi tên thay đổi
  useEffect(() => {
    if (nameValue != null && typeof nameValue === 'string' && nameValue.trim() !== '') {
      form.setFieldValue('slug', slugify(nameValue.trim()));
    }
  }, [nameValue, form]);

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        slug: product.slug,
        categoryId: product.category.id,
        price: product.price,
        salePrice: product.salePrice ?? undefined,
        stockCount: product.stockCount,
        description: product.description,
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        image: product.images?.[0],
      });
    } else if (isNew) {
      form.resetFields();
    }
  }, [product, isNew, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const category = categories.find((c) => c.id === values.categoryId) ?? categories[0];
      const slug = values.slug || slugify(values.name);

      if (isNew) {
        const newProduct: Product = {
          id: String(Date.now()),
          name: values.name,
          slug,
          description: values.description ?? '',
          price: values.price,
          salePrice: values.salePrice || undefined,
          images: values.image ? [values.image] : ['https://images.unsplash.com/photo-1558769132-cb1aea913002?w=800&q=80'],
          category,
          sizes: ['S', 'M', 'L'],
          colors: [{ name: 'Đen', hex: '#2D2D2D' }],
          inStock: values.stockCount > 0,
          stockCount: values.stockCount,
          rating: 0,
          reviewCount: 0,
          isFeatured: !!values.isFeatured,
          isNew: !!values.isNew,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setProducts((prev) => [...prev, newProduct]);
        message.success('Đã thêm sản phẩm');
      } else if (product) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  name: values.name,
                  slug,
                  description: values.description ?? p.description,
                  price: values.price,
                  salePrice: values.salePrice || undefined,
                  stockCount: values.stockCount,
                  inStock: values.stockCount > 0,
                  isNew: !!values.isNew,
                  isFeatured: !!values.isFeatured,
                  images: values.image ? [values.image] : p.images,
                }
              : p
          )
        );
        message.success('Đã cập nhật sản phẩm');
      }
      navigate('/admin/products');
    });
  };

  if (!isNew && id && !product) {
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
          <Form.Item name="slug" label="Slug (tùy chọn)">
            <Input placeholder="Tự tạo từ tên nếu để trống" />
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
          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item name="price" label="Giá (₫)" rules={[{ required: true, message: 'Nhập giá' }]}>
              <InputNumber min={0} style={{ width: 180 }} addonAfter="₫" />
            </Form.Item>
            <Form.Item name="salePrice" label="Giá sale (₫)">
              <InputNumber min={0} style={{ width: 180 }} addonAfter="₫" placeholder="Không giảm" />
            </Form.Item>
          </Space>
          <Form.Item name="stockCount" label="Tồn kho" rules={[{ required: true, message: 'Nhập số lượng' }]}>
            <InputNumber min={0} style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="image" label="URL hình ảnh">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="Tùy chọn">
            <Space size="large">
              <Form.Item name="isNew" valuePropName="checked" noStyle>
                <Switch /> <span style={{ color: 'var(--admin-text-secondary)', marginLeft: 4 }}>Mới</span>
              </Form.Item>
              <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                <Switch /> <span style={{ color: 'var(--admin-text-secondary)', marginLeft: 4 }}>Nổi bật</span>
              </Form.Item>
            </Space>
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
