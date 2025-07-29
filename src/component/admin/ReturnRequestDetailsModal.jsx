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
      <div className="absolute left-[10px] top-5 -bottom-4 w-0.5 bg-gray-200"></div>
    )}
    <div className="flex items-center">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          date ? "bg-green-500" : "bg-gray-300"
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
        <p
          className={`font-semibold ${
            date ? "text-gray-800" : "text-gray-500"
          }`}
        >
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
  order,
  onUpdateStatus,
}) => {
  console.log("order", order);
  if (!isOpen || !order) return null;

  const { returnRequest } = order;
  console.log("returnRequest", returnRequest);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl lg:max-w-4xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Return Request Details</DialogTitle>
          <DialogDescription>Order ID: {order._id}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 max-h-[75vh] overflow-y-auto pr-2">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Info */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Order Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <p>
                  <strong>Order Status:</strong>{" "}
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {capitalizeFirstLetter(order.status)}
                  </Badge>
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  {formatCurrency(order.totalAmount)}
                </p>
                <p>
                  <strong>Delivery Date:</strong>{" "}
                  {order.deliveredAt
                    ? format(new Date(order.deliveredAt), "PPP")
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Ordered Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map(
                    (item) => (
                      console.log(item, "item"),
                      (
                        <TableRow key={item._id}>
                          <TableCell className="flex items-center">
                            <img
                              src={item?.image}
                              alt={item?.name}
                              className="w-12 h-12 object-cover rounded-md mr-4"
                            />
                            <div>
                              <p className="font-medium">{item?.name}</p>
                              <p className="text-xs text-gray-500">
                                {item?.category?.name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                        </TableRow>
                      )
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Return Request Info */}
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Return Request Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <p>
                  <strong>Reason:</strong> {returnRequest.reason}
                </p>
                <p>
                  <strong>Comment:</strong>{" "}
                  {returnRequest.comment || "No comment provided."}
                </p>
                {returnRequest.image && (
                  <div>
                    <strong>Return Image:</strong>
                    <img
                      src={returnRequest.image.url}
                      alt="Return visual proof"
                      className="mt-2 w-full max-w-xs h-auto rounded-lg border"
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
              <h3 className="font-semibold text-lg mb-2">User Information</h3>
              <div className="text-sm bg-gray-50 p-4 rounded-lg space-y-1">
                <p>
                  <strong>Name:</strong> {order.user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {order.user?.email}
                </p>
                <p>
                  <strong>Phone:</strong> {order.shippingAddress?.phoneNumber}
                </p>
              </div>
            </div>

            {/* Return Timeline */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Return Timeline</h3>
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
                <h3 className="font-semibold text-lg mb-2">Pickup Agent</h3>
                <div className="text-sm bg-gray-50 p-4 rounded-lg space-y-1">
                  <p>
                    <strong>Name:</strong> {returnRequest.pickUpAgent.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {returnRequest.pickUpAgent.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center pt-4 border-t">
          <div className="flex gap-2 flex-wrap">
            {returnRequest.status === "Pending" && (
              <>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onUpdateStatus(order._id, "Approved")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onUpdateStatus(order._id, "Rejected")}
                >
                  Reject
                </Button>
              </>
            )}
            {returnRequest.status === "Approved" && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onUpdateStatus(order._id, "Picked")}
              >
                Mark as Picked
              </Button>
            )}
            {returnRequest.status === "Picked" && (
              <Button
                size="sm"
                variant="success"
                onClick={() => onUpdateStatus(order._id, "Refunded")}
              >
                Mark as Refunded
              </Button>
            )}
          </div>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnRequestDetailsModal;
