import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Home, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { clearCart, clearCartBackend } from "../../features/cart/cartSlice";

export default function SuccessPage() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);
  const guestId = localStorage.getItem("guestId");

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [paymentStatus, setPaymentStatus] = useState("verifying");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get("session_id");

    const verifyAndStoreOrder = async () => {
      if (!sessionId) {
        setPaymentStatus("error");
        toast.error("Invalid payment session or not logged in.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/payment/store-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ sessionId, userId: user?._id, guestId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to store order.");
        }

        const data = await response.json();
        setPaymentStatus("success");
        setOrderId(data.orderId);
        toast.success("Payment successful! Your order has been placed.");
        dispatch(clearCart());
        if (user && accessToken) {
          dispatch(clearCartBackend({ accessToken }));
        }
      } catch (err) {
        console.error("Order verification/storage error:", err);
        setPaymentStatus("error");
        toast.error(err.message || "Failed to confirm your order. Please contact support.");
      }
    };
    verifyAndStoreOrder();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200 p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-xl w-full text-center animate-fade-in">
        {paymentStatus === "verifying" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Confirming Your Order...</h2>
            <p className="text-gray-600">Please wait while we process your payment.</p>
          </>
        )}

        {paymentStatus === "success" && (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-gray-700 text-lg mb-4">
              Thank you for your purchase! Your order has been placed successfully.
            </p>
            {orderId && (
              <p className="text-gray-600 mb-6">
                Your Order ID: <span className="font-semibold">{orderId}</span>
              </p>
            )}
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 rounded-md font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" /> Continue Shopping
              </Link>
              <Link
                to="/profile/orders"
                className="text-blue-700 hover:underline hover:scale-105 transition transform flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> View My Orders
              </Link>
            </div>
          </>
        )}

        {paymentStatus === "error" && (
          <>
            <div className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.26-3.81 3.16-5.882 3.16-1.543 0-2.28-1.745-1.077-2.909l1.5-1.5a1.125 1.125 0 0 1 1.612 0l1.5 1.5a1.125 1.125 0 0 0 1.612 0l1.5-1.5a1.125 1.125 0 0 1 1.612 0l1.5 1.5a1.125 1.125 0 0 0 1.612 0l1.5-1.5a1.125 1.125 0 0 1 1.612 0L21 12.75M12 15.75c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3Z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">Payment Failed!</h2>
            <p className="text-gray-700 text-lg mb-4">
              Unfortunately, your payment could not be processed.
            </p>
            <div className="flex flex-col space-y-3">
              <Link
                to="/cart"
                className="bg-gradient-to-r from-red-500 to-red-700 text-white py-3 px-6 rounded-md font-medium hover:from-red-600 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> Return to Cart
              </Link>
              <Link
                to="/"
                className="text-blue-700 hover:underline hover:scale-105 transition transform flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" /> Go to Homepage
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
