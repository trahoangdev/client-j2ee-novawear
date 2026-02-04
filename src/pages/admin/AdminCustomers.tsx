import { useState, useEffect } from 'react';
import { Card, Table, Typography, Switch, message, Spin, Button, Modal, Form, Input, Select, Tag, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { adminUsersApi } from '@/lib/adminApi';
import type { UserResponse } from '@/types/api';
import type { AxiosError } from 'axios';

const ROLE_OPTIONS = [
  { value: 'USER', label: 'Khách hàng' },
  { value: 'ADMIN', label: 'Quản trị' },
];

function getServerErrorMessage(e: unknown): string | null {
  const err = e as AxiosError<{ message?: string; error?: string }>;
  const data = err.response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return null;
}

export function AdminCustomers() {
  const [dataSource, setDataSource] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const pageSize = 10;

  const fetchUsers = async (pageNum = 0) => {
    setLoading(true);
    try {
      const { data } = await adminUsersApi.list({ page: pageNum, size: pageSize });
      setDataSource(data.content);
      setTotal(data.totalElements);
    } catch {
      message.error('Không tải được danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await adminUsersApi.create({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role ?? 'USER',
      });
      message.success('Đã thêm khách hàng');
      setModalOpen(null);
      form.resetFields();
      fetchUsers(page);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      const msg = getServerErrorMessage(e);
      message.error(msg || 'Thêm khách hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await adminUsersApi.update(editingUser.id, {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password?.trim() || undefined,
        role: values.role ?? 'USER',
        active: values.active,
      });
      message.success('Đã cập nhật khách hàng');
      setModalOpen(null);
      setEditingUser(null);
      form.resetFields();
      fetchUsers(page);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      const msg = getServerErrorMessage(e);
      message.error(msg || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (record: UserResponse) => {
    Modal.confirm({
      title: 'Xóa khách hàng?',
      content: `Bạn có chắc muốn xóa "${record.username}"? Tài khoản và dữ liệu liên quan sẽ bị xóa.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminUsersApi.delete(record.id);
          message.success('Đã xóa khách hàng');
          fetchUsers(page);
        } catch (e: unknown) {
          const msg = getServerErrorMessage(e);
          message.error(msg || 'Xóa thất bại');
        }
      },
    });
  };

  const openEdit = (record: UserResponse) => {
    setEditingUser(record);
    setModalOpen('edit');
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      password: '',
      role: record.role ?? 'USER',
      active: record.active ?? true,
    });
  };

  const columns: ColumnsType<UserResponse> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, render: (t) => <Typography.Text code>{t}</Typography.Text> },
    { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username', width: 140, ellipsis: true },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200, ellipsis: true },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (role === 'ADMIN' ? 'Quản trị' : 'Khách hàng'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'default'}>{active ? 'Hoạt động' : 'Khóa'}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          { key: 'detail', icon: <EyeOutlined />, label: 'Chi tiết', onClick: () => { setEditingUser(record); setModalOpen('detail'); } },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
          Quản lý khách hàng
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalOpen('create'); form.resetFields(); }}>
          Thêm khách hàng
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
              showTotal: (t) => `Tổng ${t} khách hàng`,
              onChange: (p) => setPage(p - 1),
            }}
            size="middle"
            scroll={{ x: 700 }}
            tableLayout="fixed"
          />
        </Spin>
      </Card>

      {/* Modal Thêm */}
      <Modal
        title="Thêm khách hàng"
        open={modalOpen === 'create'}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(null); form.resetFields(); }}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Nhập tên đăng nhập' }, { min: 2, message: 'Tối thiểu 2 ký tự' }]}>
            <Input placeholder="Tên đăng nhập" maxLength={50} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input type="email" placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" initialValue="USER">
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa */}
      <Modal
        title="Sửa khách hàng"
        open={modalOpen === 'edit'}
        onOk={handleUpdate}
        onCancel={() => { setModalOpen(null); setEditingUser(null); form.resetFields(); }}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Nhập tên đăng nhập' }, { min: 2, message: 'Tối thiểu 2 ký tự' }]}>
            <Input placeholder="Tên đăng nhập" maxLength={50} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input type="email" placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu mới" extra="Để trống nếu không đổi mật khẩu.">
            <Input.Password placeholder="Để trống = giữ nguyên" />
          </Form.Item>
          <Form.Item name="role" label="Vai trò">
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
          <Form.Item name="active" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chi tiết */}
      <Modal
        title={`Chi tiết: ${editingUser?.username ?? ''}`}
        open={modalOpen === 'detail'}
        onCancel={() => { setModalOpen(null); setEditingUser(null); }}
        footer={editingUser ? <Button type="primary" onClick={() => { setModalOpen(null); openEdit(editingUser); }}>Sửa</Button> : null}
      >
        {editingUser && (
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px' }}>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>ID</dt>
            <dd style={{ margin: 0 }}>{editingUser.id}</dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Tên đăng nhập</dt>
            <dd style={{ margin: 0 }}>{editingUser.username}</dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Email</dt>
            <dd style={{ margin: 0 }}>{editingUser.email}</dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Vai trò</dt>
            <dd style={{ margin: 0 }}>{editingUser.role === 'ADMIN' ? 'Quản trị' : 'Khách hàng'}</dd>
            <dt style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>Trạng thái</dt>
            <dd style={{ margin: 0 }}>{editingUser.active ? 'Hoạt động' : 'Khóa'}</dd>
          </dl>
        )}
      </Modal>
    </div>
  );
}
