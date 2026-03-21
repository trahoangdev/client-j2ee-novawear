import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Spin, Empty, Button, Tooltip as AntTooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShoppingOutlined,
  FolderOutlined,
  StarOutlined,
  PictureOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
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
  Cell,
  Legend,
} from 'recharts';
import {
  adminStatsApi,
  adminOrdersApi,
  adminUsersApi,
  productsApi,
  adminCategoriesApi,
  adminReviewsApi,
} from '@/lib/adminApi';
import type { OrderDto, TopProductDto } from '@/types/api';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function formatDate(iso: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
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
  { title: 'ID', dataIndex: 'id', key: 'id', width: 72, render: (t) => <Typography.Text code>#{t}</Typography.Text> },
  { title: 'Ngày đặt', dataIndex: 'orderDate', key: 'orderDate', width: 100, render: (v: string) => formatDate(v) },
  { title: 'Khách hàng', dataIndex: 'username', key: 'username' },
  { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => formatCurrency(v) },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => <Tag color={statusColors[status] ?? 'default'}>{status}</Tag>,
  },
];

const quickLinks = [
  { to: '/admin/orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng' },
  { to: '/admin/customers', icon: <UserOutlined />, label: 'Khách hàng' },
  { to: '/admin/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
  { to: '/admin/reviews', icon: <StarOutlined />, label: 'Đánh giá' },
  { to: '/admin/public/banners', icon: <PictureOutlined />, label: 'Banner' },
  { to: '/admin/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
];

export function AdminDashboard() {
  const [revenue, setRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalCategories, setTotalCategories] = useState<number | null>(null);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [byDay, setByDay] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        ordersRes,
        usersRes,
        productsRes,
        categoriesRes,
        reviewsRes,
        topProductsRes,
      ] = await Promise.all([
        adminStatsApi.revenue(),
        adminOrdersApi.list({ page: 0, size: 5 }),
        adminUsersApi.list({ page: 0, size: 1 }),
        productsApi.list({ page: 0, size: 1 }),
        adminCategoriesApi.list(),
        adminReviewsApi.list({ page: 0, size: 500 }),
        adminStatsApi.topProducts({ limit: 5 }),
      ]);

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
      setTotalCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0);
      const pending = (reviewsRes.data.content ?? []).filter((r) => !r.approved).length;
      setPendingReviewsCount(pending);
      setTopProducts(topProductsRes.data);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartGrid = { stroke: 'var(--admin-border)' };
  const chartTick = { fill: 'var(--admin-text-muted)', fontSize: 12 };
  const tooltipStyle = { background: 'var(--admin-bg-container)', border: '1px solid var(--admin-border)', borderRadius: 8 };

  const stats = [
    { title: 'Doanh thu', value: revenue, prefix: <DollarOutlined />, formatter: (v: number) => formatCurrency(v) },
    { title: 'Đơn hàng', value: totalOrders, prefix: <ShoppingCartOutlined />, formatter: null },
    { title: 'Khách hàng', value: totalCustomers ?? '—', prefix: <UserOutlined />, formatter: null },
    { title: 'Sản phẩm', value: totalProducts ?? '—', prefix: <ShoppingOutlined />, formatter: null },
    { title: 'Danh mục', value: totalCategories ?? '—', prefix: <FolderOutlined />, formatter: null },
  ];

  const chartEmpty = (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );

  return (
    <Spin spinning={loading} tip="Đang tải...">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0, color: 'var(--admin-text)' }}>
              Tổng quan
            </Typography.Title>
            <Typography.Text type="secondary" style={{ color: 'var(--admin-text-secondary)' }}>
              Doanh thu & đơn hàng 30 ngày gần nhất.
            </Typography.Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {stats.map((s) => (
            <Col xs={24} sm={12} lg={8} key={s.title}>
              <Card size="small">
                <Statistic
                  title={<span style={{ color: 'var(--admin-text-secondary)' }}>{s.title}</span>}
                  value={s.value}
                  prefix={s.prefix}
                  formatter={s.formatter ? (v) => s.formatter(Number(v)) : undefined}
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
                {byDay.length === 0 ? (
                  chartEmpty
                ) : (
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
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Top 5 Sản phẩm bán chạy (30 ngày)" size="small">
              <div style={{ height: 280 }}>
                {topProducts.length === 0 ? (
                  chartEmpty
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topProducts} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} horizontal={false} />
                      <XAxis type="number" stroke={chartGrid.stroke} tick={chartTick} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        stroke={chartGrid.stroke}
                        tick={{ ...chartTick, fontSize: 11 }}
                        interval={0}
                        tickFormatter={(val) => val.length > 15 ? val.slice(0, 15) + '...' : val}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: 'var(--admin-bg-layout)' }}
                      />
                      <Bar dataKey="totalSold" name="Đã bán" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                        {topProducts.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'][index % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
            <Card
              title="Hành động nhanh"
              size="small"
              extra={
                pendingReviewsCount > 0 ? (
                  <Link to="/admin/reviews">
                    <Tag color="orange">{pendingReviewsCount} đánh giá chờ duyệt</Tag>
                  </Link>
                ) : null
              }
            >
              <Row gutter={[8, 8]}>
                {quickLinks.map(({ to, icon, label }) => (
                  <Col span={12} key={to}>
                    <Link
                      to={to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        color: 'var(--admin-text)',
                        background: 'var(--admin-bg-layout)',
                      }}
                    >
                      {icon}
                      <span>{label}</span>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
