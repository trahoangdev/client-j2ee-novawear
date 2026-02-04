import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Typography, Rate, Space, Modal, message, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminReviewsApi } from '@/lib/adminApi';
import type { ReviewDto } from '@/types/api';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN');
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchReviews = async (pageNum = 0) => {
    setLoading(true);
    try {
      const { data } = await adminReviewsApi.list({ page: pageNum, size: pageSize });
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
  }, [page]);

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
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
          Quản lý đánh giá / bình luận
        </Typography.Title>
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
            scroll={{ x: 900 }}
            tableLayout="fixed"
          />
        </Spin>
      </Card>
    </div>
  );
}
