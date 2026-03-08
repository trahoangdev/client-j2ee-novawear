// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: Category;
  sizes: string[];
  colors: ProductColor[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size: string;
  color: ProductColor;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  size: string;
  color: ProductColor;
  price: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  ward: string;
  country: string;
}

export type PaymentMethod = 'paypal' | 'momo' | 'cod';

// Review Types
export interface Review {
  id: string;
  user: User;
  product: Product;
  rating: number;
  comment: string;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
}

// Admin Dashboard Types
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  totalProducts: number;
  productsChange: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product: Product;
  sales: number;
  revenue: number;
}
