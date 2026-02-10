import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Input, InputNumber, Switch, message, Spin, Image, Upload, Dropdown, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, MoreOutlined } from '@ant-design/icons';
import { adminBannersApi, adminUploadApi } from '@/lib/adminApi';
import type { BannerDto } from '@/types/api';

const IMAGE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40' viewBox='0 0 64 40'%3E%3Crect fill='%23e2e8f0' width='64' height='40'/%3E%3Ctext fill='%2394a3b8' x='32' y='22' text-anchor='middle' font-size='10'%3E?%3C/text%3E%3C/svg%3E";

export function AdminBanners() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BannerDto | null>(null);
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<BannerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await adminBannersApi.list();
      setDataSource(data);
    } catch {
      messageApi.error('Không tải được danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.setFieldsValue({
          title: editing.title ?? '',
          subtitle: editing.subtitle ?? '',
          imageUrl: editing.imageUrl ?? '',
          linkUrl: editing.linkUrl ?? '',
          ctaText: editing.ctaText ?? '',
          description: editing.description ?? '',
          ctaText2: editing.ctaText2 ?? '',
          linkUrl2: editing.linkUrl2 ?? '',
          badgeText: editing.badgeText ?? '',
          bannerType: editing.bannerType ?? 'CAROUSEL',
          sortOrder: editing.sortOrder ?? 0,
          active: editing.active !== false,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ sortOrder: dataSource.length, active: true, bannerType: 'CAROUSEL' });
      }
    }
  }, [modalOpen, editing, form, dataSource.length]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title?.trim() || undefined,
        subtitle: values.subtitle?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || '',
        linkUrl: values.linkUrl?.trim() || undefined,
        ctaText: values.ctaText?.trim() || undefined,
        description: values.description?.trim() || undefined,
        ctaText2: values.ctaText2?.trim() || undefined,
        linkUrl2: values.linkUrl2?.trim() || undefined,
        badgeText: values.badgeText?.trim() || undefined,
        bannerType: values.bannerType || 'CAROUSEL',
        sortOrder: values.sortOrder ?? 0,
        active: values.active !== false,
      };
      if (editing) {
        await adminBannersApi.update(editing.id, payload);
        messageApi.success('Đã cập nhật banner');
      } else {
        await adminBannersApi.create(payload);
        messageApi.success('Đã thêm banner');
      }
      setModalOpen(false);
      setEditing(null);
      fetchBanners();
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      messageApi.error(editing ? 'Cập nhật thất bại' : 'Thêm banner thất bại');
    }
  };

  const handleDelete = (record: BannerDto) => {
    Modal.confirm({
      title: 'Xóa banner?',
      content: `Banner "${record.title || 'ID ' + record.id}" sẽ bị xóa.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminBannersApi.delete(record.id);
          messageApi.success('Đã xóa banner');
          fetchBanners();
        } catch {
          messageApi.error('Xóa thất bại');
        }
      },
    });
  };

  const columns: ColumnsType<BannerDto> = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 100,
      align: 'center',
      render: (url: string) => (
        <Image
          src={url}
          alt=""
          width={64}
          height={40}
          style={{ objectFit: 'cover', borderRadius: 6 }}
          fallback={IMAGE_FALLBACK}
        />
      ),
    },
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, render: (t) => <Typography.Text code>{t}</Typography.Text> },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', width: 160, ellipsis: true, render: (t) => t?.replace(/\n/g, ' ') ?? '—' },
    { title: 'Phụ đề', dataIndex: 'subtitle', key: 'subtitle', ellipsis: true, render: (t) => t ?? '—' },
    { title: 'Link', dataIndex: 'linkUrl', key: 'linkUrl', width: 120, ellipsis: true, render: (t) => t ?? '—' },
    { 
      title: 'Loại', 
      dataIndex: 'bannerType', 
      key: 'bannerType', 
      width: 120, 
      render: (t) => {
        if (!t || t === 'CAROUSEL') return <Typography.Text>Carousel</Typography.Text>;
        if (t === 'PROMO') return <Typography.Text type="warning">Promo</Typography.Text>;
        return <Typography.Text>{t}</Typography.Text>;
      }
    },
    { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder', width: 80, align: 'center' },
    {
      title: 'Hiển thị',
      dataIndex: 'active',
      key: 'active',
      width: 90,
      align: 'center',
      render: (v) => (v ? <Typography.Text type="success">Bật</Typography.Text> : <Typography.Text type="secondary">Tắt</Typography.Text>),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Sửa',
                icon: <EditOutlined />,
                onClick: () => {
                  setEditing(record);
                  setModalOpen(true);
                },
              },
              {
                key: 'delete',
                label: 'Xóa',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
          Quản lý Banner
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Thêm banner
        </Button>
      </div>
      <Card>
        <Spin spinning={loading}>
          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} banner` }}
            size="middle"
            scroll={{ x: 900 }}
          />
        </Spin>
      </Card>
      <Modal
        title={editing ? 'Sửa banner' : 'Thêm banner'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        okText="Lưu"
        cancelText="Hủy"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề" extra="Có thể xuống dòng (\\n) cho carousel.">
            <Input.TextArea placeholder="VD: Bộ Sưu Tập\nXuân Hè 2024" rows={2} maxLength={201} showCount />
          </Form.Item>
          <Form.Item name="subtitle" label="Phụ đề">
            <Input placeholder="Mô tả ngắn dưới tiêu đề" maxLength={301} showCount />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết">
            <Input.TextArea 
              placeholder="Mô tả dài cho banner (VD: Đăng ký thành viên ngay hôm nay để nhận mã giảm giá...)" 
              rows={3} 
              maxLength={1001} 
              showCount 
            />
          </Form.Item>
          <Form.Item name="badgeText" label="Badge text (hiển thị trên ảnh)">
            <Input placeholder="VD: 50% OFF" maxLength={51} showCount />
          </Form.Item>
          <Form.Item name="bannerType" label="Loại banner" rules={[{ required: true, message: 'Chọn loại banner' }]}>
            <Select
              placeholder="Chọn loại banner"
              options={[
                { value: 'CAROUSEL', label: 'Carousel (Banner đầu trang)' },
                { value: 'PROMO', label: 'Promo (Banner giữa trang)' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="URL ảnh (Upload hoặc dán link)"
            extra="Khuyến nghị: 1920x600px"
          >
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="imageUrl"
                noStyle
                rules={[{ required: true, message: 'Nhập URL ảnh' }]}
              >
                <Input placeholder="https://..." maxLength={501} />
              </Form.Item>
              <Upload
                showUploadList={false}
                accept="image/*"
                customRequest={async ({ file, onSuccess, onError }) => {
                  try {
                    const hide = messageApi.loading('Đang upload...', 0);
                    const { data } = await adminUploadApi.upload(file as File);
                    hide();
                    form.setFieldValue('imageUrl', data.url);
                    messageApi.success('Upload thành công');
                    onSuccess?.(data);
                  } catch (err) {
                    messageApi.error('Upload thất bại');
                    onError?.(err as Error);
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Space.Compact>
          </Form.Item>

          <Form.Item name="linkUrl" label="Link button 1 (CTA chính)">
            <Input placeholder="/shop hoặc /shop?sale=true" maxLength={501} />
          </Form.Item>
          <Form.Item name="ctaText" label="Chữ button 1">
            <Input placeholder="VD: Mua Ngay" maxLength={51} />
          </Form.Item>
          <Form.Item name="linkUrl2" label="Link button 2 (CTA phụ)">
            <Input placeholder="/register hoặc /about" maxLength={501} />
          </Form.Item>
          <Form.Item name="ctaText2" label="Chữ button 2">
            <Input placeholder="VD: Tìm Hiểu Thêm" maxLength={51} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Thứ tự hiển thị" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="active" label="Hiển thị trên trang chủ" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

