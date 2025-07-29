import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReturnRequests, updateReturnRequestStatus } from '@/features/order/orderSlice';
import Loader from '@/component/common/Loader';
import ReturnRequestDetailsModal from '@/component/admin/ReturnRequestDetailsModal';
import ReturnRequestTable from '@/pages/admin/ReturnRequestTable';

const ManageReturnRequests = () => {
  const dispatch = useDispatch();
  const {returnRequests, returnRequestsLoading, returnRequestsError } = useSelector((state) => state.order);
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
      <ReturnRequestTable 
        returnRequests={returnRequests}
        onStatusChange={handleStatusChange}
        onViewDetails={handleViewDetails}
      />
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
