import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthModal } from "@/components/auth/AuthModal";

// Lazy load pages
const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const ShopPage = lazy(() => import("@/pages/ShopPage").then(m => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage").then(m => ({ default: m.ProductDetailPage })));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
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
      <CartProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
        
        {/* Global Components */}
        <CartDrawer />
        <AuthModal />
        <Toaster position="bottom-right" richColors />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
