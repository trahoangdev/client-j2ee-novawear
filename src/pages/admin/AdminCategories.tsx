import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Input, message, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminCategoriesApi } from '@/lib/adminApi';
import type { CategoryDto } from '@/types/api';

export function AdminCategories() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await adminCategoriesApi.list();
      setDataSource(data);
    } catch {
      message.error('Không tải được danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await adminCategoriesApi.update(editing.id, { name: values.name, description: values.description });
        message.success('Đã cập nhật danh mục');
      } else {
        await adminCategoriesApi.create({ name: values.name, description: values.description });
        message.success('Đã thêm danh mục');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      fetchCategories();
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error(editing ? 'Cập nhật thất bại' : 'Thêm danh mục thất bại');
    }
  };

  const handleDelete = (record: CategoryDto) => {
    Modal.confirm({
      title: 'Xóa danh mục?',
      content: `Bạn có chắc muốn xóa "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminCategoriesApi.delete(record.id);
          message.success('Đã xóa danh mục');
          fetchCategories();
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  const columns: ColumnsType<CategoryDto> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 90, render: (t) => <Typography.Text code>{t}</Typography.Text> },
    { title: 'Tên', dataIndex: 'name', key: 'name', width: 180, ellipsis: true },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
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
              form.setFieldsValue({ name: record.name, description: record.description });
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
        <Spin spinning={loading}>
          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} mục` }}
            size="middle"
            scroll={{ x: 560 }}
            tableLayout="fixed"
          />
        </Spin>
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
          <Form.Item name="description" label="Mô tả (tùy chọn)">
            <Input.TextArea placeholder="Mô tả ngắn" rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
