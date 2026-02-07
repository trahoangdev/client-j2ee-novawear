import { useState, Suspense } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Dropdown, Space, Typography, Spin, App } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  StarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminTheme } from '@/styles/admin-tokens';
import '@/styles/admin-theme.css';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  { key: '/admin', icon: <DashboardOutlined />, label: <Link to="/admin">Tổng quan</Link> },
  { key: '/admin/categories', icon: <ShoppingOutlined />, label: <Link to="/admin/categories">Danh mục</Link> },
  { key: '/admin/products', icon: <ShoppingOutlined />, label: <Link to="/admin/products">Sản phẩm</Link> },
  { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: <Link to="/admin/orders">Đơn hàng</Link> },
  { key: '/admin/customers', icon: <UserOutlined />, label: <Link to="/admin/customers">Khách hàng</Link> },
  { key: '/admin/reviews', icon: <StarOutlined />, label: <Link to="/admin/reviews">Đánh giá</Link> },
  {
    key: '/admin/public',
    icon: <PictureOutlined />,
    label: 'Quản lý công khai',
    children: [
      { key: '/admin/public/banners', label: <Link to="/admin/public/banners">Banner</Link> },
    ],
  },
  { key: '/admin/analytics', icon: <BarChartOutlined />, label: <Link to="/admin/analytics">Thống kê</Link> },
  { key: '/admin/settings', icon: <SettingOutlined />, label: <Link to="/admin/settings">Cài đặt</Link> },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => document.body.classList.remove('admin-body');
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--admin-bg-layout)' }}>
        <span style={{ color: 'var(--admin-text-muted)' }}>Đang xác thực...</span>
      </div>
    );
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'store',
      icon: <GlobalOutlined />,
      label: 'Xem cửa hàng',
      onClick: () => navigate('/'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <ConfigProvider theme={getAdminTheme()}>
      <App>
        <Layout className="admin-theme" style={{ minHeight: '100vh', background: 'var(--admin-bg-layout)' }}>
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={240}
            style={{ background: 'var(--admin-bg-container)', borderRight: '1px solid var(--admin-border)' }}
          >
            {/* ... Sider content ... */}
            <div
              style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                paddingLeft: collapsed ? 0 : 24,
                borderBottom: '1px solid var(--admin-border)',
              }}
            >
              <Link to="/" style={{ color: 'var(--admin-text)', textDecoration: 'none' }}>
                <Typography.Title level={4} style={{ color: 'var(--admin-text)', margin: 0 }}>
                  NOVA<span style={{ color: 'var(--admin-primary)' }}>WEAR</span>
                </Typography.Title>
              </Link>
            </div>
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={['/admin/public']}
              items={menuItems}
              style={{ borderRight: 0, marginTop: 16, background: 'transparent' }}
            />
          </Sider>
          <Layout style={{ background: 'var(--admin-bg-layout)' }}>
            <Header
              style={{
                padding: '0 24px',
                background: 'var(--admin-bg-container)',
                borderBottom: '1px solid var(--admin-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Space>
                {collapsed ? (
                  <MenuUnfoldOutlined
                    style={{ color: 'var(--admin-text-secondary)', fontSize: 18, cursor: 'pointer' }}
                    onClick={() => setCollapsed(false)}
                  />
                ) : (
                  <MenuFoldOutlined
                    style={{ color: 'var(--admin-text-secondary)', fontSize: 18, cursor: 'pointer' }}
                    onClick={() => setCollapsed(true)}
                  />
                )}
              </Space>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer', color: 'var(--admin-text)' }}>
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'}
                    alt=""
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ color: 'var(--admin-text)' }}>{user?.name || 'Admin'}</span>
                </Space>
              </Dropdown>
            </Header>
            <Content
              style={{
                margin: 24,
                minHeight: 280,
                background: 'var(--admin-bg-container)',
                borderRadius: 8,
                padding: 24,
                border: '1px solid var(--admin-border)',
              }}
            >
              <Suspense fallback={
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400 }}>
                  <Spin size="large" tip="Đang tải trang...">
                    <div style={{ padding: 50 }} />
                  </Spin>
                </div>
              }>
                <Outlet />
              </Suspense>
            </Content>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
