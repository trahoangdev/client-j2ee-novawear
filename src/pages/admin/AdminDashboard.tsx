import { Card, Row, Col, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShoppingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
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
} from 'recharts';
import { dashboardStats, salesData, topProducts, mockOrders, formatCurrency } from '@/data/mock-data';
import type { Order, OrderStatus } from '@/types';

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'gold',
  confirmed: 'blue',
  processing: 'purple',
  shipped: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

const orderColumns: ColumnsType<Order> = [
  {
    title: 'Mã đơn',
    dataIndex: 'orderNumber',
    key: 'orderNumber',
    render: (text: string) => <Typography.Text code>{text}</Typography.Text>,
  },
  {
    title: 'Khách hàng',
    key: 'user',
    render: (_: unknown, record: Order) => record.user.name,
  },
  {
    title: 'Tổng tiền',
    dataIndex: 'total',
    key: 'total',
    render: (val: number) => formatCurrency(val),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: OrderStatus) => (
      <Tag color={orderStatusColors[status]}>{orderStatusLabels[status]}</Tag>
    ),
  },
];

export function AdminDashboard() {
  const stats = [
    {
      title: 'Doanh thu',
      value: dashboardStats.totalRevenue,
      change: dashboardStats.revenueChange,
      prefix: <DollarOutlined />,
      formatter: (v: number) => formatCurrency(v),
    },
    {
      title: 'Đơn hàng',
      value: dashboardStats.totalOrders,
      change: dashboardStats.ordersChange,
      prefix: <ShoppingCartOutlined />,
    },
    {
      title: 'Khách hàng',
      value: dashboardStats.totalCustomers,
      change: dashboardStats.customersChange,
      prefix: <UserOutlined />,
    },
    {
      title: 'Sản phẩm',
      value: dashboardStats.totalProducts,
      change: dashboardStats.productsChange,
      prefix: <ShoppingOutlined />,
    },
  ];

  const chartGrid = { stroke: 'var(--admin-border)' };
  const chartTick = { fill: 'var(--admin-text-muted)', fontSize: 12 };
  const tooltipStyle = { background: 'var(--admin-bg-container)', border: '1px solid var(--admin-border)', borderRadius: 8 };

  return (
    <div style={{ marginBottom: 24 }}>
      <Typography.Title level={4} style={{ marginBottom: 4, color: 'var(--admin-text)' }}>
        Tổng quan
      </Typography.Title>
      <Typography.Text type="secondary" style={{ marginBottom: 24, display: 'block', color: 'var(--admin-text-secondary)' }}>
        Chào mừng trở lại! Đây là tình hình kinh doanh của bạn.
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
              <div style={{ marginTop: 8, fontSize: 12 }}>
                {s.change >= 0 ? (
                  <ArrowUpOutlined style={{ color: 'var(--admin-success)', marginRight: 4 }} />
                ) : (
                  <ArrowDownOutlined style={{ color: 'var(--admin-error)', marginRight: 4 }} />
                )}
                <span style={{ color: s.change >= 0 ? 'var(--admin-success)' : 'var(--admin-error)' }}>{Math.abs(s.change)}%</span>
                <span style={{ color: 'var(--admin-text-secondary)', marginLeft: 4 }}>so với tháng trước</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Doanh thu" size="small">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--admin-primary-hover)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--admin-primary-hover)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
                  <XAxis dataKey="date" stroke={chartGrid.stroke} tick={chartTick} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke={chartGrid.stroke} tick={chartTick} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatCurrency(value), 'Doanh thu']} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--admin-primary-hover)" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng" size="small">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
                  <XAxis dataKey="date" stroke={chartGrid.stroke} tick={chartTick} tickFormatter={(v) => v.slice(5)} />
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
              dataSource={mockOrders.slice(0, 5)}
              columns={orderColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sản phẩm bán chạy" size="small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topProducts.slice(0, 5).map((item, index) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 0',
                    borderBottom: index < 4 ? '1px solid var(--admin-border)' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 600, width: 24 }}>#{index + 1}</span>
                  <img
                    src={item.product.images[0]}
                    alt=""
                    style={{ width: 40, height: 48, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text style={{ color: 'var(--admin-text)' }} ellipsis>
                      {item.product.name}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                      {item.sales} đã bán
                    </Typography.Text>
                  </div>
                  <Typography.Text style={{ color: 'var(--admin-primary-hover)', fontWeight: 500 }}>
                    {formatCurrency(item.revenue)}
                  </Typography.Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
