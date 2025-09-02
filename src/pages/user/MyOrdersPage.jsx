import PaginationDemo from "@/component/Common/Pagination.jsx";
import ReturnRequest from "@/component/ReturnRequest";
import ReturnRequestModal from "@/component/ReturnRequestModal";
import TrackOrderDialog from "@/component/TrackOrderDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cancelOrder, fetchMyOrders } from "@/features/order/orderSlice";
import { fetchPaymentDetailsByOrderId } from "@/features/payment/paymentSlice";
import { formatCurrency } from "@/lib/currency";
import { capitalizeFirstLetter } from "@/lib/orderUtils";
import { addHours, format } from "date-fns";
import {
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  Eye,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Loader } from "@/component/Common/Loader";

const getStatusClasses = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-amber-700 text-amber-200 border-amber-600";
    case "shipped":
      return "bg-purple-700 text-purple-200 border-purple-600";
    case "processing":
      return "bg-blue-700 text-blue-200 border-blue-600";
    case "delivered":
      return "bg-green-700 text-green-200 border-green-600";
    case "cancelled":
      return "bg-red-700 text-red-200 border-red-600";
    default:
      return "bg-gray-700 text-gray-200 border-gray-600";
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return <Clock className="w-3 h-3 text-amber-200" />;
    case "shipped":
      return <Truck className="w-3 h-3 text-purple-200" />;
    case "processing":
      return <Package className="w-3 h-3 text-blue-200" />;
    case "delivered":
      return <Star className="w-3 h-3 text-green-200" />;
    case "cancelled":
      return <XCircle className="w-3 h-3 text-red-200" />;
    default:
      return <Package className="w-3 h-3 text-gray-200" />;
  }
};

export const OrderItemDetails = ({ item }) => {
  const savings =
    item.originalPrice && item.originalPrice > item.price
      ? item.originalPrice - item.price
      : 0;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="relative flex items-center space-x-4">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={item.image || "https://via.placeholder.com/60"}
            alt={item.name}
            className="w-16 h-16 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-slate-300 mb-1 group-hover:text-blue-400 transition-colors duration-300">
            <Link to={`/product/${item.productId}`} className="hover:underline">
              {item.name}
            </Link>
          </h4>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span className="flex items-center">
              <Package className="w-3 h-3 mr-1" />
              Qty: {item.quantity}
            </span>
            <span className="flex items-center font-medium text-slate-300">
              <CreditCard className="w-3 h-3 mr-1" />
              {formatCurrency(item.price)}
            </span>
          </div>
          {item.originalPrice && savings > 0 && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs text-gray-500 line-through">
                {formatCurrency(item.originalPrice)}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-800 text-green-200">
                Save {formatCurrency(savings)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({
  order,
  onViewDetails,
  onCancelOrder,
  onTrackOrder,
  onReturnClick,
  isReturnEligible,
}) => {
  const orderDate = new Date(order.createdAt);
  const numberOfItems = order.items ? order.items.length : 0;

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(
            order.status
          )}`}
        >
          {getStatusIcon(order.status)}
          <span className="text-slate-300">{order.status}</span>
        </span>
      </div>

      <div className="p-6">
        {/* Order Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-300 truncate pr-4">
              Order #
              {order.orderId?.length > 10
                ? `${order.orderId.slice(0, 10)}...`
                : order.orderId}
            </h3>
          </div>
          <div className="flex items-center text-sm text-slate-400 space-x-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {format(orderDate, "MMM d, yyyy")}
            </span>
            <span className="flex items-center">
              <ShoppingBag className="w-4 h-4 mr-1" />
              {numberOfItems} item{numberOfItems !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Product Preview */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            {order.items[0]?.image && (
              <img
                src={order.items[0].image || "https://via.placeholder.com/48"}
                alt={order.items[0].name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            )}
            <div className="flex-grow">
              <p className="font-medium text-slate-300 truncate">
                {order.items.length > 1 ? (
                  `${order.items[0].name} +${order.items.length - 1} more`
                ) : (
                  <Link
                    to={`/product/${order.items[0].productId}`}
                    className="text-blue-400 hover:underline"
                  >
                    {order.items[0]?.name || "—"}
                  </Link>
                )}
              </p>
              <p className="text-lg font-bold text-slate-300 mt-1">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(order)}
              className="flex-1 min-w-[120px] bg-blue-900 border-blue-700 text-blue-300 hover:bg-blue-800 hover:border-blue-600 hover:text-slate-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </DialogTrigger>

          {order.status?.toLowerCase() === "processing" && (
            <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-900 border-red-700 text-red-300 hover:bg-red-800 hover:border-red-600 hover:text-slate-200"
                  onClick={() => setCancelOpen(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="bg-gray-800 border border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-300">Cancel Order</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Are you sure you want to cancel this order? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCancelOpen(false)} className="text-slate-300">
                    No, keep order
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-900 text-red-300"
                    onClick={async () => {
                      setCancelling(true);
                      try {
                        await onCancelOrder(order._id);
                      } catch (err) {
                        console.log('err', err)
                      } finally {
                        setCancelling(false);
                        setCancelOpen(false);
                      }
                    }}
                  >
                    {cancelling ? "Cancelling..." : "Yes, cancel order"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {order.status?.toLowerCase() === "shipped" && (
            <Button
              variant="outline"
              size="sm"
              className="bg-purple-900 border-purple-700 text-purple-300 hover:bg-purple-800 hover:border-purple-600"
              onClick={() => onTrackOrder(order)}
            >
              <Truck className="w-4 h-4 mr-2" />
              Track
            </Button>
          )}

          {(order.status?.toLowerCase() === "delivered" ||
            order.status?.toLowerCase() === "completed") &&
            isReturnEligible(order.deliveredAt) && (
              <Button
                variant="outline"
                size="sm"
                className="bg-amber-900 border-amber-700 text-amber-300 hover:bg-amber-800 hover:border-amber-600 hover:text-slate-200"
                onClick={() => onReturnClick(order)}
              >
                Return
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};

// My Orders Component
const MyOrdersComponent = () => {
  const dispatch = useDispatch();
  const {
    orders,
    loading,
    myOrdersTotalPages,
    myOrdersLimit,
  } = useSelector((state) => state.order);
  const { user, accessToken } = useSelector((state) => state.auth);
  const {
    paymentDetails,
    loading: paymentLoading,
    error: paymentError,
  } = useSelector((state) => state.payment);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

  // Local page state to avoid effect loops
  const [currentPage, setCurrentPage] = useState(1);

  const isReturnEligible = (deliveredAt) => {
    if (!deliveredAt) return false;
    const deliveredDate = new Date(deliveredAt);
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return now - deliveredDate < twentyFourHours;
  };

  useEffect(() => {
    if (user?._id) {
      dispatch(
        fetchMyOrders({
          userId: user?._id,
          accessToken,
          page: currentPage,
          limit: myOrdersLimit,
        })
      );
    }
  }, [dispatch, user, accessToken, currentPage, myOrdersLimit]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (user?._id) {
      dispatch(
        fetchMyOrders({
          userId: user?._id,
          accessToken,
          page,
          limit: myOrdersLimit,
        })
      );
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
    dispatch(fetchPaymentDetailsByOrderId({ orderId: order._id }));
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      toast.success("Order cancelled successfully!", { className: "toast-success" });
    } catch (err) {
      toast.error(err || "Failed to cancel order", { className: "toast-danger" });
    }
  };

  const handleReturnClick = (order) => {
    // open the return modal for this order
    setSelectedOrderForReturn(order);
    setShowReturnModal(true);
  };

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setTrackDialogOpen(true);
  };

  if (loading) {
    return <Loader message={"Loading Orders..."} />;
  }

  if (orders?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh] bg-gray-800 rounded-2xl border border-gray-700">
        <div className="relative">
          <ShoppingBag className="relative w-24 h-24 text-blue-400 mb-6" />
        </div>
        <h2 className="text-3xl font-bold text-slate-300 mb-2">
          No Orders Found
        </h2>
        <p className="text-slate-400 text-lg mb-6 max-w-md">
          It looks like you haven't placed any orders yet. Start shopping to see
          your orders here!
        </p>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold">
          Start Shopping
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* Mobile and Desktop Order Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {orders?.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onViewDetails={handleViewDetails}
              onCancelOrder={handleCancelOrder}
              onTrackOrder={handleTrackOrder}
              onReturnClick={handleReturnClick}
              isReturnEligible={isReturnEligible}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {myOrdersTotalPages > 1 && (
          <div className="flex items-center justify-center bg-gray-800 p-6 rounded-xl border border-gray-700">
            <PaginationDemo
              currentPage={currentPage}
              totalPages={myOrdersTotalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400">
          {selectedOrder && (
            <>
              <DialogHeader className="border-b border-gray-700 pb-4">
                <DialogTitle className="text-2xl font-bold text-slate-300">
                  Order Details
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Order #{selectedOrder.orderId} • Placed on{" "}
                  {format(
                    new Date(selectedOrder.createdAt),
                    "MMMM d, yyyy 'at' hh:mm a"
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-8">
                {/* Order Status */}
                <div className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusClasses(
                        selectedOrder.status
                      )}`}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      <span className="text-slate-300">{selectedOrder.status}</span>
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-300">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div>
                  <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2 text-blue-400" />
                    Ordered Items
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOrder.items.map((item, index) => (
                      <OrderItemDetails key={index} item={item} />
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                <div>
                  <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-400" />
                    Shipping Information
                  </h3>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Recipient</p>
                        <p className="font-semibold text-slate-300">
                          {selectedOrder?.shippingAddress?.fullName ||
                            "Customer Name"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Phone</p>
                        <p className="font-semibold text-slate-300">
                          {selectedOrder?.shippingAddress?.phoneNumber}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-400 mb-1">Address</p>
                        <p className="font-semibold text-slate-300">
                          {selectedOrder?.shippingAddress?.addressLine},{" "}
                          {selectedOrder?.shippingAddress?.city},{" "}
                          {selectedOrder?.shippingAddress?.state}{" "}
                          {selectedOrder?.shippingAddress?.postalCode},{" "}
                          {selectedOrder?.shippingAddress?.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
                    Payment Details
                  </h3>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    {paymentLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <p className="text-slate-300">Loading payment details...</p>
                      </div>
                    ) : paymentError ? (
                      <p className="text-red-400 font-medium">
                        Error:{" "}
                        {paymentError.message ||
                          "Failed to load payment details."}
                      </p>
                    ) : paymentDetails ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Payment Method
                          </p>
                          <p className="font-semibold text-slate-300">
                            {capitalizeFirstLetter(
                              paymentDetails.paymentMethod
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Status</p>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(
                              paymentDetails.paymentStatus
                            )}`}
                          >
                            {capitalizeFirstLetter(
                              paymentDetails.paymentStatus
                            )}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Transaction ID
                          </p>
                          <p className="font-mono text-sm text-slate-300">
                            {paymentDetails.transactionId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Amount</p>
                          <p className="font-bold text-lg text-slate-300">
                            {formatCurrency(paymentDetails.amount)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400">
                        No payment details available.
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Timeline */}
                <div>
                  <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-400" />
                    Order Timeline
                  </h3>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-semibold text-slate-300">
                            Order Placed
                          </p>
                          <p className="text-sm text-slate-400">
                            {format(
                              new Date(selectedOrder.createdAt),
                              "MMMM d, yyyy 'at' hh:mm a"
                            )}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.shippedAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold text-slate-300">
                              Order Shipped
                            </p>
                            <p className="text-sm text-slate-400">
                              {format(
                                new Date(selectedOrder.shippedAt),
                                "MMMM d, yyyy 'at' hh:mm a"
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOrder.deliveredAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold text-slate-300">
                              Order Delivered
                            </p>
                            <p className="text-sm text-slate-400">
                              {format(
                                new Date(selectedOrder.deliveredAt),
                                "MMMM d, yyyy 'at' hh:mm a"
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOrder.trackingHistory?.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-700">
                          <h4 className="font-semibold mb-3 text-slate-300">
                            Tracking History
                          </h4>
                          <div className="space-y-3">
                            {selectedOrder.trackingHistory
                              .slice()
                              .sort(
                                (a, b) =>
                                  new Date(a.timestamp) - new Date(b.timestamp)
                              )
                              .map((entry, index) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-3"
                                >
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                                  <div>
                                    <p className="font-medium text-slate-300">
                                      {entry.status}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                      {entry.location} •{" "}
                                      {format(
                                        new Date(entry.timestamp),
                                        "MMM d, yyyy 'at' hh:mm a"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="bg-gray-800 p-6 rounded-xl">
                  <h4 className="font-bold text-lg text-slate-300 mb-4">
                    Actions
                  </h4>
                  {(selectedOrder.status?.toLowerCase() === "delivered" ||
                    selectedOrder.status?.toLowerCase() === "completed") &&
                    (isReturnEligible(selectedOrder.deliveredAt) ? (
                      <div className="space-y-3">
                        <Button
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => handleReturnClick(selectedOrder)}
                        >
                          Request a Return
                        </Button>
                        <div className="text-sm text-slate-400">
                          {(() => {
                            if (!selectedOrder.deliveredAt) return null;
                            const deliveryDate = new Date(
                              selectedOrder.deliveredAt
                            );
                            const returnDeadline = addHours(deliveryDate, 24 * 7);
                            return (
                              <div className="bg-green-900 border border-green-700 p-3 rounded-lg">
                                <p>
                                  <strong>Return window open until:</strong>{" "}
                                  {format(returnDeadline, "PPP p")}
                                </p>
                                <p className="mt-1">
                                  Please keep the product in its original
                                  condition for a hassle-free return.
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-900 border border-red-700 p-4 rounded-lg">
                        <p className="text-gray-300 font-medium">
                          The 24-hour return window for this order has closed.
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <DialogFooter className="border-t border-gray-700 pt-4">
                <DialogClose asChild>
                  <Button variant="ghost" className="px-6 text-slate-300 border border-gray-200">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {selectedOrder && (
        <TrackOrderDialog
          isOpen={trackDialogOpen}
          onClose={() => setTrackDialogOpen(false)}
          trackingId={selectedOrder._id}
          estimatedDeliveryDate={selectedOrder.estimatedDeliveryDate}
        />
      )}

      {/* Return request modal — controlled by showReturnModal + selectedOrderForReturn */}
      {selectedOrderForReturn && (
        <ReturnRequestModal
          isOpen={showReturnModal}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedOrderForReturn(null);
          }}
          order={selectedOrderForReturn}
        />
      )}
    </>
  );
};

// Main component with navigation tabs
const MyOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="min-h-screen bg-[#111827] text-slate-300">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-4 mt-16">
          <div className="relative inline-block">
            <h1 className="relative text-3xl md:text-4xl font-bold text-white mb-4 kaushan-script-regular">
              {activeTab === "orders" ? "My Orders" : "Return Requests"}
            </h1>
          </div>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto kaushan-script-regular2">
            {activeTab === "orders"
              ? "Track, manage, and view details of all your orders in one place"
              : "Manage your return requests and track their status"}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4">
          <div className="bg-gray-800 p-2 rounded-2xl shadow-lg border border-gray-700 max-w-md mx-auto">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === "orders"
                    ? "bg-blue-500 text-white shadow-md transform scale-105"
                    : "text-slate-400 hover:text-slate-300 hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Orders</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("returns")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === "returns"
                    ? "bg-purple-500 text-white shadow-md transform scale-105"
                    : "text-slate-400 hover:text-slate-300 hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Returns</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === "orders" && <MyOrdersComponent />}
          {activeTab === "returns" && <ReturnRequest />}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
