import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Input, InputNumber, Switch, message, Spin, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminBannersApi } from '@/lib/adminApi';
import type { BannerDto } from '@/types/api';

const IMAGE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40' viewBox='0 0 64 40'%3E%3Crect fill='%23e2e8f0' width='64' height='40'/%3E%3Ctext fill='%2394a3b8' x='32' y='22' text-anchor='middle' font-size='10'%3E?%3C/text%3E%3C/svg%3E";

export function AdminBanners() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BannerDto | null>(null);
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<BannerDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await adminBannersApi.list();
      setDataSource(data);
    } catch {
      message.error('Không tải được danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title?.trim() || undefined,
        subtitle: values.subtitle?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || '',
        linkUrl: values.linkUrl?.trim() || undefined,
        ctaText: values.ctaText?.trim() || undefined,
        sortOrder: values.sortOrder ?? 0,
        active: values.active !== false,
      };
      if (editing) {
        await adminBannersApi.update(editing.id, payload);
        message.success('Đã cập nhật banner');
      } else {
        await adminBannersApi.create(payload);
        message.success('Đã thêm banner');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      fetchBanners();
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error(editing ? 'Cập nhật thất bại' : 'Thêm banner thất bại');
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
          message.success('Đã xóa banner');
          fetchBanners();
        } catch {
          message.error('Xóa thất bại');
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
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              form.setFieldsValue({
                title: record.title ?? '',
                subtitle: record.subtitle ?? '',
                imageUrl: record.imageUrl ?? '',
                linkUrl: record.linkUrl ?? '',
                ctaText: record.ctaText ?? '',
                sortOrder: record.sortOrder ?? 0,
                active: record.active !== false,
              });
              setModalOpen(true);
            }}
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
          Quản lý Banner
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            form.setFieldsValue({ sortOrder: dataSource.length, active: true });
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
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề" extra="Có thể xuống dòng (\\n) cho carousel.">
            <Input.TextArea placeholder="VD: Bộ Sưu Tập\nXuân Hè 2024" rows={2} maxLength={201} showCount />
          </Form.Item>
          <Form.Item name="subtitle" label="Phụ đề">
            <Input placeholder="Mô tả ngắn dưới tiêu đề" maxLength={301} showCount />
          </Form.Item>
          <Form.Item name="imageUrl" label="URL ảnh" rules={[{ required: true, message: 'Nhập URL ảnh' }]}>
            <Input placeholder="https://..." maxLength={501} />
          </Form.Item>
          <Form.Item name="linkUrl" label="Link khi bấm (CTA)">
            <Input placeholder="/shop hoặc /shop?sale=true" maxLength={501} />
          </Form.Item>
          <Form.Item name="ctaText" label="Chữ nút bấm">
            <Input placeholder="VD: Khám Phá Ngay" maxLength={51} />
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
