import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { adminStatsApi, adminOrdersApi, adminUsersApi, productsApi } from '@/lib/adminApi';
import type { OrderDto } from '@/types/api';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

const statusColors: Record<string, string> = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  PROCESSING: 'purple',
  SHIPPED: 'cyan',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

const orderColumns: ColumnsType<OrderDto> = [
  { title: 'ID', dataIndex: 'id', key: 'id', render: (t) => <Typography.Text code>#{t}</Typography.Text> },
  { title: 'Khách hàng', dataIndex: 'username', key: 'username' },
  { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => formatCurrency(v) },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => <Tag color={statusColors[status] ?? 'default'}>{status}</Tag>,
  },
];

export function AdminDashboard() {
  const [revenue, setRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [byDay, setByDay] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsRes, ordersRes, usersRes, productsRes] = await Promise.all([
          adminStatsApi.revenue(),
          adminOrdersApi.list({ page: 0, size: 5 }),
          adminUsersApi.list({ page: 0, size: 1 }),
          productsApi.list({ page: 0, size: 1 }),
        ]);

        if (cancelled) return;
        const s = statsRes.data;
        setRevenue(Number(s.totalRevenue));
        setTotalOrders(s.totalOrders ?? 0);
        setByDay(
          (s.byDay ?? []).map((d) => ({
            date: d.date,
            revenue: Number(d.revenue),
            orders: d.orderCount ?? 0,
          }))
        );
        setRecentOrders(ordersRes.data.content);
        setTotalCustomers(usersRes.data.totalElements);
        setTotalProducts(productsRes.data.totalElements);
      } catch {
        if (!cancelled) setByDay([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartGrid = { stroke: 'var(--admin-border)' };
  const chartTick = { fill: 'var(--admin-text-muted)', fontSize: 12 };
  const tooltipStyle = { background: 'var(--admin-bg-container)', border: '1px solid var(--admin-border)', borderRadius: 8 };

  const stats = [
    { title: 'Doanh thu', value: revenue, prefix: <DollarOutlined />, formatter: (v: number) => formatCurrency(v) },
    { title: 'Đơn hàng', value: totalOrders, prefix: <ShoppingCartOutlined />, formatter: null },
    { title: 'Khách hàng', value: totalCustomers ?? '—', prefix: <UserOutlined />, formatter: null },
    { title: 'Sản phẩm', value: totalProducts ?? '—', prefix: <ShoppingOutlined />, formatter: null },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Typography.Title level={4} style={{ marginBottom: 4, color: 'var(--admin-text)' }}>
        Tổng quan
      </Typography.Title>
      <Typography.Text type="secondary" style={{ marginBottom: 24, display: 'block', color: 'var(--admin-text-secondary)' }}>
        Dữ liệu từ API. Doanh thu & đơn hàng 30 ngày gần nhất.
      </Typography.Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <Col xs={24} sm={12} lg={6} key={s.title}>
            <Card size="small">
              <Statistic
                title={<span style={{ color: 'var(--admin-text-secondary)' }}>{s.title}</span>}
                value={s.value}
                prefix={s.prefix}
                formatter={s.formatter ? (_, v) => s.formatter(Number(v)) : undefined}
                valueStyle={{ color: 'var(--admin-text)' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Doanh thu theo ngày" size="small">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={byDay}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--admin-primary-hover)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--admin-primary-hover)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
                  <XAxis dataKey="date" stroke={chartGrid.stroke} tick={chartTick} tickFormatter={(v) => (v && String(v).slice(5)) || v} />
                  <YAxis stroke={chartGrid.stroke} tick={chartTick} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatCurrency(value), 'Doanh thu']} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--admin-primary-hover)" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng theo ngày" size="small">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
                  <XAxis dataKey="date" stroke={chartGrid.stroke} tick={chartTick} tickFormatter={(v) => (v && String(v).slice(5)) || v} />
                  <YAxis stroke={chartGrid.stroke} tick={chartTick} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, 'Đơn hàng']} />
                  <Bar dataKey="orders" fill="var(--admin-primary-hover)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây" size="small">
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sản phẩm bán chạy" size="small">
            <Typography.Text style={{ color: 'var(--admin-text-secondary)' }}>
              Chưa có API thống kê sản phẩm bán chạy. Có thể bổ sung từ backend sau.
            </Typography.Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
