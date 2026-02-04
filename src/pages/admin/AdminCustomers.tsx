import { useState } from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Input, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { mockUsers as initialUsers } from '@/data/mock-data';
import type { User } from '@/types';

export function AdminCustomers() {
  const [dataSource, setDataSource] = useState(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setDataSource((prev) =>
          prev.map((u) =>
            u.id === editing.id
              ? {
                  ...u,
                  name: values.name,
                  email: values.email,
                  role: values.role,
                  avatar: values.avatar || undefined,
                }
              : u
          )
        );
        message.success('Đã cập nhật khách hàng');
      } else {
        const newUser: User = {
          id: String(Date.now()),
          name: values.name,
          email: values.email,
          role: values.role,
          avatar: values.avatar || undefined,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setDataSource((prev) => [...prev, newUser]);
        message.success('Đã thêm khách hàng');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: 'Xóa khách hàng?',
      content: `Bạn có chắc muốn xóa "${record.name}" (${record.email})?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        setDataSource((prev) => prev.filter((u) => u.id !== record.id));
        message.success('Đã xóa khách hàng');
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: '',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 64,
      align: 'center',
      render: (url: string) =>
        url ? (
          <img src={url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--admin-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography.Text style={{ color: 'var(--admin-text-muted)' }}>—</Typography.Text>
          </div>
        ),
    },
    { title: 'ID', dataIndex: 'id', key: 'id', width: 90, render: (t) => <Typography.Text code>{t}</Typography.Text> },
    { title: 'Tên', dataIndex: 'name', key: 'name', width: 140, ellipsis: true },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200, ellipsis: true },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (role === 'admin' ? 'Quản trị' : 'Khách hàng'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (t: string) => new Date(t).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              form.setFieldsValue({
                name: record.name,
                email: record.email,
                role: record.role,
                avatar: record.avatar ?? '',
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
          Quản lý khách hàng
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Thêm khách hàng
        </Button>
      </div>
      <Card>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} khách hàng` }}
          size="middle"
          scroll={{ x: 854 }}
          tableLayout="fixed"
        />
      </Card>
      <Modal
        title={editing ? 'Sửa khách hàng' : 'Thêm khách hàng'}
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
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="email@example.com" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'customer', label: 'Khách hàng' },
                { value: 'admin', label: 'Quản trị' },
              ]}
            />
          </Form.Item>
          <Form.Item name="avatar" label="URL avatar (tùy chọn)">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
