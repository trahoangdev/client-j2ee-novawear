import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Input, Select, Popconfirm, Space, Descriptions, message, Image } from 'antd';
import { adminReturnsApi } from '@/lib/adminApi';
import type { ReturnRequestDto } from '@/types/api';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'orange' },
  APPROVED: { label: 'Đã duyệt', color: 'blue' },
  REJECTED: { label: 'Từ chối', color: 'red' },
  COMPLETED: { label: 'Hoàn tất', color: 'green' },
};

export function AdminReturns() {
  const [returns, setReturns] = useState<ReturnRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ReturnRequestDto | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const fetchReturns = () => {
    setLoading(true);
    adminReturnsApi.list({ page, size: 10 })
      .then(({ data }) => { setReturns(data.content); setTotal(data.totalElements); })
      .catch(() => message.error('Lỗi tải danh sách'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReturns(); }, [page]);

  const handleUpdateStatus = async () => {
    if (!selected || !newStatus) return;
    try {
      await adminReturnsApi.updateStatus(selected.id, newStatus, adminNote || undefined);
      message.success('Cập nhật trạng thái thành công');
      setDetailOpen(false);
      setSelected(null);
      setNewStatus('');
      setAdminNote('');
      fetchReturns();
    } catch {
      message.error('Lỗi cập nhật');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Mã đơn', dataIndex: 'orderCode', key: 'orderCode', render: (v: string) => <span className="font-mono">#{v}</span> },
    { title: 'Khách hàng', dataIndex: 'username', key: 'username' },
    { title: 'Lý do', dataIndex: 'reason', key: 'reason', ellipsis: true },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (v: string) => {
        const s = STATUS_MAP[v] ?? { label: v, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: '', key: 'actions',
      render: (_: unknown, r: ReturnRequestDto) => (
        <Button size="small" onClick={() => { setSelected(r); setNewStatus(r.status); setAdminNote(r.adminNote || ''); setDetailOpen(true); }}>
          Xử lý
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Yêu cầu trả hàng</h2>

      <Table
        dataSource={returns}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />

      <Modal
        title={`Yêu cầu trả hàng #${selected?.id}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setDetailOpen(false)}>Đóng</Button>,
          <Button key="save" type="primary" onClick={handleUpdateStatus}>Cập nhật</Button>,
        ]}
        width={600}
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Mã đơn hàng">#{selected.orderCode}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selected.username}</Descriptions.Item>
              <Descriptions.Item label="Lý do">{selected.reason}</Descriptions.Item>
              <Descriptions.Item label="Ngày gửi">{new Date(selected.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
            </Descriptions>

            {selected.images?.length > 0 && (
              <div>
                <p style={{ fontWeight: 500, marginBottom: 8 }}>Hình ảnh đính kèm:</p>
                <Image.PreviewGroup>
                  <Space wrap>
                    {selected.images.map((url, i) => (
                      <Image key={i} src={url} width={100} height={100} style={{ objectFit: 'cover', borderRadius: 8 }} />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}

            <div>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>Trạng thái:</p>
              <Select
                value={newStatus}
                onChange={setNewStatus}
                style={{ width: '100%' }}
                options={[
                  { value: 'PENDING', label: 'Chờ xử lý' },
                  { value: 'APPROVED', label: 'Duyệt' },
                  { value: 'REJECTED', label: 'Từ chối' },
                  { value: 'COMPLETED', label: 'Hoàn tất' },
                ]}
              />
            </div>

            <div>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>Ghi chú admin:</p>
              <Input.TextArea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Ghi chú cho khách hàng..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
