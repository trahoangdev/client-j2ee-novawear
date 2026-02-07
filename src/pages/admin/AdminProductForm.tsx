import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Typography,
  Space,
  App,
  Spin,
  Row,
  Col,
  Image,
  Switch,
  Upload,
} from 'antd';
import { ArrowLeftOutlined, PictureOutlined, PlusOutlined, DeleteOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ProductColorDto } from '@/types/api';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { adminProductsApi, adminCategoriesApi, adminUploadApi } from '@/lib/adminApi';
import type { CategoryDto, ProductDto } from '@/types/api';
import type { AxiosError } from 'axios';

const NAME_MAX = 200;
const SLUG_MAX = 255;
const DESC_MAX = 2000;
const IMAGE_URL_MAX = 500;

/** Generate slug from Vietnamese text */
function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[đ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Trình soạn Mô tả hỗ trợ Markdown, tương thích Ant Design Form */
function DescriptionMarkdownEditor({
  value,
  onChange,
  maxLength = DESC_MAX,
}: {
  value?: string;
  onChange?: (v: string) => void;
  maxLength?: number;
}) {
  const text = value ?? '';
  const handleChange = (v: string | undefined) => {
    const next = v ?? '';
    if (next.length <= maxLength) onChange?.(next);
  };
  return (
    <div data-color-mode="light" className="admin-description-editor">
      <MDEditor
        value={text}
        onChange={handleChange}
        height={220}
        preview="live"
        visibleDragbar={false}
        textareaProps={{
          placeholder: 'Mô tả chi tiết sản phẩm, chất liệu, hướng dẫn bảo quản... Dùng Markdown: **in đậm**, *nghiêng*, - list, [link](url)',
          maxLength: maxLength + 1,
        }}
      />
      <span style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>
        {text.length} / {maxLength} ký tự
      </span>
    </div>
  );
}

function getServerErrorMessage(e: unknown): string | null {
  const err = e as AxiosError<{ message?: string; error?: string }>;
  const data = err.response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (err.response?.status === 400) return 'Dữ liệu không hợp lệ';
  return null;
}

export function AdminProductForm() {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [product, setProduct] = useState<ProductDto | null | 'loading'>('loading');
  const [submitting, setSubmitting] = useState(false);

  const isNew = id === undefined || id === 'new';
  const images = Form.useWatch('images', form);

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
        // Use images array if available, otherwise fallback to imageUrl
        const imageList = data.images && data.images.length > 0
          ? data.images.filter((url: string) => url && url.trim() !== '')
          : (data.imageUrl ? [data.imageUrl] : []);
        form.setFieldsValue({
          name: data.name ?? '',
          slug: data.slug ?? '',
          price: data.price ?? 0,
          description: data.description ?? '',
          images: imageList.length > 0 ? imageList : [''],
          categoryId: data.categoryId,
          stock: data.stock ?? 0,
          salePrice: data.salePrice ?? undefined,
          featured: data.featured ?? false,
          bestseller: data.bestseller ?? false,
          isNew: data.isNew ?? false,
          sizes: data.sizes ?? [],
          colors: (data.colors ?? []).length ? data.colors : [{ name: '', hex: '#000000' }],
        });
      })
      .catch(() => {
        setProduct(null);
      });
  }, [id, isNew, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const sizesList = (values.sizes ?? []).filter((s: string) => s != null && String(s).trim() !== '');
      const colorsList: ProductColorDto[] = (values.colors ?? [])
        .filter((c: { name?: string; hex?: string }) => c?.name != null && String(c.name).trim() !== '' && c?.hex != null && String(c.hex).trim() !== '')
        .map((c: { name: string; hex: string }) => ({ name: String(c.name).trim(), hex: String(c.hex).trim() }));
      const imagesList = (values.images ?? [])
        .filter((url: string) => url != null && String(url).trim() !== '')
        .map((url: string) => String(url).trim());
      const slugValue = values.slug?.trim() || generateSlug(values.name || '');
      const body = {
        name: String(values.name ?? '').trim(),
        slug: slugValue || undefined,
        price: Number(values.price),
        description: values.description != null ? String(values.description).trim() : undefined,
        images: imagesList.length > 0 ? imagesList : undefined,
        imageUrl: imagesList.length > 0 ? imagesList[0] : undefined, // Backward compatibility
        categoryId: values.categoryId,
        stock: Math.max(0, Math.floor(Number(values.stock) || 0)),
        salePrice: values.salePrice != null && values.salePrice !== '' ? Number(values.salePrice) : null,
        featured: !!values.featured,
        bestseller: !!values.bestseller,
        isNew: !!values.isNew,
        sizes: sizesList,
        colors: colorsList,
      };

      setSubmitting(true);
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
      const msg = getServerErrorMessage(e);
      message.error(msg || (isNew ? 'Thêm sản phẩm thất bại' : 'Cập nhật thất bại'));
    } finally {
      setSubmitting(false);
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

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          slug: '',
          images: [''],
          sizes: [],
          colors: [{ name: '', hex: '#000000' }],
          featured: false,
          bestseller: false,
          isNew: false,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Card size="small" title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[
                  { required: true, message: 'Nhập tên sản phẩm' },
                  { max: NAME_MAX, message: `Tối đa ${NAME_MAX} ký tự` },
                ]}
                extra={`Tối đa ${NAME_MAX} ký tự`}
              >
                <Input
                  placeholder="Ví dụ: Áo Blazer Premium"
                  maxLength={NAME_MAX + 1}
                  showCount
                  onChange={(e) => {
                    const name = e.target.value;
                    const currentSlug = form.getFieldValue('slug');
                    // Auto-generate slug if slug is empty or matches previous name
                    if (!currentSlug || currentSlug === generateSlug(form.getFieldValue('name') || '')) {
                      form.setFieldsValue({ slug: generateSlug(name) });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name="slug"
                label="Slug (URL-friendly)"
                rules={[
                  { max: SLUG_MAX, message: `Tối đa ${SLUG_MAX} ký tự` },
                  { pattern: /^[a-z0-9-]+$/, message: 'Chỉ chứa chữ thường, số và dấu gạch ngang' },
                ]}
                extra="Đường dẫn URL thân thiện (tự động tạo từ tên). Ví dụ: ao-blazer-premium"
              >
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="ao-blazer-premium"
                    maxLength={SLUG_MAX + 1}
                  />
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      const name = form.getFieldValue('name') || '';
                      form.setFieldsValue({ slug: generateSlug(name) });
                    }}
                    style={{ padding: '0 8px', height: '100%', borderLeft: '1px solid #d9d9d9' }}
                  >
                    Tạo tự động
                  </Button>
                </Space.Compact>
              </Form.Item>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                <Select
                  placeholder="Chọn danh mục"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ max: DESC_MAX, message: `Mô tả tối đa ${DESC_MAX} ký tự` }]}
                extra={`Hỗ trợ Markdown: **in đậm**, *nghiêng*, list, link, ảnh... Tối đa ${DESC_MAX} ký tự.`}
              >
                <DescriptionMarkdownEditor maxLength={DESC_MAX} />
              </Form.Item>
            </Card>

            <Card size="small" title="Giá & Tồn kho" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="price"
                    label="Giá (VNĐ)"
                    rules={[
                      { required: true, message: 'Nhập giá' },
                      { type: 'number', min: 0, message: 'Giá phải ≥ 0' },
                    ]}
                  >
                    <Space.Compact style={{ width: '100%' }}>
                      <InputNumber<number>
                        min={0}
                        step={1000}
                        style={{ width: '100%' }}
                        formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '')}
                        parser={(v) => (v ? Number(v.replace(/\./g, '')) : 0)}
                      />
                      <Button disabled style={{ cursor: 'default', backgroundColor: '#fafafa', color: 'rgba(0, 0, 0, 0.45)', width: 40, padding: 0 }}>₫</Button>
                    </Space.Compact>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="stock"
                    label="Số lượng tồn kho"
                    rules={[
                      { required: true, message: 'Nhập số lượng tồn kho' },
                      { type: 'integer', min: 0, message: 'Số lượng phải là số nguyên ≥ 0' },
                    ]}
                  >
                    <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="Nhãn & Khuyến mãi (Sale, Nổi bật, Bán chạy, Mới)" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="salePrice"
                    label="Sale – Giá khuyến mãi (VNĐ)"
                    extra="Để trống = không giảm. Hiển thị nhãn Sale khi giá KM < giá gốc."
                    rules={[{ type: 'number', min: 0, message: 'Giá khuyến mãi ≥ 0' }]}
                  >
                    <InputNumber<number>
                      min={0}
                      step={1000}
                      style={{ width: '100%' }}
                      addonAfter="₫"
                      placeholder="Trống = không sale"
                      formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '')}
                      parser={(v) => (v ? Number(v.replace(/\./g, '')) : undefined) as unknown as number}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    Nhãn hiển thị trên thẻ sản phẩm (trang user):
                  </Typography.Text>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="featured" label="Nổi bật" valuePropName="checked" extra="Block Sản phẩm nổi bật (trang chủ)">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="bestseller" label="Bán chạy" valuePropName="checked" extra="Badge Bán chạy">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="isNew" label="Mới (New)" valuePropName="checked" extra="Badge Hàng mới về">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="Biến thể (Size & Màu)" style={{ marginBottom: 16 }}>
              <Form.Item name="sizes" label="Size" extra="Nhập từng size (vd: S, M, L, XL) rồi Enter.">
                <Select
                  mode="tags"
                  placeholder="Thêm size (S, M, L, XL...)"
                  tokenSeparators={[',']}
                  style={{ width: '100%' }}
                  options={[]}
                />
              </Form.Item>
              <Form.Item label="Màu sắc" extra="Tên màu và mã hex (vd: Đen #2D2D2D). Để trống nếu không dùng.">
                <Form.List name="colors">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...rest }) => (
                        <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                          <Col flex="120px">
                            <Form.Item {...rest} name={[name, 'name']} rules={[]} style={{ marginBottom: 0 }}>
                              <Input placeholder="Tên màu" />
                            </Form.Item>
                          </Col>
                          <Col flex="120px">
                            <Form.Item {...rest} name={[name, 'hex']} style={{ marginBottom: 0 }}>
                              <Input placeholder="#2D2D2D" />
                            </Form.Item>
                          </Col>
                          <Col>
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} aria-label="Xóa màu" />
                          </Col>
                        </Row>
                      ))}
                      <Button type="dashed" onClick={() => add({ name: '', hex: '#000000' })} icon={<PlusOutlined />} style={{ width: '100%' }}>
                        Thêm màu
                      </Button>
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </Card>

            <Card size="small" title="Hình ảnh" style={{ marginBottom: 16 }}>
              <Form.Item
                label="URL hình ảnh"
                extra="Nhập URL hoặc upload ảnh từ máy tính. Hình đầu tiên là hình chính."
              >
                <Form.List name="images">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...rest }) => (
                        <div key={key} style={{ marginBottom: 16 }}>
                          <Space.Compact style={{ width: '100%' }}>
                            <Form.Item
                              {...rest}
                              name={name}
                              rules={[{ max: IMAGE_URL_MAX, message: `URL tối đa ${IMAGE_URL_MAX} ký tự` }]}
                              style={{ marginBottom: 0, width: '100%' }}
                            >
                              <Input
                                placeholder={`Hình ${name + 1}: https://...`}
                                maxLength={IMAGE_URL_MAX + 1}
                              />
                            </Form.Item>
                            <Upload
                              showUploadList={false}
                              accept="image/*"
                              customRequest={async ({ file, onSuccess, onError }) => {
                                try {
                                  const hide = message.loading('Đang upload...', 0);
                                  const { data } = await adminUploadApi.upload(file as File);
                                  hide();

                                  const currentImages = form.getFieldValue('images');
                                  currentImages[name] = data.url;
                                  form.setFieldsValue({ images: [...currentImages] });
                                  message.success('Upload thành công');
                                  onSuccess?.(data);
                                } catch (err) {
                                  message.error('Upload thất bại');
                                  onError?.(err as Error);
                                }
                              }}
                            >
                              <Button icon={<UploadOutlined />}>Up ảnh</Button>
                            </Upload>
                            {fields.length > 1 && (
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                                aria-label="Xóa"
                              />
                            )}
                          </Space.Compact>

                          {/* Preview Image */}
                          <Form.Item
                            shouldUpdate={(prev, curr) => prev.images?.[name] !== curr.images?.[name]}
                            style={{ marginBottom: 0 }}
                          >
                            {({ getFieldValue }) => {
                              const imgUrl = getFieldValue(['images', name]);
                              return imgUrl && imgUrl.trim() ? (
                                <div style={{ marginTop: 8 }}>
                                  <Image
                                    src={imgUrl.trim()}
                                    alt={`Preview ${name + 1}`}
                                    width={120}
                                    height={150}
                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                    fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='150' viewBox='0 0 120 150'%3E%3Crect fill='%23334155' width='120' height='150'/%3E%3Ctext fill='%2394a3b8' x='60' y='78' text-anchor='middle' font-size='12'%3ELỗi%3C/text%3E%3C/svg%3E"
                                  />
                                </div>
                              ) : null;
                            }}
                          </Form.Item>
                        </div>
                      ))}
                      <Button type="dashed" onClick={() => add('')} icon={<PlusOutlined />} style={{ width: '100%' }}>
                        Thêm hình ảnh
                      </Button>
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card size="small" title="Xem trước thẻ sản phẩm" style={{ position: 'sticky', top: 16 }}>
              <ProductPreview form={form} categories={categories} />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 0 }}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isNew ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
              </Button>
              <Button onClick={() => navigate('/admin/products')} disabled={submitting}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
}

function ProductPreview({ form, categories }: { form: ReturnType<typeof Form.useForm>[0]; categories: CategoryDto[] }) {
  const name = Form.useWatch('name', form);
  const price = Form.useWatch('price', form);
  const images = Form.useWatch('images', form);
  const categoryId = Form.useWatch('categoryId', form);
  const categoryName = categories.find((c) => c.id === categoryId)?.name;
  const displayName = name?.trim() || 'Tên sản phẩm';
  const displayPrice = price != null && !Number.isNaN(Number(price)) ? Number(price) : 0;
  const displayImages = (images ?? []).filter((url: string) => url && url.trim() !== '').map((url: string) => url.trim());
  const displayImage = displayImages.length > 0 ? displayImages[0] : '';

  return (
    <div
      className="admin-product-preview-light"
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#ffffff',
        color: '#1e293b',
      }}
    >
      <div style={{ aspectRatio: '3/4', background: '#f1f5f9', position: 'relative' }}>
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {displayImages.length > 1 && (
              <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                {displayImages.map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: idx === 0 ? '#0ea5e9' : '#cbd5e1',
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PictureOutlined style={{ fontSize: 48, color: '#94a3b8' }} />
          </div>
        )}
      </div>
      <div style={{ padding: 12 }}>
        <Typography.Text strong style={{ display: 'block', color: '#1e293b', marginBottom: 4 }} ellipsis>
          {displayName}
        </Typography.Text>
        <Typography.Text style={{ color: '#0ea5e9', fontWeight: 600 }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayPrice)}
        </Typography.Text>
        {categoryName && (
          <Typography.Text style={{ display: 'block', fontSize: 12, marginTop: 4, color: '#64748b' }}>
            {categoryName}
          </Typography.Text>
        )}
      </div>
    </div>
  );
}
