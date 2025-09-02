import PaginationDemo from "./Common/Pagination.jsx";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  cancelReturnRequest,
  fetchUserReturnRequest,
} from "@/features/order/orderSlice";
import { formatCurrency } from "@/lib/currency";
import { OrderItemDetails } from "@/pages/user/MyOrdersPage";
import { format } from "date-fns";
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  MapPin,
  MessageCircle,
  Package,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const getStatusClasses = (status) => {
  switch (status?.toLowerCase()) {
    case "requested":
      return "bg-amber-700 text-amber-200 border-amber-600";
    case "approved":
      return "bg-purple-700 text-purple-200 border-purple-600";
    case "rejected":
      return "bg-red-700 text-red-200 border-red-600";
    case "picked":
      return "bg-blue-700 text-blue-200 border-blue-600";
    case "cancelled":
      return "bg-red-500 text-black border-gray-600";
    case "refunded":
      return "bg-green-700 text-green-200 border-green-600";
    default:
      return "bg-gray-700 text-gray-200 border-gray-600";
  }
};

const getRefundStatusClasses = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-amber-700 text-amber-200 border-amber-600";
    case "initiated":
      return "bg-purple-700 text-purple-200 border-purple-600";
    case "succeeded":
      return "bg-green-700 text-green-200 border-green-600";
    case "failed":
      return "bg-red-700 text-red-200 border-red-600";
    default:
      return "bg-gray-700 text-gray-200 border-gray-600";
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "requested":
      return <Clock className="w-3 h-3 text-amber-200" />;
    case "approved":
      return <CheckCircle className="w-3 h-3 text-purple-200" />;
    case "rejected":
      return <XCircle className="w-3 h-3 text-red-200" />;
    case "picked":
      return <Package className="w-3 h-3 text-blue-200" />;
    case "cancelled":
      return <Ban className="w-3 h-3 text-gray-200" />;
    case "refunded":
      return <DollarSign className="w-3 h-3 text-green-200" />;
    default:
      return <RefreshCw className="w-3 h-3 text-gray-200" />;
  }
};

// Return Request Card Component
const ReturnRequestCard = ({
  returnRequest,
  onViewDetails,
  onCancelReturn,
}) => {
  const returnRequestDate = new Date(returnRequest.requestedAt);
  const numberOfItems = returnRequest.items ? returnRequest.items.length : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10 ">
        <span
          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(
            returnRequest.status
          )}`}
        >
          {getStatusIcon(returnRequest.status)}
          <span className="">{returnRequest.status}</span>
        </span>
      </div>

      <div className="p-6">
        {/* Return Request Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-300 truncate pr-4">
              Return Request
            </h3>
          </div>
          <div className="flex items-center text-sm text-slate-400 space-x-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {format(returnRequestDate, "MMM d, yyyy")}
            </span>
            <span className="flex items-center">
              <Package className="w-4 h-4 mr-1" />
              {numberOfItems} item{numberOfItems !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Product Preview */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            {returnRequest.items[0]?.image && (
              <div className="relative">
                <img
                  src={
                    returnRequest.items[0].image ||
                    "https://via.placeholder.com/48"
                  }
                  alt={returnRequest.items[0].name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-lg"></div>
              </div>
            )}
            <div className="flex-grow">
              <p className="font-medium text-slate-300 truncate mb-1">
                {returnRequest.items.length > 1
                  ? `${returnRequest.items[0].name} +${
                      returnRequest.items.length - 1
                    } more`
                  : returnRequest.items[0]?.name || "—"}
              </p>
              <p className="text-lg font-bold text-slate-300">
                {formatCurrency(returnRequest.refundAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Reason Preview */}
        {returnRequest.reason && (
          <div className="mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
            <p className="text-sm text-slate-400 mb-1 flex items-center">
              <MessageCircle className="w-3 h-3 mr-1" />
              Reason:
            </p>
            <p className="text-sm font-medium text-slate-300 truncate">
              {returnRequest.reason}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(returnRequest)}
              className="flex-1 min-w-[120px] bg-blue-900 border-blue-700 text-blue-300 hover:bg-blue-800 hover:border-blue-600"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </DialogTrigger>

          {returnRequest.status?.toLowerCase() === "requested" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-900 border-red-700 text-red-300 hover:bg-red-800 hover:border-red-600"
                  onClick={() => onCancelReturn(returnRequest._id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 border border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-300">
                    Cancel Return Request
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Are you sure you want to cancel this return request? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-slate-300">
                    No, keep return request
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancelReturn(returnRequest._id)}
                    className="bg-red-900 text-red-300"
                  >
                    Yes, cancel return request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

const ReturnRequest = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const { returnRequests, returnRequestsTotalPages, returnRequestsLimit } =
  useSelector((state) => state.order);
  console.log('returnRequestsLimit', returnRequestsLimit)

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState(null);
  // Local page state
  const [currentPage, setCurrentPage] = useState(1);

  // Client-side fallback pagination in case backend returns full list
  const pageSize = returnRequestsLimit || 10;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReturnRequests = Array.isArray(returnRequests)
    ? returnRequests.slice(startIndex, endIndex)
    : [];

  useEffect(() => {
    if (user?._id) {
      dispatch(
        fetchUserReturnRequest({
          userId: user?._id,
          accessToken,
          page: currentPage,
          limit: returnRequestsLimit || 10,
        })
      );
    }
  }, [dispatch, user?._id, accessToken, currentPage, returnRequestsLimit]);

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    if (user?._id) {
      dispatch(
        fetchUserReturnRequest({
          userId: user?._id,
          accessToken,
          page,
          limit: returnRequestsLimit || 10,
        })
      );
    }
  };

  const handleViewDetails = (returnRequest) => {
    setSelectedReturnRequest(returnRequest);
    setIsDialogOpen(true);
  };

  const handleCancelReturn = async (returnRequestId) => {
    try {
      await dispatch(cancelReturnRequest(returnRequestId)).unwrap();
      toast.success("Return request cancelled successfully");
      // Refresh current page
      dispatch(
        fetchUserReturnRequest({
          userId: user?._id,
          accessToken,
          page: currentPage,
          limit: returnRequestsLimit || 10,
        })
      );
    } catch (err) {
      const errorMessage =
        err.message ||
        (typeof err === "string" ? err : "Failed to cancel return request");
      toast.error(errorMessage);
    }
  };

  // Empty state
  if (returnRequests?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh] bg-gray-800 rounded-2xl border border-gray-700">
        <div className="relative">
          <RotateCcw className="relative w-24 h-24 text-blue-400 mb-6" />
        </div>
        <h2 className="text-3xl font-bold text-slate-300 mb-2">
          No Return Requests
        </h2>
        <p className="text-slate-400 text-lg mb-6 max-w-md">
          You haven't made any return requests yet. When you do, they'll appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* Return Request Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {(returnRequestsTotalPages > 1 ? paginatedReturnRequests : returnRequests)?.map((returnRequest) => (
            <ReturnRequestCard
              key={returnRequest._id}
              returnRequest={returnRequest}
              onViewDetails={handleViewDetails}
              onCancelReturn={handleCancelReturn}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {returnRequestsTotalPages > 1 && (
          <div className="flex items-center justify-center bg-gray-800 p-6 rounded-xl border border-gray-700">
            <PaginationDemo
              currentPage={currentPage}
              totalPages={returnRequestsTotalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400">
          {selectedReturnRequest && (
            <>
              <DialogHeader className="border-b border-gray-700 pb-4">
                <DialogTitle className="text-2xl font-bold text-slate-300 flex items-center">
                  <RotateCcw className="w-6 h-6 mr-2 text-blue-400" />
                  Return Request Details
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Request ID: {selectedReturnRequest._id?.substring(0, 25)} •
                  Created on{" "}
                  {format(
                    new Date(selectedReturnRequest.requestedAt),
                    "MMMM d, yyyy 'at' hh:mm a"
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-8">
                {/* Status Overview */}
                <div className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusClasses(
                        selectedReturnRequest.status
                      )}`}
                    >
                      {getStatusIcon(selectedReturnRequest.status)}
                      <span className="text-slate-300">
                        {selectedReturnRequest.status}
                      </span>
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Refund Amount</p>
                      <p className="text-2xl font-bold text-slate-300">
                        {formatCurrency(selectedReturnRequest.refundAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Reason & Comment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                      Reason for Return
                    </h3>
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                      <p className="text-slate-300 font-medium">
                        {selectedReturnRequest.reason || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
                      Comment
                    </h3>
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                      <p className="text-slate-300">
                        {selectedReturnRequest.comment ||
                          "No additional comments"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Items */}
                <div>
                  <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-green-400" />
                    Return Items
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedReturnRequest.items.map((item, index) => (
                      <OrderItemDetails key={index} item={item} />
                    ))}
                  </div>
                </div>

                {/* Pickup Address Information */}
                <div>
                  <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                    Pickup Address
                  </h3>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Contact Person
                        </p>
                        <p className="font-semibold text-slate-300">
                          {selectedReturnRequest?.pickUpAddress?.fullName ||
                            "Customer Name"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Phone Number
                        </p>
                        <p className="font-semibold text-slate-300">
                          {selectedReturnRequest?.pickUpAddress?.phoneNumber}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-400 mb-1">
                          Pickup Address
                        </p>
                        <p className="font-semibold text-slate-300">
                          {selectedReturnRequest?.pickUpAddress?.addressLine},{" "}
                          {selectedReturnRequest?.pickUpAddress?.city},{" "}
                          {selectedReturnRequest?.pickUpAddress?.state}{" "}
                          {selectedReturnRequest?.pickUpAddress?.postalCode},{" "}
                          {selectedReturnRequest?.pickUpAddress?.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refund Details */}
                <div>
                  <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-green-400" />
                    Refund Details
                  </h3>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Refund Status
                        </p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRefundStatusClasses(
                            selectedReturnRequest?.status
                          )}`}
                        >
                          <span className="text-slate-300">
                            {selectedReturnRequest?.status}
                          </span>
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Refund Amount
                        </p>
                        <p className="font-bold text-lg text-slate-300">
                          {formatCurrency(selectedReturnRequest?.refundAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Refund Date
                        </p>
                        <p className="font-semibold text-slate-300">
                          {selectedReturnRequest?.refundedAt
                            ? format(
                                new Date(selectedReturnRequest?.refundedAt),
                                "MMM d, yyyy"
                              )
                            : "Pending"}
                        </p>
                      </div>
                    </div>

                    {selectedReturnRequest?.refundStatus === "Failed" && (
                      <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg">
                        <p className="text-sm text-red-300 mb-1">
                          Refund Failed Reason
                        </p>
                        <p className="font-medium text-red-300">
                          {selectedReturnRequest?.refundFailureReason ||
                            "Not specified"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-400" />
                    Return Timeline
                  </h3>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-semibold text-slate-300">
                            Return Request Created
                          </p>
                          <p className="text-sm text-slate-400">
                            {format(
                              new Date(selectedReturnRequest.requestedAt),
                              "MMMM d, yyyy 'at' hh:mm a"
                            )}
                          </p>
                        </div>
                      </div>

                      {selectedReturnRequest.refundedAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold text-slate-300">
                              Refund Processed
                            </p>
                            <p className="text-sm text-slate-400">
                              {format(
                                new Date(selectedReturnRequest.refundedAt),
                                "MMMM d, yyyy 'at' hh:mm a"
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-gray-700 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6 text-slate-300"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReturnRequest;
