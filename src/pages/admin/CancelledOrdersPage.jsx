import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/currency";
import {
  Eye,
  Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  getCancelledOrders,
  initiateRefund,
  setCurrentPage,
} from "../../features/order/cancelledOrderSlice";
import PaginationDemo from "../../component/Common/Pagination.jsx";

const CancelledOrdersPage = () => {
  const dispatch = useDispatch();
  const {
    orders,
    loading,
    pagination: { currentPage, totalPages, totalItems, itemsPerPage },
  } = useSelector((state) => state.cancelledOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const subtotal =
    selectedOrder?.items?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ) || 0;
  const shippingCost = subtotal < 50 ? 20 : 0;
  const total = subtotal + shippingCost;
  console.log("selectedOrder", selectedOrder);

  // View handler with toast
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    toast.info("Order details opened");
  };

  useEffect(() => {
    const load = async () => {
      const result = await dispatch(
        getCancelledOrders({ page: currentPage, limit: itemsPerPage })
      );
      if (getCancelledOrders.fulfilled.match(result)) {
        const payload = result.payload ?? [];
        if (!payload || payload.length === 0) {
          toast.info("No cancelled orders found", { className: "toast-info" });
        } else {
          toast.success("Cancelled orders loaded", {
            className: "toast-success",
          });
        }
      } else {
        toast.error(result.payload?.message || "Failed to fetch cancelled orders", {
          className: "toast-error",
        });
      }
    };
    load();
  }, [dispatch, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  const handleInitiateRefund = async(orderId) => {
    const result = await dispatch(initiateRefund(orderId));
    if (initiateRefund.fulfilled.match(result)) {
      toast.success("Refund initiated successfully!", {
        className: "toast-success",
      });
    } else {
      toast.error("Failed to initiate refund.", {
        className: "toast-error",
      });
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-[#0f172a] text-slate-300 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-2xl font-bold text-white">
          Cancelled Orders
        </h1>
        {totalItems > 0 && (
          <div className="text-sm text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            orders
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 mb-6"></div>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-gray-800 border border-gray-700 rounded-lg shadow-md overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Order ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {order.user?.name || "Guest"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {order.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 border-gray-700"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Items</p>
                        </TooltipContent>
                      </Tooltip>
                      <Button
                        onClick={() => handleInitiateRefund(order._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                        disabled={
                          loading ||
                          order.refundStatus === "Initiated" ||
                          order.refundStatus === "Succeeded"
                        }
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : order.refundStatus === "Initiated" ? (
                          "Initiated"
                        ) : order.refundStatus === "Succeeded" ? (
                          "Refunded"
                        ) : (
                          "Initiate Refund"
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  No cancelled orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-slate-300">
                    Order #{order.orderId}
                  </p>
                  <p className="text-sm text-slate-400">
                    {order.user?.name || "Guest"}
                  </p>
                  <p className="text-sm text-slate-400">{order.email}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-700 text-slate-300"
                    onClick={() => handleViewOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleInitiateRefund(order._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-sm"
                    disabled={
                      loading ||
                      order.refundStatus === "Initiated" ||
                      order.refundStatus === "Succeeded"
                    }
                  >
                    {loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : order.refundStatus === "Initiated" ? (
                      "Initiated"
                    ) : order.refundStatus === "Succeeded" ? (
                      "Refunded"
                    ) : (
                      "Refund"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : !loading && orders.length === 0 ? (
          <div className="text-center p-4 text-gray-400">
            No cancelled orders found
          </div>
        ) : (
          <div className="text-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <PaginationDemo
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl bg-gray-800 border border-gray-700 text-slate-300">
          <DialogHeader>
            <DialogTitle className="text-white">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-slate-300">Order ID</h3>
                  <p className="text-slate-400">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Order Date</h3>
                  <p className="text-slate-400">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Customer</h3>
                  <p className="text-slate-400">
                    {selectedOrder.user?.name || "Guest"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Email</h3>
                  <p className="text-slate-400">{selectedOrder.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Phone</h3>
                  <p className="text-slate-400">
                    {selectedOrder.user?.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Status</h3>
                  <p className="text-slate-400 capitalize">
                    {selectedOrder.status}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2 text-slate-300">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-700 rounded"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-600 rounded overflow-hidden">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-300">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-slate-300">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="text-slate-300">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-gray-300">
                    {formatCurrency(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2 mt-2">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CancelledOrdersPage;
