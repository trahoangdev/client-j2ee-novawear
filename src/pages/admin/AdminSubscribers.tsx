import { useEffect, useState } from 'react';
import { Table, Tag, Button, Popconfirm, Statistic, Row, Col, Card, message } from 'antd';
import { MailOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminSubscribersApi } from '@/lib/adminApi';
import type { SubscriberDto } from '@/types/api';

export function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<SubscriberDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [page, setPage] = useState(0);

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
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Newsletter Subscribers</h2>

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
    </div>
  );
}
