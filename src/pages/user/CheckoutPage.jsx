import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const CheckoutPage = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const { accessToken } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Please log in to proceed to checkout.", { className: "toast-danger" });
      return;
    }
    Swal.fire(
      "Order Confirmed",
      "You will be redirected to payment.",
      "success"
    ).then(() => (window.location.href = "/order-confirmation"));

    if (!cartItems || cartItems.length === 0) {
      toast.info("Your cart is empty. Add items before checking out.", { className: "toast-info" });
      return;
    }

    try {
      const itemsForCheckout = cartItems.map((item) => ({
        name: item?.productId?.name,
        price: item?.productId?.price,
        image: item?.productId?.image,
        category: { name: item?.productId?.category?.name || "Uncategorized" },
        productId: item?.productId?._id,
        originalPrice: item?.productId?.originalPrice || item?.productId?.price,
        quantity: item?.quantity,
      }));

      const response = await fetch(
        `${API_BASE_URL}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ items: itemsForCheckout }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create checkout session."
        );
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      toast.error(
        err.message || "Failed to initiate checkout. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Right - Info */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-10 flex flex-col justify-center items-center space-y-4">
          <h3 className="text-3xl font-bold text-center">
            Secure & Fast Checkout
          </h3>
          <p className="text-lg text-center">
            We ensure your order and payment details are fully encrypted and
            safe with us.
          </p>
          <img
            src="https://cdn-icons-png.flaticon.com/512/891/891462.png"
            alt="Secure Payment"
            className="w-24 h-24 opacity-90"
          />
        </div>
        {/* Left - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 space-y-6">
          <h2 className="text-3xl font-bold text-blue-700 text-center mb-4">
            Checkout
          </h2>
          <form onSubmit={handleCheckout} className="space-y-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Phone Number"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Email Address"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="Shipping Address"
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Order Notes (optional)"
              rows="2"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transition duration-300"
            >
              Place Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
