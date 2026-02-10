import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConfigProvider, Card, Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { getAdminTheme } from '@/styles/admin-tokens';
import '@/styles/admin-theme.css';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, loading } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  const onFinish = async (values: { username: string; password: string }) => {
    setSubmitting(true);
    try {
      const result = await login(values.username.trim(), values.password);
      if (result.ok) {
        if (result.role === 'ADMIN') {
          message.success('Đăng nhập thành công');
          navigate('/admin', { replace: true });
        } else {
          message.warning('Chỉ tài khoản quản trị mới được truy cập khu vực admin.');
        }
      } else {
        message.error('Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--admin-bg-layout)',
        }}
      >
        <span style={{ color: 'var(--admin-text-muted)' }}>Đang xác thực...</span>
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return null;
  }

  return (
    <ConfigProvider theme={getAdminTheme()}>
      <div
        className="admin-theme"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--admin-bg-layout)',
          padding: 24,
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid var(--admin-border)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Link to="/" style={{ color: 'var(--admin-text)', textDecoration: 'none' }}>
              <Typography.Title level={3} style={{ color: 'var(--admin-text)', margin: 0 }}>
                NOVA<span style={{ color: 'var(--admin-primary)' }}>WEAR</span>
              </Typography.Title>
            </Link>
            <Typography.Text style={{ color: 'var(--admin-text-secondary)', display: 'block', marginTop: 8 }}>
              Đăng nhập quản trị
            </Typography.Text>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Nhập tên đăng nhập hoặc email' }]}
            >
              <Input prefix={<UserOutlined style={{ color: 'var(--admin-text-muted)' }} />} placeholder="Tên đăng nhập / Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Nhập mật khẩu' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: 'var(--admin-text-muted)' }} />} placeholder="Mật khẩu" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 16 }}>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ color: 'var(--admin-text-secondary)', fontSize: 14 }}>
              ← Quay lại cửa hàng
            </Link>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
}
