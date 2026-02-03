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
              <Route path="products" element={<AdminDashboard />} />
              <Route path="orders" element={<AdminDashboard />} />
              <Route path="customers" element={<AdminDashboard />} />
              <Route path="reviews" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminDashboard />} />
              <Route path="settings" element={<AdminDashboard />} />
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
