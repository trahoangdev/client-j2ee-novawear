import { Card, Row, Col, Statistic, Typography } from 'antd';
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
import { dashboardStats, salesData, formatCurrency } from '@/data/mock-data';

export function AdminAnalytics() {
  const chartGrid = { stroke: 'var(--admin-border)' };
  const chartTick = { fill: 'var(--admin-text-muted)', fontSize: 11 };
  const tooltipStyle = { background: 'var(--admin-bg-container)', border: '1px solid var(--admin-border)', borderRadius: 8 };

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 16, color: 'var(--admin-text)' }}>
        Thống kê doanh thu & đơn hàng
      </Typography.Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng doanh thu"
              value={dashboardStats.totalRevenue}
              formatter={(v) => formatCurrency(Number(v))}
              valueStyle={{ color: 'var(--admin-primary-hover)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic title="Tổng đơn hàng" value={dashboardStats.totalOrders} valueStyle={{ color: 'var(--admin-text)' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic title="Khách hàng" value={dashboardStats.totalCustomers} valueStyle={{ color: 'var(--admin-text)' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic title="Sản phẩm" value={dashboardStats.totalProducts} valueStyle={{ color: 'var(--admin-text)' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Doanh thu theo ngày" size="small">
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--admin-primary-hover)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--admin-primary-hover)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
                  <XAxis dataKey="date" tick={chartTick} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={chartTick} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Doanh thu']} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--admin-primary-hover)" fill="url(#analyticsRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng theo ngày" size="small">
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
                  <XAxis dataKey="date" tick={chartTick} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={chartTick} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="orders" fill="var(--admin-primary-hover)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
