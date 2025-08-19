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
  <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-700 shadow-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
    <table className="bg-gray-800 w-full">
      <thead>
        <tr className="bg-gray-700 text-white text-center p-2">
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
        {orders?.map((order) => (
          <tr
            key={order._id}
            className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors"
          >
            <td className="px-6 py-4 text-sm font-medium text-white">
              {order._id}
            </td>
            <td className="px-2 py-1 text-sm font-medium text-white">
              {order?.user?.name}
            </td>
            <td className="px-6 py-4 text-sm text-gray-400">
              {order?.user?.email}
            </td>
            <td className="px-6 py-4 text-sm text-gray-400">
              {new Date(order.createdAt).toLocaleString()}
            </td>
            <td className="px-6 py-4 text-sm text-gray-400">
              {order.totalAmount} AED
            </td>
            <td className="px-6 py-4 text-sm text-gray-400">
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
                      className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 shadow-md"
                      onClick={() => onViewDetails(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
                    <p>View Order Details</p>
                  </TooltipContent>
                </Tooltip>

                {/* Update Status */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-500 hover:text-green-400 hover:bg-green-900/20 shadow-md"
                      onClick={() => onUpdateStatus(order._id, order.status)}
                    >
                      <Truck className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
                    <p>Update Order Status</p>
                  </TooltipContent>
                </Tooltip>

                {/* Delete */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-400 hover:bg-red-900/20 shadow-md"
                      onClick={() => onDeleteOrder && onDeleteOrder(order._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
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
