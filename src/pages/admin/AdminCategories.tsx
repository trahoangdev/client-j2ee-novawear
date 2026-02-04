import { useState } from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categories } from '@/data/mock-data';
import type { Category } from '@/types';

export function AdminCategories() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState(categories);

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setDataSource((prev) =>
          prev.map((c) =>
            c.id === editing.id
              ? { ...c, name: values.name, slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-') }
              : c
          )
        );
        message.success('Đã cập nhật danh mục');
      } else {
        setDataSource((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            name: values.name,
            slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-'),
          },
        ]);
        message.success('Đã thêm danh mục');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record: Category) => {
    Modal.confirm({
      title: 'Xóa danh mục?',
      content: `Bạn có chắc muốn xóa "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        setDataSource((prev) => prev.filter((c) => c.id !== record.id));
        message.success('Đã xóa danh mục');
      },
    });
  };

  const columns: ColumnsType<Category> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 90, render: (t) => <Typography.Text code>{t}</Typography.Text> },
    { title: 'Tên', dataIndex: 'name', key: 'name', width: 180, ellipsis: true },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: 140, ellipsis: true },
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
              form.setFieldsValue({ name: record.name, slug: record.slug });
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
          Quản lý danh mục
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Thêm danh mục
        </Button>
      </div>
      <Card>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} mục` }}
          size="middle"
          scroll={{ x: 560 }}
          tableLayout="fixed"
        />
      </Card>
      <Modal
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Nhập tên danh mục' }]}>
            <Input placeholder="Ví dụ: Áo" />
          </Form.Item>
          <Form.Item name="slug" label="Slug (tùy chọn)">
            <Input placeholder="Ví dụ: ao" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
