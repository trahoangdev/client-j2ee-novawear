import { useState } from 'react';
import { Card, Table, Button, Tag, Typography, Rate, Space, Modal, Form, Input, Select, Switch, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { mockReviews, formatDate, products, mockUsers } from '@/data/mock-data';
import type { Review } from '@/types';

const { TextArea } = Input;

export function AdminReviews() {
  const [reviews, setReviews] = useState(mockReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then((values) => {
      const product = products.find((p) => p.id === values.productId);
      const user = mockUsers.find((u) => u.id === values.userId);
      if (!product || !user) {
        message.error('Chọn sản phẩm và người đánh giá');
        return;
      }
      if (editing) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editing.id
              ? {
                  ...r,
                  rating: values.rating,
                  comment: values.comment,
                  isApproved: !!values.isApproved,
                }
              : r
          )
        );
        message.success('Đã cập nhật đánh giá');
      } else {
        const newReview: Review = {
          id: String(Date.now()),
          user,
          product,
          rating: values.rating,
          comment: values.comment,
          isApproved: !!values.isApproved,
          helpfulCount: 0,
          createdAt: new Date().toISOString(),
        };
        setReviews((prev) => [...prev, newReview]);
        message.success('Đã thêm đánh giá');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleApprove = (id: string, approved: boolean) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: approved } : r)));
  };

  const handleDelete = (record: Review) => {
    Modal.confirm({
      title: 'Xóa đánh giá?',
      content: `Bạn có chắc muốn xóa đánh giá của "${record.user.name}" cho "${record.product.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        setReviews((prev) => prev.filter((r) => r.id !== record.id));
        message.success('Đã xóa đánh giá');
      },
    });
  };

  const columns: ColumnsType<Review> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 180,
      ellipsis: true,
      render: (_, r) => r.product.name,
    },
    {
      title: 'Người đánh giá',
      key: 'user',
      width: 130,
      ellipsis: true,
      render: (_, r) => r.user.name,
    },
    {
      title: 'Sao',
      dataIndex: 'rating',
      key: 'rating',
      width: 90,
      render: (v: number) => <Rate disabled value={v} allowHalf style={{ fontSize: 14 }} />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isApproved',
      key: 'isApproved',
      width: 150,
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
    {
      title: 'Hữu ích',
      dataIndex: 'helpfulCount',
      key: 'helpfulCount',
      width: 80,
      align: 'center',
    },
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (t: string) => formatDate(t),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              form.setFieldsValue({
                productId: record.product.id,
                userId: record.user.id,
                rating: record.rating,
                comment: record.comment,
                isApproved: record.isApproved,
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
          Quản lý đánh giá / bình luận
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
          Thêm đánh giá
        </Button>
      </div>
      <Card>
        <Table
          dataSource={reviews}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} đánh giá` }}
          size="middle"
          scroll={{ x: 1080 }}
          tableLayout="fixed"
        />
      </Card>
      <Modal
        title={editing ? 'Sửa đánh giá' : 'Thêm đánh giá'}
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
          <Form.Item name="productId" label="Sản phẩm" rules={[{ required: true, message: 'Chọn sản phẩm' }]}>
            <Select
              placeholder="Chọn sản phẩm"
              options={products.map((p) => ({ value: p.id, label: p.name }))}
              showSearch
              optionFilterProp="label"
              disabled={!!editing}
            />
          </Form.Item>
          <Form.Item name="userId" label="Người đánh giá" rules={[{ required: true, message: 'Chọn người đánh giá' }]}>
            <Select
              placeholder="Chọn khách hàng"
              options={mockUsers.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))}
              disabled={!!editing}
            />
          </Form.Item>
          <Form.Item name="rating" label="Số sao" rules={[{ required: true, message: 'Chọn số sao' }]}>
            <Rate allowHalf />
          </Form.Item>
          <Form.Item name="comment" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung' }]}>
            <TextArea rows={3} placeholder="Nội dung đánh giá / bình luận" />
          </Form.Item>
          <Form.Item name="isApproved" label="Đã duyệt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
