import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@/types';
import { getToken, setToken, clearToken, setOnUnauthorized } from '@/lib/api';
import { authApi } from '@/lib/adminApi';
import { toast } from '@/lib/toast';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ ok: boolean; role?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ ok: boolean; role?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUserResponseToUser(res: { id: number; username: string; email: string; role: string; fullName?: string; phone?: string; address?: string }): User {
  return {
    id: String(res.id),
    email: res.email,
    name: res.username,
    fullName: res.fullName ?? '',
    phone: res.phone ?? '',
    address: res.address ?? '',
    role: res.role === 'ADMIN' ? 'admin' : 'customer',
    createdAt: '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(mapUserResponseToUser(data));
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const { data } = await authApi.me();
      setUser(mapUserResponseToUser(data));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
    });
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<{ ok: boolean; role?: string }> => {
    try {
      const { data } = await authApi.login(usernameOrEmail.trim(), password);
      setToken(data.token);
      setUser(mapUserResponseToUser(data));
      setShowAuthModal(false);
      return { ok: true, role: data.role };
    } catch {
      return { ok: false };
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{ ok: boolean; role?: string }> => {
    try {
      await authApi.register({ username: username.trim(), email: email.trim(), password });
      return await login(username.trim(), password);
    } catch {
      return { ok: false };
    }
  };

  const logout = () => {
    const wasAdmin = user?.role === 'admin';
    clearToken();
    setUser(null);
    toast.success('Đã đăng xuất');
    // Redirect về trang login sau khi đăng xuất thành công
    setTimeout(() => {
      if (wasAdmin) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    }, 100);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser,
        showAuthModal,
        setShowAuthModal,
        authMode,
        setAuthMode,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
