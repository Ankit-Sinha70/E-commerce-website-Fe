import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Trash2,
  Minus,
  Plus,
  Lock,
  ShoppingCart,
  MapPin,
  User,
  Phone,
  CheckCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCartItems,
  removeCartItem,
  removeItem,
  updateItemQuantity,
} from "../../features/cart/cartSlice";
import {
  getShippingAddresses,
  clearShippingAddressError,
  createShippingAddress,
} from "../../features/shippingAddress/shippingAddressSlice";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Loader from "@/component/Common/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddressDialog from "@/component/AddressDialog";
import { formatCurrency } from "@/lib/currency";
import { toast } from "react-toastify";
import LoginRequiredPopup from "@/component/LoginRequiredPopup";

export default function CartPage() {
  const dispatch = useDispatch();
  const { items: cartItems, loading } = useSelector((state) => state.cart);
  const { accessToken, user } = useSelector((state) => state.auth);
  // Access shipping addresses from the store
  const { addresses: shippingAddresses, error: addressError, loading: addressLoading } = useSelector(
    (state) => state.shippingAddress
  );
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const guestId = localStorage.getItem("guestId");
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    if (accessToken && user?._id) {
      setEmail(user.email);
      dispatch(fetchCartItems({ accessToken }));
      dispatch(getShippingAddresses());
    } else {
      // toast.info("Please log in to view your cart items.");
    }
  }, [accessToken, user?._id, dispatch]);

  useEffect(() => {
    if (shippingAddresses && shippingAddresses.length > 0 && !selectedAddress) {
      const defaultAddress = shippingAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else {
        setSelectedAddress(shippingAddresses[0]);
      }
      console.log("Loaded shipping addresses:", shippingAddresses);
      console.log("Selected shipping address (after effect):", selectedAddress);
    }
    // Clear shipping address errors after some time
    if (addressError) {
      const timer = setTimeout(() => {
        dispatch(clearShippingAddressError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shippingAddresses, selectedAddress, dispatch, addressError]);

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      return;
    }
    try {
      dispatch(
        updateItemQuantity({
          productId,
          quantity: newQuantity,
        })
      );

      const actionText = change > 0 ? "increased" : "decreased";
      const updatedItem = cartItems.find(
        (item) => item.productId._id === productId
      );
      toast.success(
        `Quantity ${actionText} for ${updatedItem?.productId?.name || "item"}.`,{
          className: "toast-success"
        }
      );
    } catch (err) {
      toast.error("An unexpected error occurred while updating quantity.", {
        className: "toast-danger",
      });
      console.error("Unexpected error in handleQuantityChange:", err);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (guestId && !user) {
      dispatch(removeItem(productId));
      return;
    }
    if (!user || !accessToken) {
      toast.error("Please log in to remove cart items.", {
        className: "toast-danger",
      });
      return;
    }
    try {
      const resultAction = await dispatch(
        removeCartItem({ productId, accessToken, userId: user._id })
      );

      if (removeCartItem.fulfilled.match(resultAction)) {
        toast.success(
          resultAction.payload.message || "Item removed from cart!",
          {
            className: "toast-success",
            icon: <CheckCircle className="w-4 h-4" />,
            style: {
              borderRadius: "8px",
              background: "#1F2937",
              color: "#fff",
            },
          }
        );
        dispatch(fetchCartItems({ accessToken }));
      } else if (removeCartItem.rejected.match(resultAction)) {
        const errorMessage =
          resultAction.payload ||
          resultAction.error.message ||
          "Failed to remove item.";
        toast.error(`Error: ${errorMessage}`, {
          className: "toast-danger",
        });
        console.error("Failed to remove from cart:", errorMessage);
      }
    } catch (err) {
      toast.error("An unexpected error occurred while removing item.", {
        className: "toast-danger",
      });
      console.error("Unexpected error in handleRemoveItem:", err);
    }
  };

  const subtotal = cartItems?.reduce(
    (acc, item) => acc + item?.productId?.price * item?.quantity,
    0
  );
  const totalItems = cartItems?.reduce((acc, item) => acc + item?.quantity, 0);
  const tax = subtotal * 0.08;
  const shippingCost = 50;
  const total = subtotal + tax + shippingCost;

  const handleAddAddress = async (address) => {
    try {
      if (user && accessToken) {
        const result = await dispatch(createShippingAddress(address));
        const created = result?.payload?.address;
        if (created) {
          setSelectedAddress(created);
        }
      } else {
        // Guest checkout: just set locally
        setSelectedAddress(address);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      toast.error("Failed to save address. Please try again.", { className: "toast-danger" });
    } finally {
      setShowAddAddress(false);
    }
  };

  const handleCheckout = async () => {
    if (!accessToken || !user) {
      setShowLoginPopup(true);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.info("Your cart is empty. Add items before checking out.", {
        className: "toast-info",
      });
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a shipping address to proceed.", {
        className: "toast-danger",
      });
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

      const shippingAddressForCheckout = {
        fullName: selectedAddress.fullName,
        phoneNumber: selectedAddress.phoneNumber,
        addressLine: selectedAddress.addressLine,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
        type: selectedAddress.type,
        isDefault: selectedAddress.isDefault,
      };

      const formData = {
        userId: user?._id || null,
        guestId,
        isGuest: !!guestId,
        email,
        totalAmount: total,
        items: itemsForCheckout,
        shippingAddress: shippingAddressForCheckout,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );
      console.log("response", response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create checkout session."
        );
      }

      const data = await response.json();
      // Redirect to Stripe checkout page
      window.location.href = data.url;
    } catch (err) {
      toast.error(
        err.message || "Failed to initiate checkout. Please try again.",
        {
          className: "toast-danger",
        }
      );
      console.error("Checkout error:", err);
    }
  };

  if (loading && (!cartItems || cartItems.length === 0)) {
    return <Loader message={"Loading Cart Items and Addresses..."} />;
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a]">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-xl text-gray-300 mb-4">Your cart is empty.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Start shopping!
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div
              className="flex items-center justify-between mb-8 p-4 rounded-lg border border-blue-500"
              style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 18px 50px -10px" }}
            >
              <div className="flex items-center gap-3">
                <ChevronLeft className="w-5 h-5 text-gray-300" />
                <h1 className="text-2xl font-medium text-gray-300">
                  Your Cart
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>Items :-</span>
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                  {totalItems}
                </span>
              </div>
            </div>

            {/* Product Cards */}
            {cartItems.map((item) => (
              <div
                key={item?.productId?._id}
                className="bg-[#0f172a] rounded-lg shadow-sm p-6 mb-6 border border-blue-500"
                style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 18px 50px -10px" }}
              >
                <div className="flex items-center gap-4">
                  {/* Product Image with Badge */}
                  <div className="relative">
                    <img
                      src={
                        item?.productId?.image ||
                        "https://via.placeholder.com/100x75?text=No+Image"
                      }
                      alt={item?.productId?.name}
                      className="w-34 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-300 mb-2">
                      {item?.productId?.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-slate-300">
                        {formatCurrency(item?.productId?.price)}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 text-slate-300">
                      <Button
                        variant="ghost"
                        className="cursor-pointer"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId._id,
                            item.quantity,
                            -1
                          )
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-medium text-gray-300">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        className="cursor-pointer"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId._id,
                            item.quantity,
                            1
                          )
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Right Side - Delete and Subtotal */}
                  <div className="flex flex-col items-end justify-between h-20">
                    <button
                      className="text-gray-400 hover:text-red-500 p-1"
                      onClick={() => handleRemoveItem(item.productId._id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Subtotal</div>
                      <div className="text-xl font-bold text-gray-300">
                        {formatCurrency(
                          item?.productId?.price * item?.quantity
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Recommendations Section */}
            <div
              className="bg-[#0f172a] border border-blue-500 rounded-lg shadow-sm p-6"
              style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 18px 50px -10px" }}
            >
              <h3 className="text-lg font-medium text-gray-300 mb-6">
                You might also like
              </h3>
              <div className="grid grid-cols-4 gap-6">
                {/* Phone Case */}
                <div className="text-center">
                  <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1601593346740-925612772716?w=100&h=96&fit=crop"
                      alt="Phone Case"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">
                    Phone Case
                  </h4>
                  <p className="text-sm font-semibold text-gray-300">
                    {formatCurrency(24.99)}
                  </p>
                </div>

                {/* Bluetooth Speaker */}
                <div className="text-center">
                  <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=96&fit=crop"
                      alt="Bluetooth Speaker"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">
                    Bluetooth Speaker
                  </h4>
                  <p className="text-sm font-semibold text-gray-300">
                    {" "}
                    {formatCurrency(89.99)}
                  </p>
                </div>

                {/* Laptop Stand */}
                <div className="text-center">
                  <div className="w-full h-24 bg-gray-300 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=96&fit=crop"
                      alt="Laptop Stand"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">
                    Laptop Stand
                  </h4>
                  <p className="text-sm font-semibold text-gray-300">
                    {" "}
                    {formatCurrency(49.99)}
                  </p>
                </div>

                {/* USB Cable */}
                <div className="text-center">
                  <div className="w-full h-24 bg-gray-300 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=96&fit=crop"
                      alt="USB Cable"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">
                    USB Cable
                  </h4>
                  <p className="text-sm font-semibold text-gray-300">
                    {" "}
                    {formatCurrency(14.99)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-96 flex-shrink-0">
            <div
              className="bg-[#0f172a] border border-blue-500 rounded-lg shadow-sm p-6 sticky top-8"
              style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 18px 50px -10px" }}
            >
              <h2 className="text-lg font-semibold text-gray-300 mb-6">
                Order Summary
              </h2>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-semibold text-gray-300">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Shipping</span>
                  <span className="font-semibold text-gray-300">
                    {formatCurrency(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tax</span>
                  <span className="font-semibold text-gray-300">
                    {formatCurrency(tax)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-300">
                      Total
                    </span>
                    <span className="text-xl font-bold text-gray-300">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`mb-6 ${guestId && !user ? "block" : "hidden"}`}>
                <h3 className="text-md font-semibold text-gray-300 mb-3 flex items-center">
                  Email
                </h3>
                {guestId && !user && (
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border text-gray-300 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                )}
              </div>

              {/* Shipping Address Selection */}
              <div className="mb-6 bg-[#0f172a]">
                <h3 className="text-md font-semibold text-gray-300 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-300" />
                  Delivery Address
                </h3>
                {guestId && !user && (
                  <Button onClick={() => setShowAddAddress(true)}>
                    {selectedAddress
                      ? "Edit Shipping Address"
                      : "Add Shipping Address"}
                  </Button>
                )}

                <AddressDialog
                  isOpen={showAddAddress}
                  onClose={() => {
                    setShowAddAddress(false);
                  }}
                  onSubmit={handleAddAddress}
                  initialData={selectedAddress}
                  isLoading={addressLoading}
                  showDefaultOption={!!user}
                />

                {user &&
                  (shippingAddresses && shippingAddresses.length > 0 ? (
                    <Select
                      onValueChange={(addressId) => {
                        const addr = shippingAddresses.find(
                          (a) => a._id === addressId
                        );
                        setSelectedAddress(addr);
                      }}
                      value={selectedAddress?._id || ""}
                    >
                      <SelectTrigger className="w-full [&>span]:line-clamp-1 text-gray-300">
                        <SelectValue placeholder="Select a shipping address" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingAddresses.map((address) => (
                          <SelectItem key={address._id} value={address._id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {address.fullName} ({address.type}
                                {address.isDefault ? " - Default" : ""})
                              </span>
                              <span className="text-xs text-gray-300">
                                {address.addressLine}, {address.city}, {""}
                                {address.state} {address.postalCode}, {""}
                                {address.country}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-300">No shipping addresses found.</p>
                      <Button onClick={() => setShowAddAddress(true)}>Add Address</Button>
                    </div>
                  ))}
                {selectedAddress && (
                  <div className="mt-4 p-4 border bg-[#0f172a] border-gray-200 rounded-md text-sm text-gray-300">
                    <p className="flex items-center mb-1">
                      <User className="h-4 w-4 mr-2 text-gray-300" />
                      {selectedAddress.fullName}
                    </p>
                    <p className="flex items-center mb-1">
                      <Phone className="h-4 w-4 mr-2 text-gray-300" />
                      {selectedAddress.phoneNumber}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-300" />
                      {selectedAddress.addressLine}, {selectedAddress.city}, {""}
                      {selectedAddress.state} {selectedAddress.postalCode}, {""}
                      {selectedAddress.country}
                    </p>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border text-gray-300 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button className="px-4 py-2 text-gray-300 border border-gray-300 rounded-md hover:bg-gray-500 text-sm font-medium">
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-4"
                disabled={!selectedAddress || !email}
              >
                Proceed to Checkout
                <span className="text-lg">→</span>
              </Button>

              <LoginRequiredPopup
                isOpen={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
              />

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-6">
                <Lock className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>

              {/* Payment Methods */}
              <div className="cursor-pointer mb-4">
                <p className="text-sm text-gray-300 mb-3">We accept</p>
                <div className="flex gap-2">
                  <div className="px-3 hover:bg-gray-500 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    VISA
                  </div>
                  <div className="px-3 hover:bg-gray-500 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    MC
                  </div>
                  <div className="px-3 hover:bg-gray-500 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    AMEX
                  </div>
                  <div className="px-3 hover:bg-gray-500 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    PP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
