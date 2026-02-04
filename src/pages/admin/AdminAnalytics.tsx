import { useState, useEffect } from 'react';
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
import { adminStatsApi, adminUsersApi, productsApi } from '@/lib/adminApi';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export function AdminAnalytics() {
  const [revenue, setRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [byDay, setByDay] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [statsRes, usersRes, productsRes] = await Promise.all([
          adminStatsApi.revenue(),
          adminUsersApi.list({ page: 0, size: 1 }),
          productsApi.list({ page: 0, size: 1 }),
        ]);
        if (cancelled) return;
        const s = statsRes.data;
        setRevenue(Number(s.totalRevenue));
        setTotalOrders(s.totalOrders ?? 0);
        setTotalCustomers(usersRes.data.totalElements);
        setTotalProducts(productsRes.data.totalElements);
        setByDay(
          (s.byDay ?? []).map((d) => ({
            date: d.date,
            revenue: Number(d.revenue),
            orders: d.orderCount ?? 0,
          }))
        );
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
              value={revenue}
              formatter={(v) => formatCurrency(Number(v))}
              valueStyle={{ color: 'var(--admin-primary-hover)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic title="Tổng đơn hàng" value={totalOrders} valueStyle={{ color: 'var(--admin-text)' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic title="Khách hàng" value={totalCustomers ?? '—'} valueStyle={{ color: 'var(--admin-text)' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic title="Sản phẩm" value={totalProducts ?? '—'} valueStyle={{ color: 'var(--admin-text)' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Doanh thu theo ngày" size="small">
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={byDay}>
                  <defs>
                    <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--admin-primary-hover)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--admin-primary-hover)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
                  <XAxis dataKey="date" tick={chartTick} tickFormatter={(v) => (v && String(v).slice(5)) || v} />
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
                <BarChart data={byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
                  <XAxis dataKey="date" tick={chartTick} tickFormatter={(v) => (v && String(v).slice(5)) || v} />
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
