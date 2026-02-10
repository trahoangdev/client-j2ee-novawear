/**
 * Admin design tokens – nguồn dùng chung cho ConfigProvider (Ant Design) và inline style.
 * Đồng bộ với biến trong admin-theme.css (--admin-*).
 */
export const adminTokens = {
  /* Nền */
  bgLayout: '#f1f5f9',
  bgContainer: '#ffffff',
  bgElevated: '#f8fafc',
  bgHover: 'rgba(0, 0, 0, 0.04)',
  /* Viền */
  border: '#e2e8f0',
  borderSubtle: '#e2e8f0',
  /* Chữ */
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  /* Accent */
  primary: '#0ea5e9',
  primaryHover: '#38bdf8',
  primaryActive: '#0284c7',
  /* Semantic */
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
} as const;

/** Theme object cho Ant Design ConfigProvider */
export function getAdminTheme() {
  const t = adminTokens;
  return {
    token: {
      colorPrimary: t.primary,
      colorPrimaryHover: t.primaryHover,
      colorPrimaryActive: t.primaryActive,
      colorSuccess: t.success,
      colorWarning: t.warning,
      colorError: t.error,
      colorBgLayout: t.bgLayout,
      colorBgContainer: t.bgContainer,
      colorBgElevated: t.bgElevated,
      colorBorder: t.border,
      colorBorderSecondary: t.borderSubtle,
      colorText: t.text,
      colorTextSecondary: t.textSecondary,
      colorTextTertiary: t.textMuted,
    },
    components: {
      Layout: {
        siderBg: t.bgContainer,
        headerBg: t.bgContainer,
        bodyBg: t.bgLayout,
      },
      Menu: {
        itemBg: 'transparent',
        itemColor: t.textSecondary,
        itemHoverColor: t.primary,
        itemHoverBg: 'rgba(14, 165, 233, 0.08)',
        itemSelectedColor: t.primary,
        itemSelectedBg: 'rgba(14, 165, 233, 0.12)',
      },
      Card: {
        colorBgContainer: t.bgContainer,
        colorBorderSecondary: t.borderSubtle,
      },
      Table: {
        colorBgContainer: t.bgContainer,
        colorBorderSecondary: t.borderSubtle,
        headerBg: t.bgElevated,
        headerColor: t.textSecondary,
      },
      Input: {
        colorBgContainer: t.bgContainer,
        colorBorder: t.border,
        colorText: t.text,
        activeBorderColor: t.primary,
      },
      Select: {
        colorBgContainer: t.bgContainer,
        colorBorder: t.border,
        colorText: t.text,
      },
      Button: {
        primaryColor: t.text,
      },
    },
  };
}
