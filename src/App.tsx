import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { BellIcon, FileTextIcon, LayersIcon, LayoutDashboardIcon, LifeBuoyIcon, ReceiptIcon, WalletIcon } from "lucide-react";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import { PlatformProvider } from "./contexts/PlatformContext";
import { FinanceProvider } from "./contexts/FinanceContext";
import { EngagementProvider } from "./contexts/EngagementContext";
import { CmsProvider } from "./contexts/CmsContext";
import { CartProvider } from "./contexts/CartContext";
import { RequireAuth } from "./components/RequireAuth";
import { StoreLayout } from "./components/store/StoreLayout";
import { DashboardShell, type ShellNavItem } from "./components/dashboard/DashboardShell";
import { VendorShell } from "./components/dashboard/VendorShell";
import { Home } from "./pages/Home";
import { Browse } from "./pages/Browse";
import { ProductDetail } from "./pages/ProductDetail";
import { ServiceDetail } from "./pages/ServiceDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import { Account } from "./pages/Account";
import { Notifications } from "./pages/Notifications";
import { Support } from "./pages/Support";
import { HelpPage } from "./pages/HelpPage";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { VendorOnboarding } from "./pages/sell/VendorOnboarding";
import { VendorOverview } from "./pages/vendor/VendorOverview";
import { VendorProducts } from "./pages/vendor/VendorProducts";
import { VendorShipping } from "./pages/vendor/VendorShipping";
import { VendorOrders } from "./pages/vendor/VendorOrders";
import { VendorCalendar } from "./pages/vendor/VendorCalendar";
import { VendorPayouts } from "./pages/vendor/VendorPayouts";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminPlans } from "./pages/admin/AdminPlans";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminFinance } from "./pages/admin/AdminFinance";
import { AdminSupport } from "./pages/admin/AdminSupport";
import { AdminCms } from "./pages/admin/AdminCms";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { installPwaMetadata } from "./utils/pwa";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

const adminNav: ShellNavItem[] = [
{ to: "/admin", label: "Operations", icon: LayoutDashboardIcon, end: true },
{ to: "/admin/finance", label: "Finance", icon: WalletIcon },
{ to: "/admin/plans", label: "Plans & pricing", icon: ReceiptIcon },
{ to: "/admin/categories", label: "Categories", icon: LayersIcon },
{ to: "/admin/support", label: "Support", icon: LifeBuoyIcon },
{ to: "/admin/cms", label: "Content", icon: FileTextIcon },
{ to: "/admin/notifications", label: "Notifications", icon: BellIcon, badge: "notifications" }];


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

/** App-wide safety net: a crash in a header, layout or guard no longer blanks the app until refresh. */
function AppBoundary({ children }: {children: React.ReactNode;}) {
  const location = useLocation();
  return <RouteErrorBoundary resetKey={location.key}>{children}</RouteErrorBoundary>;
}

/** Removes any service worker / cache left by an earlier build, which can serve stale pages until a hard refresh. */
function clearStaleServiceWorkers() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => undefined);
  }
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => undefined);
  }
}

const authed = (el: React.ReactNode) => <RequireAuth>{el}</RequireAuth>;

export function App() {
  useEffect(() => {
    clearStaleServiceWorkers();
    installPwaMetadata();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CustomerProvider>
          <PlatformProvider>
            <FinanceProvider>
              <EngagementProvider>
                <CmsProvider>
                  <CartProvider>
                    <BrowserRouter>
                      <ScrollToTop />
                      <AppBoundary>
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route element={<StoreLayout />}>
                          <Route path="/" element={<Home />} />
                          <Route path="/browse" element={<Browse />} />
                          <Route path="/c/:slug" element={<Browse />} />
                          <Route path="/p/:slug" element={<ProductDetail />} />
                          <Route path="/s/:slug" element={<ServiceDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/help" element={<HelpPage />} />
                          <Route path="/help/:slug" element={<HelpPage />} />
                          <Route path="/checkout" element={authed(<Checkout />)} />
                          <Route path="/order/:id" element={authed(<OrderConfirmation />)} />
                          <Route path="/account" element={authed(<Account />)} />
                          <Route path="/notifications" element={authed(<Notifications />)} />
                          <Route path="/support" element={authed(<Support />)} />
                          <Route path="/sell" element={authed(<VendorOnboarding />)} />
                          <Route path="*" element={<Home />} />
                        </Route>
                        <Route path="/vendor" element={<RequireAuth roles={["vendor"]}><VendorShell /></RequireAuth>}>
                          <Route index element={<VendorOverview />} />
                          <Route path="orders" element={<VendorOrders />} />
                          <Route path="products" element={<VendorProducts />} />
                          <Route path="shipping" element={<VendorShipping />} />
                          <Route path="calendar" element={<VendorCalendar />} />
                          <Route path="payouts" element={<VendorPayouts />} />
                          <Route path="notifications" element={<Notifications />} />
                          <Route path="support" element={<Support />} />
                        </Route>
                        <Route path="/admin" element={<RequireAuth roles={["admin"]}><DashboardShell portal="Admin" nav={adminNav} /></RequireAuth>}>
                          <Route index element={<AdminOverview />} />
                          <Route path="finance" element={<AdminFinance />} />
                          <Route path="plans" element={<AdminPlans />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="support" element={<AdminSupport />} />
                          <Route path="cms" element={<AdminCms />} />
                          <Route path="notifications" element={<Notifications />} />
                        </Route>
                      </Routes>
                      </AppBoundary>
                    </BrowserRouter>
                    <Toaster position="top-center" richColors />
                  </CartProvider>
                </CmsProvider>
              </EngagementProvider>
            </FinanceProvider>
          </PlatformProvider>
        </CustomerProvider>
      </AuthProvider>
    </QueryClientProvider>);

}