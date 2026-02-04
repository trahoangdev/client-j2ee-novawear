import { useState, useEffect } from 'react';
import { Card, Table, Typography, Switch, message, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminUsersApi } from '@/lib/adminApi';
import type { UserResponse } from '@/types/api';

export function AdminCustomers() {
  const [dataSource, setDataSource] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
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

  const handleActiveChange = async (id: number, active: boolean) => {
    try {
      await adminUsersApi.setActive(id, active);
      message.success(active ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản');
      setDataSource((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u)));
    } catch {
      message.error('Cập nhật thất bại');
    }
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
      render: (active: boolean, record) => (
        <Switch
          checked={active}
          onChange={(checked) => handleActiveChange(record.id, checked)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Khóa"
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
          Quản lý khách hàng
        </Typography.Title>
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
            scroll={{ x: 620 }}
            tableLayout="fixed"
          />
        </Spin>
      </Card>
    </div>
  );
}
