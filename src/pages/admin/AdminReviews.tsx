import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Typography, Rate, Space, Modal, message, Spin, Form, Input, Select, Switch, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { PlusOutlined, MoreOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { adminReviewsApi, adminUsersApi, productsApi } from '@/lib/adminApi';
import type { ReviewDto, UserResponse, ProductDto } from '@/types/api';
import type { AxiosError } from 'axios';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN');
}

function getServerErrorMessage(e: unknown): string | null {
  const err = e as AxiosError<{ message?: string; error?: string }>;
  const data = err.response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return null;
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productFilter, setProductFilter] = useState<number | undefined>();
  const [form] = Form.useForm();
  const pageSize = 10;

  const fetchReviews = async (pageNum = 0) => {
    setLoading(true);
    try {
      const { data } = await adminReviewsApi.list({
        page: pageNum,
        size: pageSize,
        ...(productFilter != null && { productId: productFilter }),
      });
      setReviews(data.content);
      setTotal(data.totalElements);
    } catch {
      message.error('Không tải được đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page, productFilter]);

  useEffect(() => {
    adminUsersApi.list({ page: 0, size: 500 }).then(({ data }) => setUsers(data.content)).catch(() => setUsers([]));
    productsApi.list({ page: 0, size: 500 }).then(({ data }) => setProducts(data.content)).catch(() => setProducts([]));
  }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await adminReviewsApi.create({
        userId: values.userId,
        productId: values.productId,
        rating: values.rating,
        comment: values.comment?.trim() || '',
        approved: values.approved ?? false,
      });
      message.success('Đã thêm đánh giá');
      setModalOpen(null);
      form.resetFields();
      fetchReviews(page);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error(getServerErrorMessage(e) || 'Thêm đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingReview) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await adminReviewsApi.update(editingReview.id, {
        rating: values.rating,
        comment: values.comment?.trim() ?? '',
        approved: values.approved,
      });
      message.success('Đã cập nhật đánh giá');
      setModalOpen(null);
      setEditingReview(null);
      form.resetFields();
      fetchReviews(page);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error(getServerErrorMessage(e) || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number, approved: boolean) => {
    try {
      await adminReviewsApi.approve(id, approved);
      message.success(approved ? 'Đã duyệt đánh giá' : 'Đã bỏ duyệt');
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)));
    } catch {
      message.error('Cập nhật thất bại');
    }
  };

  const handleDelete = (record: ReviewDto) => {
    Modal.confirm({
      title: 'Xóa đánh giá?',
      content: `Bạn có chắc muốn xóa đánh giá của "${record.username}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminReviewsApi.delete(record.id);
          message.success('Đã xóa đánh giá');
          fetchReviews(page);
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  const openEdit = (record: ReviewDto) => {
    setEditingReview(record);
    setModalOpen('edit');
    form.setFieldsValue({
      rating: record.rating,
      comment: record.comment ?? '',
      approved: record.approved ?? false,
    });
  };

  const columns: ColumnsType<ReviewDto> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, render: (t) => <Typography.Text code>{t}</Typography.Text> },
    { title: 'Product ID', dataIndex: 'productId', key: 'productId', width: 90 },
    { title: 'Người đánh giá', dataIndex: 'username', key: 'username', width: 130, ellipsis: true },
    {
      title: 'Sao',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (v: number) => <Rate disabled value={v} allowHalf style={{ fontSize: 14 }} />,
    },
    { title: 'Nội dung', dataIndex: 'comment', key: 'comment', width: 220, ellipsis: true },
    {
      title: 'Trạng thái',
      dataIndex: 'approved',
      key: 'approved',
      width: 160,
      render: (approved: boolean, record) =>
        approved ? (
          <Tag color="green">Đã duyệt</Tag>
        ) : (
          <Space size="small">
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(record.id, true)}>
              Duyệt
            </Button>
            <Button size="small" icon={<CloseOutlined />} onClick={() => handleApprove(record.id, false)}>
              Từ chối
            </Button>
          </Space>
        ),
    },
    { title: 'Ngày', dataIndex: 'createdAt', key: 'createdAt', width: 100, render: (t: string) => formatDate(t) },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          { key: 'detail', icon: <EyeOutlined />, label: 'Chi tiết', onClick: () => { setEditingReview(record); setModalOpen('detail'); } },
          { key: 'edit', icon: <EditOutlined />, label: 'Sửa', onClick: () => openEdit(record) },
          { type: 'divider' },
          { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => handleDelete(record) },
        ];
        return (
          <Dropdown menu={{ items: menuItems, triggerSubMenuAction: 'click' }} trigger={['click']}>
            <Button type="link" size="small" icon={<MoreOutlined />}>
              Thao tác
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
          Quản lý đánh giá / bình luận
        </Typography.Title>
        <Space>
          <Select
            placeholder="Lọc theo sản phẩm"
            allowClear
            style={{ width: 200 }}
            value={productFilter}
            onChange={setProductFilter}
            options={[{ value: undefined, label: 'Tất cả sản phẩm' }, ...products.map((p) => ({ value: p.id, label: `${p.id} - ${p.name}` }))]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalOpen('create'); form.resetFields(); }}>
            Thêm đánh giá
          </Button>
        </Space>
      </div>
      <Card>
        <Spin spinning={loading}>
          <Table
            dataSource={reviews}
            columns={columns}
            rowKey="id"
            pagination={{
              current: page + 1,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `Tổng ${t} đánh giá`,
              onChange: (p) => setPage(p - 1),
            }}
            size="middle"
            scroll={{ x: 920 }}
            tableLayout="fixed"
          />
        </Spin>
      </Card>

      {/* Modal Thêm */}
      <Modal
        title="Thêm đánh giá"
        open={modalOpen === 'create'}
        onOk={handleCreate}
        onCancel={() => setModalOpen(null)}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="userId" label="Khách hàng" rules={[{ required: true, message: 'Chọn khách hàng' }]}>
            <Select
              placeholder="Chọn user"
              showSearch
              optionFilterProp="label"
              options={users.map((u) => ({ value: u.id, label: `${u.username} (${u.email})` }))}
            />
          </Form.Item>
          <Form.Item name="productId" label="Sản phẩm" rules={[{ required: true, message: 'Chọn sản phẩm' }]}>
            <Select
              placeholder="Chọn sản phẩm"
              showSearch
              optionFilterProp="label"
              options={products.map((p) => ({ value: p.id, label: `${p.name}` }))}
            />
          </Form.Item>
          <Form.Item name="rating" label="Số sao" rules={[{ required: true, message: 'Chọn số sao' }]} initialValue={5}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Nội dung">
            <Input.TextArea rows={3} placeholder="Bình luận (tùy chọn)" maxLength={1001} showCount />
          </Form.Item>
          <Form.Item name="approved" label="Duyệt ngay" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="Đã duyệt" unCheckedChildren="Chờ duyệt" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa */}
      <Modal
        title="Sửa đánh giá"
        open={modalOpen === 'edit'}
        onOk={handleUpdate}
        onCancel={() => { setModalOpen(null); setEditingReview(null); form.resetFields(); }}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="rating" label="Số sao" rules={[{ required: true, message: 'Chọn số sao' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Nội dung">
            <Input.TextArea rows={3} maxLength={1001} showCount />
          </Form.Item>
          <Form.Item name="approved" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Đã duyệt" unCheckedChildren="Chờ duyệt" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chi tiết */}
      <Modal
        title={`Chi tiết đánh giá #${editingReview?.id ?? ''}`}
        open={modalOpen === 'detail'}
        onCancel={() => { setModalOpen(null); setEditingReview(null); }}
        footer={editingReview ? <Button type="primary" onClick={() => { setModalOpen(null); openEdit(editingReview); }}>Sửa</Button> : null}
      >
        {editingReview && (
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px' }}>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>ID</dt>
            <dd style={{ margin: 0 }}>{editingReview.id}</dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Sản phẩm ID</dt>
            <dd style={{ margin: 0 }}>{editingReview.productId}</dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Người đánh giá</dt>
            <dd style={{ margin: 0 }}>{editingReview.username}</dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Số sao</dt>
            <dd style={{ margin: 0 }}><Rate disabled value={editingReview.rating} allowHalf style={{ fontSize: 16 }} /></dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Nội dung</dt>
            <dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{editingReview.comment || '—'}</dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Trạng thái</dt>
            <dd style={{ margin: 0 }}><Tag color={editingReview.approved ? 'green' : 'default'}>{editingReview.approved ? 'Đã duyệt' : 'Chờ duyệt'}</Tag></dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Ngày tạo</dt>
            <dd style={{ margin: 0 }}>{formatDate(editingReview.createdAt)}</dd>
          </dl>
        )}
      </Modal>
    </div>
  );
}
