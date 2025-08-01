import Loader from "@/component/common/Loader";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cancelOrder,
  fetchMyOrders,
} from "@/features/order/orderSlice";
import { fetchPaymentDetailsByOrderId } from "@/features/payment/paymentSlice";
import { format, addDays, isBefore } from "date-fns";
import { Eye, Package, RotateCcw, Truck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import TrackOrderDialog from "@/component/TrackOrderDialog";
import ReturnRequestModal from "@/component/ReturnRequestModal";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import ReturnRequest from "@/component/ReturnRequest";
import { capitalizeFirstLetter } from "@/lib/orderUtils";

// export const capitalizeFirstLetter = (string) => {
//   if (!string) return "";
//   return string.charAt(0).toUpperCase() + string.slice(1);
// };

const getStatusClasses = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-200 text-yellow-800";
    case "shipped":
      return "bg-purple-200 text-purple-800";
    case "processing":
      return "bg-blue-200 text-blue-800";
    case "delivered":
      return "bg-green-200 text-green-800";
    case "cancelled":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

export const OrderItemDetails = ({ item }) => {
  const savings =
    item.originalPrice && item.originalPrice > item.price
      ? item.originalPrice - item.price
      : 0;

  return (
    <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg shadow-sm">
      <img
        src={item.image || "https://via.placeholder.com/60"}
        alt={item.name}
        className="w-16 h-16 object-cover rounded-md"
      />
      <div className="flex-grow">
        <h4 className="font-semibold text-gray-800">{item.name}</h4>
        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
        <p className="text-sm text-gray-600">
          Price: {formatCurrency(item.price)}
        </p>
        {item.originalPrice && (
          <p className="text-xs text-gray-500">
            Original:{" "}
            <span className="line-through">
              {formatCurrency(item.originalPrice)}
            </span>
            {savings > 0 && (
              <span className="ml-1 text-green-600 font-medium">
                ({formatCurrency(savings)} Savings)
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

const MyOrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, cancelLoading, cancelError } = useSelector(
    (state) => state.order
  );
  const { user, accessToken } = useSelector((state) => state.auth);
  const { paymentDetails, loading: paymentLoading, error: paymentError } = useSelector((state) => state.payment);
  console.log('paymentDetails', paymentDetails)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  console.log('selectedOrder', selectedOrder)
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [isReturnModalOpen, setReturnModalOpen] = useState(false);

  const isReturnEligible = (deliveredAt) => {
    if (!deliveredAt) return false;
    const deliveredDate = new Date(deliveredAt);
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return now - deliveredDate < twentyFourHours;
  };

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchMyOrders({ userId: user?._id, accessToken }));
    }
  }, [dispatch, user, accessToken]);

  const handleViewDetails = (order) => {
    console.log('order', order)
    setSelectedOrder(order);
    setIsDialogOpen(true);
    dispatch(fetchPaymentDetailsByOrderId({ orderId: order._id }));
  };

  const handleCancelOrder = async () => {
    if (selectedOrderId) {
      try {
        await dispatch(cancelOrder(selectedOrderId)).unwrap();
        toast.success("Order cancelled successfully!");
      } catch (err) {
        toast.error(err || "Failed to cancel order");
      }
      setSelectedOrderId(null);
    }
  };

  const handleReturnClick = (order) => {
    setSelectedOrder(order);
    setReturnModalOpen(true);
  };


  if (loading) {
    return <Loader message={"Loading Orders..."} />;
  }

  if (orders?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh] bg-gray-50">
        <Package className="w-16 h-16 text-blue-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">No Orders Found</h2>
        <p className="text-gray-500 mt-2">
          It looks like you haven't placed any orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mt-10 mb-6">
          Your Order History
        </h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="rounded-lg overflow-hidden shadow-md bg-white">
            <div className="overflow-x-auto">
              <Table className="min-w-full divide-y divide-gray-200">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Order ID
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Name
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </TableHead>
                    <TableHead className="px-4 py-3 text-middle text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-middle text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Items
                    </TableHead>
                    <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-100">
                  {orders?.map((order) => {
                    const orderDate = new Date(order.createdAt);
                    const numberOfItems = order.items ? order.items.length : 0;

                    return (
                      <TableRow
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="px-4 py-3 font-mono text-sm text-gray-700">
                          {order.orderId}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-mono text-sm text-gray-700">
                          {order.items.length > 1
                            ? `${order.items[0].name},...`
                            : order.items[0]?.name || "—"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600 text-left">
                          {format(orderDate, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-middle">
                          <span
                            className={`px-2 py-1 text-black rounded-full text-xs font-semibold ${getStatusClasses(
                              order.status
                            )}`}
                          >
                            {order?.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-middle text-sm font-medium text-gray-800">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-sm text-gray-600">
                          {numberOfItems}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex flex-wrap gap-2 justify-end">
                            <DialogTrigger asChild>
                              <button
                                onClick={() => handleViewDetails(order)}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Details
                              </button>
                            </DialogTrigger>

                            {order.status?.toLowerCase() === "processing" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                                    onClick={() =>
                                      setSelectedOrderId(order._id)
                                    }
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Cancel
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Cancel Order
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this
                                      order? This action cannot be undone.
                                    </AlertDialogDescription>
                                    {cancelError && (
                                      <div className="text-red-500 text-sm">
                                        {cancelError}
                                      </div>
                                    )}
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() => setSelectedOrderId(null)}
                                    >
                                      No, keep order
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      disabled={cancelLoading}
                                      onClick={handleCancelOrder}
                                    >
                                      {cancelLoading
                                        ? "Cancelling..."
                                        : "Yes, cancel order"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {order.status?.toLowerCase() === "shipped" && (
                              <button
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setTrackDialogOpen(true);
                                }}
                              >
                                <Truck className="w-3 h-3 mr-1" />
                                Track
                              </button>
                            )}

                            {/* {(order.status?.toLowerCase() === "delivered" ||
                              order.status?.toLowerCase() === "completed") && (
                              <button
                                className="inline-flex items-center px-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                                onClick={() =>
                                  alert(`Reordering Order ID: ${order._id}`)
                                }
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reorder
                              </button>
                            )} */}
                            {(order.status?.toLowerCase() === "delivered" ||
                              order.status?.toLowerCase() === "completed") && (
                                isReturnEligible(order.deliveredAt) ? (
                                  <button
                                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md"
                                    onClick={() => handleReturnClick(order)}
                                  >
                                    Return
                                  </button>
                                ) : (
                                  <p className="text-xs text-red-500 mt-2 font-semibold">
                                    The 24-hour return window for this item has closed.
                                  </p>
                                )
                              )}
                            {/* {order.returnRequest?.isRequested && (
                              <p>Return Status: {order.returnRequest.status}</p>
                            )} */}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogContent className="sm:max-w-[800px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    Order Details: {selectedOrder._id?.substring(0, 25)}
                  </DialogTitle>
                  <DialogDescription>
                    Details of your order placed on{" "}
                    {format(
                      new Date(selectedOrder.createdAt),
                      "MMMM d, yyyy 'at' hh:mm a"
                    )}
                    .
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Ordered Items
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedOrder.items.map((item, index) => (
                        <OrderItemDetails key={index} item={item} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Shipping Information
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <p className="text-gray-700">
                        <strong>Recipient:</strong>{" "}
                        {selectedOrder?.shippingAddress?.fullName || "Customer Name"}
                      </p>
                      <p className="text-gray-700">
                        <strong>Address:</strong>{" "}
                        {selectedOrder?.shippingAddress?.addressLine}
                      </p>
                      <p className="text-gray-700">
                        <strong>Phone:</strong>{" "}
                        {selectedOrder?.shippingAddress?.phoneNumber}
                      </p>
                      <p className="text-gray-700">
                        <strong>City:</strong> {selectedOrder?.shippingAddress?.city}
                      </p>
                      <p className="text-gray-700">
                        <strong>Postal Code:</strong>{" "}
                        {selectedOrder?.shippingAddress?.postalCode}
                      </p>
                      <p className="text-gray-700">
                        <strong>State</strong> {selectedOrder?.shippingAddress?.state}
                      </p>
                      <p className="text-gray-700">
                        <strong>Country</strong>{" "}
                        {selectedOrder?.shippingAddress?.country}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Payment Details
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      {paymentLoading ? (
                        <p>Loading payment details...</p>
                      ) : paymentError ? (
                        <p className="text-red-500">
                          Error:{" "}
                          {paymentError.message ||
                            "Failed to load payment details."}
                        </p>
                      ) : paymentDetails ? (
                        <>
                          <p className="text-gray-700">
                            <strong>Payment Method:</strong>{" "}
                            {capitalizeFirstLetter(
                              paymentDetails.paymentMethod
                            )}
                          </p>
                          <p className="text-gray-700">
                            <strong>Payment Status:</strong>{" "}
                            <span
                              className={`px-2 py-1 text-black rounded-full text-xs font-semibold {getStatusClasses(
                                paymentDetails.paymentStatus
                              )}`}
                            >
                              {capitalizeFirstLetter(
                                paymentDetails.paymentStatus
                              )}
                            </span>
                          </p>
                          <p className="text-gray-700">
                            <strong>Transaction ID:</strong>{" "}
                            {paymentDetails.transactionId}
                          </p>
                          <p className="text-gray-700">
                            <strong>Amount:</strong>{" "}
                            {formatCurrency(paymentDetails.amount)}
                          </p>
                        </>
                      ) : (
                        <p>No payment details available.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Order Timeline
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>
                          <span className="font-medium">Order Placed:</span>{" "}
                          {format(
                            new Date(selectedOrder.createdAt),
                            "MMMM d, yyyy 'at' hh:mm a"
                          )}
                        </li>

                        {selectedOrder.shippedAt && (
                          <li>
                            <span className="font-medium">Order Shipped:</span>{" "}
                            {format(
                              new Date(selectedOrder.shippedAt),
                              "MMMM d, yyyy 'at' hh:mm a"
                            )}
                          </li>
                        )}

                        {selectedOrder.deliveredAt && (
                          <li>
                            <span className="font-medium">
                              Order Delivered:
                            </span>{" "}
                            {format(
                              new Date(selectedOrder.deliveredAt),
                              "MMMM d, yyyy 'at' hh:mm a"
                            )}
                          </li>
                        )}

                        {selectedOrder.trackingHistory?.length > 0 && (
                          <>
                            <hr className="my-3" />
                            <h4 className="font-semibold mb-2">
                              Tracking History
                            </h4>
                            <div className="relative border-l-2 border-gray-300 ml-2 pl-4 space-y-4">
                              {selectedOrder.trackingHistory
                                .slice()
                                .sort(
                                  (a, b) =>
                                    new Date(a.timestamp) -
                                    new Date(b.timestamp)
                                )
                                .map((entry, index) => (
                                  <div key={index} className="relative">
                                    <div className="absolute -left-4 top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow" />
                                    <div className="text-sm text-gray-700">
                                      <p className="font-medium">
                                        {entry.status}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {entry.location} –{" "}
                                        {format(
                                          new Date(entry.timestamp),
                                          "MMMM d, yyyy 'at' hh:mm a"
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Actions Section */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-3 text-lg">Actions</h4>
                  {/* Return Request Logic */}
                  {selectedOrder.status?.toLowerCase() === "delivered" || selectedOrder.status?.toLowerCase() === "completed" && (
                    isReturnEligible(selectedOrder.deliveredAt) ? (
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => handleReturnClick(selectedOrder)}
                      >
                        Request a Return
                      </Button>
                    ) : (
                      <div className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-md">
                        The 24-hour return window for this item has closed.
                      </div>
                    )
                  )}
                  {(selectedOrder.status?.toLowerCase() === "delivered" || selectedOrder.status?.toLowerCase() === "completed") && (
                    <div className="mt-2 text-xs text-gray-500">
                      {(() => {
                        const deliveryDate = new Date(selectedOrder.deliveredAt);
                        const returnDeadline = addDays(deliveryDate, 7);
                        if (isBefore(new Date(), returnDeadline)) {
                          return (
                            <div>
                              <p>Return window open until: <span className="font-semibold text-gray-700">{format(returnDeadline, 'PPP p')}</span></p>
                              <p className="mt-1"> Note: Please keep the product in its original condition for a hassle-free return.</p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">
                      Close
                    </button>
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
        {selectedOrder && (
          <ReturnRequestModal
            isOpen={isReturnModalOpen}
            onClose={() => setReturnModalOpen(false)}
            order={selectedOrder}
          />
        )}
      </div>
      <ReturnRequest />
    </div>
  );
};

export default MyOrdersPage;
