// src/pages/admin/OrdersPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Loader from "@/component/common/Loader";
import OrderCardList from "./OrderCardList";
import OrderTable from "./OrderTable";
import OrderFilters from "./OrderFilters";
import OrderSummary from "./OrderSummary";
import OrderDetailsDialog from "./OrderDetailsDialog";
import OrderStatusDialog from "./OrderStatusDialog";
import { fetchOrders, updateOrderStatus, deleteOrder } from "@/features/order/orderSlice";
import { PackageOpen } from "lucide-react";
import useDebounce from "@/lib/useDebounce";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  console.log('selectedOrder', selectedOrder)
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusOrderId, setStatusOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(
      fetchOrders({
        name: debouncedSearchTerm,
        status: filterStatus !== "All" ? filterStatus : undefined,
        date: filterDate || undefined,
      })
    );
  }, [dispatch, debouncedSearchTerm, filterStatus, filterDate]);

  // Handlers
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsDialog(true);
  };

  const handleUpdateStatus = (orderId, currentStatus) => {
    setStatusOrderId(orderId);
    setNewStatus(currentStatus);
    setShowStatusDialog(true);
  };

  const handleDeleteOrder = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteOrder = async () => {
    setShowDeleteConfirmDialog(false);
    if (!orderToDelete) return;
    try {
      await dispatch(deleteOrder(orderToDelete)).unwrap();
      toast.success("Order deleted successfully!");
      setOrderToDelete(null);
      dispatch(
        fetchOrders({
          name: debouncedSearchTerm,
          status: filterStatus !== "All" ? filterStatus : undefined,
          date: filterDate || undefined,
        })
      );
    } catch (err) {
      toast.error("Failed to delete order", { description: err?.message || String(err) });
      setOrderToDelete(null);
    }
  };

  const handleSearch = () => {
    dispatch(
      fetchOrders({
        name: searchTerm,
        status: filterStatus !== "All" ? filterStatus : undefined,
        date: filterDate || undefined,
      })
    );
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterDate("");
    dispatch(fetchOrders({}));
  };

  const statusOrder = orders.find((o) => o._id === statusOrderId);

  const UpdateStatus = async() => {
    if (!newStatus) return;
    try {
      await dispatch(
        updateOrderStatus({
          orderId: statusOrderId,
          status: newStatus,
        })
      );
      toast.success("Order status updated successfully!");
      setShowStatusDialog(false);
      dispatch(fetchOrders());
    } catch {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen p-2">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-2 lg:p-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Orders Management
          </h2>
        <div className="p-1 lg:p-2 border-b border-gray-200">
          <OrderFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            onSearch={handleSearch}
            onReset={handleResetFilters}
            totalOrders={orders.length}
          />

          {/* Content */}
          {loading ? (
            <Loader message={"Loading Orders..."} />
          ) : orders?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <PackageOpen className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-xl font-semibold mb-2">No orders found</p>
              <p className="text-md text-center">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              <OrderTable
                orders={orders}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
                onDeleteOrder={handleDeleteOrder}
              />
              <OrderCardList
                orders={orders}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
              />
              <OrderSummary orders={orders} />
            </>
          )}
        </div>
        <div className="border border-b-1 w-full"></div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => { setShowDeleteConfirmDialog(false); setOrderToDelete(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDeleteOrder}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <OrderDetailsDialog
        open={showOrderDetailsDialog}
        onOpenChange={setShowOrderDetailsDialog}
        order={selectedOrder}
      />

      <OrderStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        orderId={statusOrderId}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        currentStatus={statusOrder?.status}
        onUpdate={UpdateStatus}

      />
    </div>
  );
};

export default OrdersPage;
