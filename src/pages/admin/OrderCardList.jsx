// src/component/admin/OrderCardList.jsx
import { Button } from "@/components/ui/button";
import { Eye, Truck } from "lucide-react";

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

const OrderCardList = ({ orders, onViewDetails, onUpdateStatus }) => (
  <div className="lg:hidden space-y-4">
    {orders.map((order) => (
      <div
        key={order._id}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
      >
        <div className="space-y-2">
          <p className="font-semibold text-gray-900">
            Order ID: <span className="font-normal">{order._id}</span>
          </p>
          <p className="font-semibold text-gray-900">
            Name: <span className="font-normal">{order?.user?.name}</span>
          </p>
          <p className="text-gray-700">
            Email: <span className="font-normal">{order?.user?.email}</span>
          </p>
          <p className="text-gray-700">
            Date: <span className="font-normal">{new Date(order.createdAt).toLocaleString()}</span>
          </p>
          <p className="text-gray-700">
            Total: <span className="font-normal">{order.totalAmount} AED</span>
          </p>
          <p className="text-gray-700">
            Items: <span className="font-normal">{order.items.length}</span>
          </p>
          <p className="text-gray-700">
            Status: {getStatusBadge(order.status)}
          </p>
        </div>
        <div className="flex space-x-2 mt-4 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => onViewDetails(order)}
          >
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-green-600 hover:text-green-800 hover:bg-green-50"
            onClick={() => onUpdateStatus(order._id, order.status)}
          >
            <Truck className="h-4 w-4 mr-1" /> Update
          </Button>
        </div>
      </div>
    ))}
  </div>
);

export default OrderCardList;