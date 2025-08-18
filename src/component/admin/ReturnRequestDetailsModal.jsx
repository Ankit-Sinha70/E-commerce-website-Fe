import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import { capitalizeFirstLetter } from "@/lib/orderUtils";
import { isRefundProceed } from "@/pages/admin/ReturnRequestTable";

// const statusOrder = ["Pending", "Approved", "Picked", "Refunded"];

const getStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "picked":
    case "refunded":
      return "success";
    case "rejected":
    case "cancelled":
      return "destructive";
    case "pending":
    default:
      return "secondary";
  }
};

const TimelineItem = ({ status, date, isLast = false }) => (
  <div className="relative pl-8">
    {!isLast && (
      <div className="absolute left-[10px] top-5 -bottom-4 w-0.5 bg-gray-700"></div>
    )}
    <div className="flex items-center">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          date ? "bg-green-500" : "bg-gray-500"
        }`}
      >
        {date && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        )}
      </div>
      <div className="ml-4">
        <p className={`font-semibold ${date ? "text-white" : "text-gray-400"}`}>
          {status}
        </p>
        <p className="text-sm text-gray-500">
          {date
            ? format(new Date(date), "MMM d, yyyy 'at' hh:mm a")
            : "Pending"}
        </p>
      </div>
    </div>
  </div>
);

const ReturnRequestDetailsModal = ({
  isOpen,
  onClose,
  returnRequest,
  onUpdateStatus,
}) => {
  console.log("returnRequestjjjj", returnRequest);
  if (!isOpen || !returnRequest) return null;

  console.log("returnRequesttttt", returnRequest);

  const renderActionButtons = () => {
    const { _id, status } = returnRequest;

    if (status === "Requested") {
      return (
        <>
          <Button
            size="sm"
            variant="success"
            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
            onClick={() => onUpdateStatus(_id, "Approved")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white shadow-md"
            onClick={() => onUpdateStatus(_id, "Rejected")}
          >
            Reject
          </Button>
        </>
      );
    }

    if (status === "Approved") {
      return (
        <>
          <Button
            size="sm"
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={() => onUpdateStatus(_id, "Picked")}
          >
            Mark as Picked
          </Button>
        </>
      );
    }

    if (status === "Picked" && !isRefundProceed(returnRequest?.refundStatus)) {
      return (
        <>
          <Button
            size="sm"
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            onClick={() => onUpdateStatus(_id, "InitiateRefund")}
          >
            Initiate Refund
          </Button>
        </>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl lg:max-w-4xl bg-[#0f172a] text-gray-300 shadow-xl rounded-lg border border-blue-500 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-white">
            Return Request Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Return Request ID: {returnRequest._id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 max-h-[75vh] overflow-y-auto pr-2">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Info */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Order Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-700 border border-gray-600 p-4 rounded-lg">
                <p className="text-gray-300">
                  <strong>Order Status:</strong>{" "}
                  <Badge
                    variant={getStatusBadgeVariant(
                      returnRequest?.orderId?.status
                    )}
                  >
                    {capitalizeFirstLetter(returnRequest?.orderId?.status)}
                  </Badge>
                </p>
                <p className="text-gray-300">
                  <strong>Total Amount:</strong>{" "}
                  {formatCurrency(returnRequest?.orderId?.totalAmount)}
                </p>
                <p className="text-gray-300">
                  <strong>Delivery Date:</strong>{" "}
                  {returnRequest?.orderId?.deliveredAt
                    ? format(
                        new Date(returnRequest?.orderId?.deliveredAt),
                        "PPP"
                      )
                    : "N/A"}
                </p>
                <p className="text-gray-300">
                  <strong>Ordered Items:</strong>{" "}
                  {returnRequest?.orderId?.items?.length}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Ordered Items
              </h3>
              <Table className="bg-gray-800 text-slate-300">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Product</TableHead>
                    <TableHead className="text-white">Quantity</TableHead>
                    <TableHead className="text-white">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnRequest?.items?.map(
                    (item) => (
                      console.log(item, "item"),
                      (
                        <TableRow key={item._id}>
                          <TableCell className="flex items-center text-gray-300">
                            <img
                              src={item?.image}
                              alt={item?.name}
                              className="w-12 h-12 object-cover rounded-md mr-4"
                            />
                            <div>
                              <p className="font-medium text-white">
                                {item?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item?.category?.name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {item?.quantity}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatCurrency(item?.price)}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Return Request Info */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Return Request Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-700 border border-gray-600 p-4 rounded-lg">
                <p className="text-gray-300">
                  <strong>Reason:</strong> {returnRequest.reason}
                </p>
                <p className="text-gray-300">
                  <strong>Comment:</strong>{" "}
                  {returnRequest.comment || "No comment provided."}
                </p>
                {returnRequest.imageUrl && (
                  <div className="text-gray-300">
                    <strong>Return Image:</strong>
                    <img
                      src={returnRequest.imageUrl}
                      alt="Return visual proof"
                      className="mt-2 w-full max-w-md h-auto rounded-lg border border-gray-600"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* User Info */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                User Information
              </h3>
              <div className="text-sm bg-gray-700 border border-gray-600 p-4 rounded-lg space-y-1">
                <p className="text-gray-300">
                  <strong>Name:</strong> {returnRequest.user?.name}
                </p>
                <p className="text-gray-300">
                  <strong>Email:</strong> {returnRequest.user?.email}
                </p>
                <p className="text-gray-300">
                  <strong>Phone:</strong>{" "}
                  {returnRequest.pickUpAddress?.phoneNumber}
                </p>
              </div>
            </div>

            {/* Return Timeline */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-white">
                Return Timeline
              </h3>
              <div className="space-y-4">
                <TimelineItem
                  status="Requested"
                  date={returnRequest?.requestedAt}
                />
                {returnRequest.status === "Rejected" ? (
                  <TimelineItem
                    status="Rejected"
                    className="text-red-500"
                    date={returnRequest?.rejectedAt}
                    isLast={true}
                  />
                ) : (
                  <>
                    <TimelineItem
                      status="Approved"
                      date={returnRequest?.approvedAt}
                    />
                    <TimelineItem
                      status="Picked Up"
                      date={returnRequest?.pickedAt}
                    />
                    <TimelineItem
                      status="Refunded"
                      date={returnRequest?.refundedAt}
                      isLast={true}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Pickup Agent */}
            {returnRequest.pickUpAgent && (
              <div>
                <h3 className="font-semibold text-lg mb-2 text-white">
                  Pickup Agent
                </h3>
                <div className="text-sm bg-gray-700 border border-gray-600 p-4 rounded-lg space-y-1">
                  <p className="text-gray-300">
                    <strong>Name:</strong> {returnRequest?.pickUpAgent?.name}
                  </p>
                  <p className="text-gray-300">
                    <strong>Phone:</strong> {returnRequest?.pickUpAgent?.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center pt-4 border-t border-gray-700">
          <div className="flex gap-2 flex-wrap">{renderActionButtons()}</div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="bg-gray-600 hover:bg-gray-700 text-white shadow-md"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnRequestDetailsModal;
