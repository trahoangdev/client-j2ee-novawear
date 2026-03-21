import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppSettingsProvider } from "@/context/AppSettingsContext";

// Lazy load pages
const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const ShopPage = lazy(() => import("@/pages/ShopPage").then(m => ({ default: m.ShopPage })));
const BestsellerPage = lazy(() => import("@/pages/BestsellerPage").then(m => ({ default: m.BestsellerPage })));
const SalePage = lazy(() => import("@/pages/SalePage").then(m => ({ default: m.SalePage })));
const NewArrivalsPage = lazy(() => import("@/pages/NewArrivalsPage").then(m => ({ default: m.NewArrivalsPage })));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage").then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import("@/pages/CartPage").then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const PaymentReturnPage = lazy(() => import("@/pages/PaymentReturnPage").then(m => ({ default: m.PaymentReturnPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const OrdersPage = lazy(() => import("@/pages/OrdersPage").then(m => ({ default: m.OrdersPage })));
const FaqPage = lazy(() => import("@/pages/FaqPage").then(m => ({ default: m.FaqPage })));
const ShippingPage = lazy(() => import("@/pages/ShippingPage").then(m => ({ default: m.ShippingPage })));
const ReturnsPage = lazy(() => import("@/pages/ReturnsPage").then(m => ({ default: m.ReturnsPage })));
const SizeGuidePage = lazy(() => import("@/pages/SizeGuidePage").then(m => ({ default: m.SizeGuidePage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("@/pages/TermsPage").then(m => ({ default: m.TermsPage })));
const WishlistPage = lazy(() => import("@/pages/WishlistPage").then(m => ({ default: m.WishlistPage })));

// 404
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

// Auth pages
const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));

// Admin pages
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories").then(m => ({ default: m.AdminCategories })));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts").then(m => ({ default: m.AdminProducts })));
const AdminProductForm = lazy(() => import("@/pages/admin/AdminProductForm").then(m => ({ default: m.AdminProductForm })));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders").then(m => ({ default: m.AdminOrders })));
const AdminCustomers = lazy(() => import("@/pages/admin/AdminCustomers").then(m => ({ default: m.AdminCustomers })));
const AdminReviews = lazy(() => import("@/pages/admin/AdminReviews").then(m => ({ default: m.AdminReviews })));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics").then(m => ({ default: m.AdminAnalytics })));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings").then(m => ({ default: m.AdminSettings })));
const AdminBanners = lazy(() => import("@/pages/admin/AdminBanners").then(m => ({ default: m.AdminBanners })));
const AdminVouchers = lazy(() => import("@/pages/admin/AdminVouchers").then(m => ({ default: m.AdminVouchers })));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin").then(m => ({ default: m.AdminLogin })));
const AdminFlashSales = lazy(() => import("@/pages/admin/AdminFlashSales").then(m => ({ default: m.AdminFlashSales })));
const AdminReturns = lazy(() => import("@/pages/admin/AdminReturns").then(m => ({ default: m.AdminReturns })));
const AdminSubscribers = lazy(() => import("@/pages/admin/AdminSubscribers").then(m => ({ default: m.AdminSubscribers })));
const AdminBundles = lazy(() => import("@/pages/admin/AdminBundles").then(m => ({ default: m.AdminBundles })));
const BundlesPage = lazy(() => import("@/pages/BundlesPage"));

// Live Chat Widget
import { LiveChatWidget } from "@/components/layout/LiveChatWidget";

// Loading Fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppSettingsProvider>
        <WishlistProvider>
          <CartProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/nam" element={<ShopPage />} />
                <Route path="/nu" element={<ShopPage />} />
                <Route path="/unisex" element={<ShopPage />} />
                <Route path="/bestseller" element={<BestsellerPage />} />
                <Route path="/sale" element={<SalePage />} />
                <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment/vnpay/return" element={<PaymentReturnPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/size-guide" element={<SizeGuidePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/bundles" element={<BundlesPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Admin: login (standalone, no layout) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                {/* Admin: dashboard + nested (protected by AdminLayout) */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/:id/edit" element={<AdminProductForm />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="public/banners" element={<AdminBanners />} />
                  <Route path="vouchers" element={<AdminVouchers />} />
                  <Route path="flash-sales" element={<AdminFlashSales />} />
                  <Route path="returns" element={<AdminReturns />} />
                  <Route path="subscribers" element={<AdminSubscribers />} />
                  <Route path="bundles" element={<AdminBundles />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>

            {/* Global Components */}
            <LiveChatWidget />
            <Toaster 
              position="top-right" 
              richColors 
              expand 
              duration={4000} 
              offset={{ top: 80 }} 
            />
          </CartProvider>
        </WishlistProvider>
      </AppSettingsProvider>
    </AuthProvider>
  );
}

export default App;

