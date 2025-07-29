import React, { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllReturnRequests,
  updateReturnRequestStatus,
} from "@/features/order/orderSlice";
import Loader from "@/component/common/Loader";
import ReturnRequestDetailsModal from "@/component/admin/ReturnRequestDetailsModal";
import ReturnRequestTable from "@/pages/admin/ReturnRequestTable";

const ManageReturnRequests = () => {
  const dispatch = useDispatch();
  const { returnRequests, returnRequestsLoading, returnRequestsError } =
    useSelector((state) => state.order);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchAllReturnRequests());
  }, [dispatch]);

  const handleStatusChange = (orderId, status) => {
    dispatch(updateReturnRequestStatus({ orderId, status }));
  };

  const handleViewDetails = (orderId) => {
    const orderToShow = returnRequests.find((order) => order._id === orderId);
    setSelectedOrder(orderToShow);
    setDetailsModalOpen(true);
  };

  if (returnRequestsLoading) {
    return <Loader message="Fetching return requests..." />;
  }

  if (returnRequestsError) {
    return <div className="text-red-500">Error: {returnRequestsError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Return Requests</h1>
      <div className="p-4 lg:p-6">
        {returnRequestsLoading ? (
          <Loader message={"Loading Return Requests..."} />
        ) : returnRequests?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Inbox className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-xl font-semibold mb-2">
              No return requests found
            </p>
            <p className="text-md">
              There are currently no pending or processed return requests.
            </p>
          </div>
        ) : (
          <ReturnRequestTable
            returnRequests={returnRequests}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>
      <ReturnRequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        order={selectedOrder}
        onUpdateStatus={handleStatusChange}
      />
    </div>
  );
};

export default ManageReturnRequests;
