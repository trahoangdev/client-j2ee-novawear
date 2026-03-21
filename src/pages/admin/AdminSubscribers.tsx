import { useEffect, useState } from 'react';
import { Table, Tag, Button, Popconfirm, Statistic, Row, Col, Card, message, Modal, Form, Input } from 'antd';
import { MailOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminSubscribersApi } from '@/lib/adminApi';
import type { SubscriberDto } from '@/types/api';

export function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<SubscriberDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [page, setPage] = useState(0);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      adminSubscribersApi.list({ page, size: 20 }),
      adminSubscribersApi.count(),
    ])
      .then(([listRes, countRes]) => {
        setSubscribers(listRes.data.content);
        setTotal(listRes.data.totalElements);
        setActiveCount(countRes.data.active);
      })
      .catch(() => message.error('Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleDelete = async (id: number) => {
    await adminSubscribersApi.delete(id);
    message.success('Đã xóa');
    fetchData();
  };

  const handleSendEmail = async () => {
    try {
      const values = await form.validateFields();
      setSendingEmail(true);
      const { data } = await adminSubscribersApi.sendEmail(values);
      message.success(data.message);
      setEmailModalOpen(false);
      form.resetFields();
    } catch (e: any) {
      if (e.response?.data?.message) {
        message.error(e.response.data.message);
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (v: string) => <span className="font-mono text-sm">{v}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (v: boolean) => v ? <Tag color="green">Đang theo dõi</Tag> : <Tag color="default">Đã hủy</Tag>,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'subscribedAt',
      key: 'subscribedAt',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, r: SubscriberDto) => (
        <Popconfirm title="Xóa subscriber này?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Newsletter Subscribers</h2>
        <Button type="primary" icon={<MailOutlined />} onClick={() => setEmailModalOpen(true)}>
          Gửi Email Hàng Loạt
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng subscribers" value={total} prefix={<MailOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Đang theo dõi" value={activeCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Đã hủy" value={total - activeCount} valueStyle={{ color: '#999' }} />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={subscribers}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page + 1, total, pageSize: 20, onChange: (p) => setPage(p - 1) }}
      />

      <Modal
        title="Gửi Email Hàng Loạt"
        open={emailModalOpen}
        onCancel={() => setEmailModalOpen(false)}
        confirmLoading={sendingEmail}
        onOk={handleSendEmail}
        okText="Gửi"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subject"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề email..." />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea rows={6} placeholder="Nhập nội dung email..." />
          </Form.Item>
          <div className="text-red-500 text-sm mt-2">
            * Lưu ý: Hiện tại hệ thống sẽ gửi email tới toàn bộ người dùng "Đang theo dõi".
          </div>
        </Form>
      </Modal>
    </div>
  );
}
