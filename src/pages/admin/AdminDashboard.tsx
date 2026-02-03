import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';

const statsCards = [
  {
    title: 'Doanh Thu',
    value: dashboardStats.totalRevenue,
    change: dashboardStats.revenueChange,
    icon: DollarSign,
    format: 'currency',
    gradient: 'from-cyan/20 to-cyan/5',
    iconBg: 'bg-cyan/20',
    iconColor: 'text-cyan',
  },
  {
    title: 'Đơn Hàng',
    value: dashboardStats.totalOrders,
    change: dashboardStats.ordersChange,
    icon: ShoppingCart,
    format: 'number',
    gradient: 'from-magenta/20 to-magenta/5',
    iconBg: 'bg-magenta/20',
    iconColor: 'text-magenta',
  },
  {
    title: 'Khách Hàng',
    value: dashboardStats.totalCustomers,
    change: dashboardStats.customersChange,
    icon: Users,
    format: 'number',
    gradient: 'from-gold/20 to-gold/5',
    iconBg: 'bg-gold/20',
    iconColor: 'text-gold',
  },
  {
    title: 'Sản Phẩm',
    value: dashboardStats.totalProducts,
    change: dashboardStats.productsChange,
    icon: Package,
    format: 'number',
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
  },
];

const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  confirmed: 'bg-blue-500/20 text-blue-500',
  processing: 'bg-purple-500/20 text-purple-500',
  shipped: 'bg-cyan/20 text-cyan',
  delivered: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

const orderStatusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          Tổng Quan
        </h1>
        <p className="text-white/50">Chào mừng trở lại! Đây là tình hình kinh doanh của bạn.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className={cn(
              'bg-gradient-to-br border-white/10',
              stat.gradient
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/70 mb-1">{stat.title}</p>
                  <p className="font-display text-2xl font-bold text-white">
                    {stat.format === 'currency'
                      ? formatCurrency(stat.value)
                      : stat.value.toLocaleString()}
                  </p>
                  <div
                    className={cn(
                      'flex items-center gap-1 mt-2 text-sm',
                      stat.change >= 0 ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {stat.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(stat.change)}%</span>
                    <span className="text-white/50">so với tháng trước</span>
                  </div>
                </div>
                <div className={cn('p-3 rounded-xl', stat.iconBg)}>
                  <stat.icon className={cn('h-6 w-6', stat.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-navy-light border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Doanh Thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1F36',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#00D9FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card className="bg-navy-light border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1F36',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [value, 'Đơn hàng']}
                  />
                  <Bar dataKey="orders" fill="#FF006E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-navy-light border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Đơn Hàng Gần Đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cyan/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-cyan" />
                    </div>
                    <div>
                      <p className="font-medium text-white font-mono text-sm">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-white/50">{order.user.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {formatCurrency(order.total)}
                    </p>
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                        orderStatusColors[order.status]
                      )}
                    >
                      {orderStatusLabels[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-navy-light border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Sản Phẩm Bán Chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((item, index) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                >
                  <span className="font-display text-lg font-bold text-white/30 w-6">
                    #{index + 1}
                  </span>
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-12 w-10 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-white/50">{item.sales} đã bán</p>
                  </div>
                  <p className="font-medium text-cyan">
                    {formatCurrency(item.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
