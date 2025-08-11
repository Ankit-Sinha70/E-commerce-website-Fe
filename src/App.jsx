import { Toaster } from "@/components/ui/sonner";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./component/Footer";
import Navbar from "./component/Navbar";
import ProtectedRoute from "./component/ProtectedRoute";
import AboutAllFixPage from "./pages/user/AboutAllFixPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import DashboardHomePage from "./pages/admin/DashboardHomePage";
import HomePage from "./pages/user/HomePage";
import InvoicePage from "./pages/user/InvoicePage";
import LoginPage from "./pages/user/LoginPage";
import ManageProductsPage from "./pages/admin/ManageProductsPage";
import ManageReturnRequests from "./pages/admin/ManageReturnRequests";
import MessagesPage from "./pages/admin/MessagesPage";
import OrderConfirmation from "./pages/user/OrderConfirmation";
import OrdersPage from "./pages/admin/OrdersPage";
import PaymentPage from "./pages/user/PaymentPage";
import RegisterPage from "./pages/user/RegisterPage";
import WishlistPage from "./pages/user/WishlistPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageCategory from "./pages/admin/ManageCategory";
import RequestResetPasswordPage from "./pages/user/RequestResetPasswordPage";
import SetNewPasswordPage from "./pages/user/SetNewPasswordPage";
import ProductDetailsPage from "./pages/user/ProductDetailsPage";
import SuccessPage from "./pages/user/SuccessPage";
import ErrorPage from "./pages/user/ErrorPage";
import ViewProfilePage from "./pages/user/ViewProfilePage";
import MyOrdersPage from "./pages/user/MyOrdersPage";
import ShippingAddressPage from "./pages/user/ShippingAddressPage";
import ChangePasswordPage from "./pages/user/ChangePasswordPage";
import ContactForm from "./component/ContactForm";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchNotifications } from "./features/notification/notificationSlice";
import ManageUsers from "./pages/admin/ManageUsers";
import NotificationsPage from "./pages/user/NotificationsPage";
import useSocket from "./lib/socket";

const AppInitializer = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications(user._id));
    }
  }, [dispatch, user]);

  return null;
};

const App = () => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isCartPage = location.pathname === "/cart";
  const isProductDetailsPage = location.pathname.startsWith("/product/");
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isRequestResetPasswordPage = location.pathname === "/forgot-password";
  const isSetNewPasswordPage = location.pathname.startsWith("/reset-password/");
  const isCheckoutPage = location.pathname === "/checkout";
  const isProfileRoute = location.pathname.startsWith("/profile");
  const isWishlistRoute = location.pathname === "/wishlist";

  useSocket(user?._id)

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#111827]">
      <AppInitializer />
      <Toaster richColors position="top-right" />
      {!isAdminRoute &&
        !isLoginPage &&
        !isRegisterPage &&
        !isRequestResetPasswordPage &&
        !isSetNewPasswordPage &&
        !isCheckoutPage && <Navbar />}

      {user?.role === "admin" ? (
        <Routes>
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHomePage />} />
            <Route path="dashboard" element={<DashboardHomePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="manage-products" element={<ManageProductsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="manage-return-requests" element={<ManageReturnRequests />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="manage-categories" element={<ManageCategory />} />
            <Route
              path="manage-users"
              element={
                <div className="p-4">
                  <ManageUsers/>
                </div>
              }
            />
          </Route>
          <Route path="/*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      ) : (
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/forgot-password"
              element={<RequestResetPasswordPage />}
            />
            <Route
              path="/reset-password/:token"
              element={<SetNewPasswordPage />}
            />
            <Route path="/about" element={<AboutAllFixPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/invoice" element={<InvoicePage />} />
            <Route path="/user/notifications" element={<NotificationsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/contactUs" element={<ContactForm />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />

            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<ErrorPage />} />

            <Route
              path="/profile/*"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <Routes>
                    <Route path="view" element={<ViewProfilePage />} />
                    <Route path="orders" element={<MyOrdersPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="shipping" element={<ShippingAddressPage />} />
                    <Route
                      path="change-password"
                      element={<ChangePasswordPage />}
                    />
                    <Route index element={<ViewProfilePage />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            <Route path="/*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      )}

      {!isAdminRoute &&
        !isCartPage &&
        !isProductDetailsPage &&
        !isLoginPage &&
        !isRegisterPage &&
        !isRequestResetPasswordPage &&
        !isSetNewPasswordPage &&
        !isCheckoutPage &&
        !isWishlistRoute &&
        !isProfileRoute && <Footer />}
    </div>
  );
};

export default App;
