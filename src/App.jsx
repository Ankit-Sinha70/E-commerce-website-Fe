import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./component/Footer";
import Navbar from "./component/Navbar";
import ProtectedRoute from "./component/ProtectedRoute";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, lazy, Suspense } from "react";
import { fetchNotifications } from "./features/notification/notificationSlice";
import useSocket from "./lib/socket";
import ContactForm from "./component/ContactForm";

// Lazy-load user pages
const AboutAllFixPage = lazy(() => import("./pages/user/AboutAllFixPage"));
const CartPage = lazy(() => import("./pages/user/CartPage"));
const CheckoutPage = lazy(() => import("./pages/user/CheckoutPage"));
const HomePage = lazy(() => import("./pages/user/HomePage"));
const InvoicePage = lazy(() => import("./pages/user/InvoicePage"));
const LoginPage = lazy(() => import("./pages/user/LoginPage"));
const OrderConfirmation = lazy(() => import("./pages/user/OrderConfirmation"));
const PaymentPage = lazy(() => import("./pages/user/PaymentPage"));
const RegisterPage = lazy(() => import("./pages/user/RegisterPage"));
const WishlistPage = lazy(() => import("./pages/user/WishlistPage"));
const RequestResetPasswordPage = lazy(() => import("./pages/user/RequestResetPasswordPage"));
const SetNewPasswordPage = lazy(() => import("./pages/user/SetNewPasswordPage"));
const ProductDetailsPage = lazy(() => import("./pages/user/ProductDetailsPage"));
const SuccessPage = lazy(() => import("./pages/user/SuccessPage"));
const ErrorPage = lazy(() => import("./pages/user/ErrorPage"));
const ViewProfilePage = lazy(() => import("./pages/user/ViewProfilePage"));
const MyOrdersPage = lazy(() => import("./pages/user/MyOrdersPage"));
const ShippingAddressPage = lazy(() => import("./pages/user/ShippingAddressPage"));
const ChangePasswordPage = lazy(() => import("./pages/user/ChangePasswordPage"));
const NotificationsPage = lazy(() => import("./pages/user/NotificationsPage"));
const CategoryListingPage = lazy(() => import("./pages/user/CategoryListingPage"));
const SubcategoryListingPage = lazy(() => import("./pages/user/SubcategoryListingPage"));
const SubcategoryProductsPage = lazy(() => import("./pages/user/SubcategoryProductsPage"));

// Lazy-load admin pages (you can also apply Suspense to admin routes if needed)
const AnalyticsPage = lazy(() => import("./pages/admin/AnalyticsPage"));
const DashboardHomePage = lazy(() => import("./pages/admin/DashboardHomePage"));
const ManageProductsPage = lazy(() => import("./pages/admin/ManageProductsPage"));
const ManageReturnRequests = lazy(() => import("./pages/admin/ManageReturnRequests"));
const MessagesPage = lazy(() => import("./pages/admin/MessagesPage"));
const OrdersPage = lazy(() => import("./pages/admin/OrdersPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CancelledOrdersPage = lazy(() => import("./pages/admin/CancelledOrdersPage"));
const ManageCategory = lazy(() => import("./pages/admin/ManageCategory"));
const ManageSubcategory = lazy(() => import("./pages/admin/ManageSubcategory"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));

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
      {!isAdminRoute &&
        !isLoginPage &&
        !isRegisterPage &&
        !isRequestResetPasswordPage &&
        !isSetNewPasswordPage &&
        !isCheckoutPage && <Navbar />}

      {user?.role === "admin" ? (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading Admin Panel...</div>}>
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
              <Route path="cancelled-orders" element={<CancelledOrdersPage />} />
              <Route path="manage-products" element={<ManageProductsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="manage-return-requests" element={<ManageReturnRequests />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="manage-categories" element={<ManageCategory />} />
              <Route path="manage-subcategories" element={<ManageSubcategory />} />
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
        </Suspense>
      ) : (
        <div className="flex-1">
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
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
              <Route path="/categories" element={<CategoryListingPage />} />
              <Route path="/c" element={<CategoryListingPage />} />
              <Route path="/c/:categorySlugOrId" element={<SubcategoryListingPage />} />
              <Route path="/c/:categorySlugOrId/s/:subcategorySlugOrId" element={<SubcategoryProductsPage />} />
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
          </Suspense>
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
