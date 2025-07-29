// src/component/admin/OrderTable.jsx
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Trash2, Truck } from "lucide-react";

const statusClasses = {
  Delivered: "bg-green-300 text-green-800 border-green-200",
  Pending: "bg-yellow-300 text-yellow-800 border-yellow-200",
  Processing: "bg-blue-300 text-blue-800 border-blue-200",
  Shipped: "bg-purple-300 text-purple-800 border-purple-200",
  Cancelled: "bg-red-300 text-red-800 border-red-200",
};

function getStatusBadge(status) {
  return (
    <span
      className={`px-3 py-2 rounded-full text-xs font-semibold border ${
        statusClasses[status] || "bg-gray-100 text-gray-800 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

const OrderTable = ({
  orders,
  onViewDetails,
  onUpdateStatus,
  onDeleteOrder,
}) => (
  <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
    <table className="min-w-full bg-white">
      <thead>
        <tr className="bg-gray-800 text-white text-center p-2">
          <td className="px-8 py-1 font-sm">Order ID</td>
          <td className="px-8 py-1 font-sm">Name</td>
          <td className="px-8 py-1 font-sm">Email</td>
          <td className="px-8 py-1 font-sm">Date</td>
          <td className="px-8 py-1 font-sm">Total Amount</td>
          <td className="px-8 py-1 font-sm">Items</td>
          <td className="px-8 py-1 font-sm">Status</td>
          <td className="px-8 py-1 font-sm">Actions</td>
        </tr>
      </thead>
      <tbody className="text-center">
        {orders.map((order) => (
          <tr
            key={order._id}
            className="border-b last:border-b-0 hover:bg-gray-100 transition-colors"
          >
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {order._id}
            </td>
            <td className="px-2 py-1 text-sm font-medium text-gray-900">
              {order?.user?.name}
            </td>
            <td className="px-6 py-4 text-sm text-gray-700">
              {order?.user?.email}
            </td>
            <td className="px-6 py-4 text-sm text-gray-700">
              {new Date(order.createdAt).toLocaleString()}
            </td>
            <td className="px-6 py-4 text-sm text-gray-700">
              {order.totalAmount} AED
            </td>
            <td className="px-6 py-4 text-sm text-gray-700">
              {order.items.length}
            </td>
            <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
            <td className="px-6 py-4">
              <div className="flex space-x-2">
                {/* View Details */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-200"
                      onClick={() => onViewDetails(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Order Details</p>
                  </TooltipContent>
                </Tooltip>

                {/* Update Status */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-800 hover:bg-green-200"
                      onClick={() => onUpdateStatus(order._id, order.status)}
                    >
                      <Truck className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update Order Status</p>
                  </TooltipContent>
                </Tooltip>

                {/* Delete */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-200"
                      onClick={() => onDeleteOrder && onDeleteOrder(order._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Order</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default OrderTable;
