import { Product, Category, Order, Review, User, DashboardStats, SalesData, TopProduct } from '@/types';

// Categories
export const categories: Category[] = [
  { id: '1', name: 'Áo', slug: 'tops', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80' },
  { id: '2', name: 'Quần', slug: 'pants', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80' },
  { id: '3', name: 'Váy', slug: 'dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80' },
  { id: '4', name: 'Phụ Kiện', slug: 'accessories', image: 'https://images.unsplash.com/photo-1611923134239-b9be5b4d1b2b?w=400&q=80' },
  { id: '5', name: 'Giày', slug: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { id: '6', name: 'Túi Xách', slug: 'bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
];

// Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Áo Blazer Dáng Rộng Premium',
    slug: 'ao-blazer-dang-rong-premium',
    description: 'Áo blazer thiết kế hiện đại với chất liệu cao cấp, phù hợp cho các dịp công sở và dạo phố.',
    price: 1890000,
    salePrice: 1490000,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    ],
    category: categories[0],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Đen', hex: '#2D2D2D' },
      { name: 'Kem', hex: '#E8DCC4' },
      { name: 'Xám', hex: '#8B8B8B' },
    ],
    inStock: true,
    stockCount: 45,
    rating: 4.8,
    reviewCount: 124,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Váy Midi Hoa Nhí Vintage',
    slug: 'vay-midi-hoa-nhi-vintage',
    description: 'Váy midi họa tiết hoa nhí mang đậm phong cách vintage, chất vải mềm mại thoáng mát.',
    price: 890000,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80',
    ],
    category: categories[2],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Hồng', hex: '#FFB6C1' },
      { name: 'Xanh Pastel', hex: '#B4D4E7' },
    ],
    inStock: true,
    stockCount: 32,
    rating: 4.6,
    reviewCount: 89,
    isFeatured: true,
    isNew: true,
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Quần Palazzo Ống Rộng',
    slug: 'quan-palazzo-ong-rong',
    description: 'Quần ống rộng phong cách thanh lịch, chất liệu cao cấp tôn dáng người mặc.',
    price: 750000,
    salePrice: 599000,
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
    ],
    category: categories[1],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Trắng', hex: '#FFFFFF' },
      { name: 'Be', hex: '#D4C5B5' },
      { name: 'Đen', hex: '#2D2D2D' },
    ],
    inStock: true,
    stockCount: 58,
    rating: 4.5,
    reviewCount: 156,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-01-08',
  },
  {
    id: '4',
    name: 'Túi Xách Mini Đeo Chéo',
    slug: 'tui-xach-mini-deo-cheo',
    description: 'Túi xách mini tiện dụng với thiết kế sang trọng, phù hợp cho mọi phong cách.',
    price: 1290000,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    ],
    category: categories[5],
    sizes: ['One Size'],
    colors: [
      { name: 'Đen', hex: '#2D2D2D' },
      { name: 'Nâu', hex: '#8B4513' },
      { name: 'Đỏ Đô', hex: '#800020' },
    ],
    inStock: true,
    stockCount: 23,
    rating: 4.9,
    reviewCount: 67,
    isFeatured: true,
    isNew: true,
    createdAt: '2024-02-28',
  },
  {
    id: '5',
    name: 'Giày Sandal Quai Ngang',
    slug: 'giay-sandal-quai-ngang',
    description: 'Sandal quai ngang thiết kế minimalist, đế êm ái phù hợp đi cả ngày.',
    price: 690000,
    salePrice: 490000,
    images: [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80',
      'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=80',
    ],
    category: categories[4],
    sizes: ['36', '37', '38', '39', '40'],
    colors: [
      { name: 'Đen', hex: '#2D2D2D' },
      { name: 'Kem', hex: '#E8DCC4' },
    ],
    inStock: true,
    stockCount: 41,
    rating: 4.4,
    reviewCount: 203,
    isFeatured: false,
    isNew: false,
    createdAt: '2023-12-10',
  },
  {
    id: '6',
    name: 'Áo Sơ Mi Linen Oversize',
    slug: 'ao-so-mi-linen-oversize',
    description: 'Áo sơ mi chất liệu linen tự nhiên, thoáng mát cho mùa hè.',
    price: 590000,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
    ],
    category: categories[0],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Trắng', hex: '#FFFFFF' },
      { name: 'Xanh Nhạt', hex: '#ADD8E6' },
      { name: 'Be', hex: '#D4C5B5' },
    ],
    inStock: true,
    stockCount: 72,
    rating: 4.7,
    reviewCount: 145,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-01-22',
  },
  {
    id: '7',
    name: 'Kính Mát Cat Eye Vintage',
    slug: 'kinh-mat-cat-eye-vintage',
    description: 'Kính mát dáng cat eye phong cách retro, chống UV 400.',
    price: 450000,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    ],
    category: categories[3],
    sizes: ['One Size'],
    colors: [
      { name: 'Đen', hex: '#2D2D2D' },
      { name: 'Nâu Tortoise', hex: '#704214' },
    ],
    inStock: true,
    stockCount: 89,
    rating: 4.3,
    reviewCount: 78,
    isFeatured: false,
    isNew: true,
    createdAt: '2024-03-01',
  },
  {
    id: '8',
    name: 'Đầm Maxi Boho',
    slug: 'dam-maxi-boho',
    description: 'Đầm maxi phong cách boho với họa tiết thổ cẩm độc đáo.',
    price: 1190000,
    salePrice: 890000,
    images: [
      'https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=800&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80',
    ],
    category: categories[2],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Đa Sắc', hex: '#FF6B6B' },
    ],
    inStock: true,
    stockCount: 18,
    rating: 4.8,
    reviewCount: 92,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-02-05',
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'customer@example.com',
    name: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    role: 'customer',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    email: 'admin@novawear.vn',
    name: 'Admin NOVAWEAR',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    role: 'admin',
    createdAt: '2023-12-01',
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'NW-2024-0001',
    user: mockUsers[0],
    items: [
      {
        id: '1',
        product: products[0],
        quantity: 1,
        size: 'M',
        color: products[0].colors[0],
        price: products[0].salePrice || products[0].price,
      },
      {
        id: '2',
        product: products[3],
        quantity: 1,
        size: 'One Size',
        color: products[3].colors[1],
        price: products[3].price,
      },
    ],
    status: 'delivered',
    shippingAddress: {
      fullName: 'Nguyễn Văn An',
      phone: '0901234567',
      street: '123 Nguyễn Huệ',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      country: 'Việt Nam',
    },
    paymentMethod: 'momo',
    subtotal: 2780000,
    shipping: 0,
    total: 2780000,
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-20T14:00:00Z',
  },
  {
    id: '2',
    orderNumber: 'NW-2024-0002',
    user: mockUsers[0],
    items: [
      {
        id: '3',
        product: products[1],
        quantity: 2,
        size: 'S',
        color: products[1].colors[0],
        price: products[1].price,
      },
    ],
    status: 'shipped',
    shippingAddress: {
      fullName: 'Nguyễn Văn An',
      phone: '0901234567',
      street: '123 Nguyễn Huệ',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      country: 'Việt Nam',
    },
    paymentMethod: 'paypal',
    subtotal: 1780000,
    shipping: 30000,
    total: 1810000,
    createdAt: '2024-03-01T08:15:00Z',
    updatedAt: '2024-03-03T16:30:00Z',
  },
  {
    id: '3',
    orderNumber: 'NW-2024-0003',
    user: mockUsers[0],
    items: [
      {
        id: '4',
        product: products[5],
        quantity: 1,
        size: 'L',
        color: products[5].colors[0],
        price: products[5].price,
      },
    ],
    status: 'processing',
    shippingAddress: {
      fullName: 'Nguyễn Văn An',
      phone: '0901234567',
      street: '123 Nguyễn Huệ',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      country: 'Việt Nam',
    },
    paymentMethod: 'cod',
    subtotal: 590000,
    shipping: 30000,
    total: 620000,
    createdAt: '2024-03-05T14:20:00Z',
    updatedAt: '2024-03-05T14:20:00Z',
  },
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: '1',
    user: mockUsers[0],
    product: products[0],
    rating: 5,
    comment: 'Chất vải rất đẹp, form chuẩn như mô tả. Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ shop dài dài!',
    isApproved: true,
    helpfulCount: 24,
    createdAt: '2024-02-22T10:00:00Z',
  },
  {
    id: '2',
    user: { ...mockUsers[0], id: '3', name: 'Trần Thị Bình', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
    product: products[0],
    rating: 4,
    comment: 'Áo đẹp, nhưng size hơi rộng một chút. Nên order nhỏ hơn 1 size.',
    isApproved: true,
    helpfulCount: 15,
    createdAt: '2024-02-18T15:30:00Z',
  },
  {
    id: '3',
    user: { ...mockUsers[0], id: '4', name: 'Lê Văn Cường' },
    product: products[1],
    rating: 5,
    comment: 'Váy xinh lắm ạ! Chất vải mát, màu sắc tươi sáng. 10 điểm không có nhưng!',
    isApproved: true,
    helpfulCount: 32,
    createdAt: '2024-03-02T09:45:00Z',
  },
];

// Dashboard Stats
export const dashboardStats: DashboardStats = {
  totalRevenue: 156780000,
  revenueChange: 12.5,
  totalOrders: 234,
  ordersChange: 8.2,
  totalCustomers: 1847,
  customersChange: 15.3,
  totalProducts: 89,
  productsChange: 5.1,
};

// Sales Data for Charts
export const salesData: SalesData[] = [
  { date: '2024-02-01', revenue: 4500000, orders: 12 },
  { date: '2024-02-02', revenue: 5200000, orders: 15 },
  { date: '2024-02-03', revenue: 3800000, orders: 9 },
  { date: '2024-02-04', revenue: 6100000, orders: 18 },
  { date: '2024-02-05', revenue: 5700000, orders: 14 },
  { date: '2024-02-06', revenue: 4900000, orders: 11 },
  { date: '2024-02-07', revenue: 7200000, orders: 21 },
  { date: '2024-02-08', revenue: 6800000, orders: 19 },
  { date: '2024-02-09', revenue: 5500000, orders: 16 },
  { date: '2024-02-10', revenue: 8100000, orders: 24 },
  { date: '2024-02-11', revenue: 7500000, orders: 22 },
  { date: '2024-02-12', revenue: 6300000, orders: 17 },
  { date: '2024-02-13', revenue: 5900000, orders: 15 },
  { date: '2024-02-14', revenue: 9200000, orders: 28 },
];

// Top Products
export const topProducts: TopProduct[] = [
  { product: products[0], sales: 124, revenue: 184760000 },
  { product: products[1], sales: 89, revenue: 79210000 },
  { product: products[3], sales: 67, revenue: 86430000 },
  { product: products[5], sales: 145, revenue: 85550000 },
  { product: products[7], sales: 92, revenue: 81880000 },
];

// Format currency helper
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format date helper
export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};
