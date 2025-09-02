import PaginationDemo from "@/component/Common/Pagination";
import {
  deleteOrder,
  fetchOrders,
  updateOrderStatus,
} from "@/features/order/orderSlice";
import useDebounce from "@/lib/useDebounce";
import { PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import OrderCardList from "./OrderCardList";
import OrderDetailsDialog from "./OrderDetailsDialog";
import OrderFilters from "./OrderFilters";
import OrderStatusDialog from "./OrderStatusDialog";
import OrderTable from "./OrderTable";
import { Loader } from "@/component/Common/Loader.jsx";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  console.log("selectedOrder", selectedOrder);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusOrderId, setStatusOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(
      fetchOrders({
        name: debouncedSearchTerm,
        status: filterStatus !== "All" ? filterStatus : undefined,
        date: filterDate || undefined,
        page: currentPage,
        limit: 10,
      })
    ).then((res) => {
      setTotalOrders(res.payload.totalOrders);
      setTotalPages(res.payload.totalPages);
    });
  }, [dispatch, debouncedSearchTerm, filterStatus, filterDate, currentPage]);

  // Handlers
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsDialog(true);
  };

  const handleUpdateStatus = (orderId, currentStatus) => {
    console.log('Order ID:', orderId, 'Current Status:', currentStatus);
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
      toast.success("Order deleted successfully!", {
        className: "toast-success",
      });
      setOrderToDelete(null);
      dispatch(
        fetchOrders({
          name: debouncedSearchTerm,
          status: filterStatus !== "All" ? filterStatus : undefined,
          date: filterDate || undefined,
          page: currentPage,
          limit: 10,
        })
      ).then((res) => {
        setTotalOrders(res.payload.totalOrders);
        setTotalPages(res.payload.totalPages);
      });
    } catch {
      toast.error("Failed to delete order", {
        className: "toast-danger",
      });
      setOrderToDelete(null);
    }
  };

  const handleSearch = () => {
    dispatch(
      fetchOrders({
        name: searchTerm,
        status: filterStatus !== "All" ? filterStatus : undefined,
        date: filterDate || undefined,
        page: 1,
        limit: 10,
      })
    ).then((res) => {
      setTotalOrders(res.payload.totalOrders);
      setTotalPages(res.payload.totalPages);
      setCurrentPage(1);
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterDate("");
    dispatch(
      fetchOrders({
        page: 1,
        limit: 10,
      })
    ).then((res) => {
      setTotalOrders(res.payload.totalOrders);
      setTotalPages(res.payload.totalPages);
      setCurrentPage(1);
    });
  };

  const statusOrder = orders?.find((o) => o._id === statusOrderId);

  const UpdateStatus = async () => {
    if (!newStatus) return;
    try {
      await dispatch(
        updateOrderStatus({
          orderId: statusOrderId,
          status: newStatus,
        })
      ).unwrap();

      toast.success("Order status updated successfully!", {
        className: "toast-success",
      });
      setShowStatusDialog(false);
      dispatch(
        fetchOrders({
          page: currentPage,
          limit: 10,
        })
      ).then((res) => {
        setTotalOrders(res.payload.totalOrders);
        setTotalPages(res.payload.totalPages);
      });
    } catch (err) {
      console.error("Error in updating status: ", err.message);
      toast.error("Failed to update status", {
        className: "toast-danger",
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    dispatch(
      fetchOrders({
        name: debouncedSearchTerm,
        status: filterStatus !== "All" ? filterStatus : undefined,
        date: filterDate || undefined,
        page: page,
        limit: 10,
      })
    ).then((res) => {
      setTotalOrders(res.payload.totalOrders);
      setTotalPages(res.payload.totalPages);
    });
  };

  return (
    <div className="bg-[#0f172a] text-slate-300 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-2 lg:p-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            Orders Management
          </h2>
          <div className="p-1 lg:p-2">
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
              totalOrders={totalOrders}
            />
            <div className="border-b border-gray-700 mb-8"/>
            {/* Content */}
            <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {loading ? (
              <Loader message={"Loading Orders..."} />
            ) : orders?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <PackageOpen className="h-16 w-16 mb-4 text-gray-300" />
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
                {/* <OrderSummary orders={orders} /> */}
                <PaginationDemo
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirmDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-slate-300">
              <h3 className="text-lg font-semibold mb-2 text-white">
                Confirm Deletion
              </h3>
              <p className="mb-4 text-gray-400">
                Are you sure you want to delete this order? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={() => {
                    setShowDeleteConfirmDialog(false);
                    setOrderToDelete(null);
                  }}
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
    </div>
  );
};

export default OrdersPage;
