import React, { useEffect, useState } from 'react';
import { Inbox } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReturnRequests, initiateReturnRefund, updateReturnRequestStatus } from '@/features/order/orderSlice';
import Loader from '@/component/common/Loader';
import ReturnRequestDetailsModal from '@/component/admin/ReturnRequestDetailsModal';
import ReturnRequestTable from '@/pages/admin/ReturnRequestTable';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import PaginationDemo from '@/component/common/Pagination';

const ManageReturnRequests = () => {
  const dispatch = useDispatch();
  const { 
    returnRequests = [], 
    returnRequestsLoading, 
    returnRequestsError, 
    returnRequestsTotalPages 
  } = useSelector((state) => state.order);
  
  console.log('returnRequests', returnRequests)
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState(null);
  console.log('selectedReturnRequest', selectedReturnRequest)

  useEffect(() => {
    dispatch(fetchAllReturnRequests({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handleStatusChange = async (returnRequestId, status) => {
    if (!returnRequestId || !status) return;

    if (status === 'InitiateRefund') {
      try {
        await dispatch(initiateReturnRefund(returnRequestId)).unwrap();
        toast.success("Refund initiated successfully!");
      } catch (error) {
        toast.error("Failed to initiate refund.");
        console.error(error);
      }
    } else {
      try {
        await dispatch(updateReturnRequestStatus({ 
          returnRequestId, 
          status 
        })).unwrap();
        toast.success("Status updated successfully!");
      } catch (error) {
        toast.error("Failed to update status.");
        console.error(error);
      }
    }
  };

  const handleViewDetails = (returnRequest) => {
    setSelectedReturnRequest(returnRequest);
    setDetailsModalOpen(true);
  };

  if (returnRequestsLoading) {
    return <Loader message="Fetching return requests..." />;
  }

  if (returnRequestsError) {
    return <div className="text-red-500">Error: {returnRequestsError}</div>;
  }

  return (
    <div className="bg-[#0f172a] text-slate-300 min-h-screen">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4 text-white">Manage Return Requests</h1>
          <div className="p-4 lg:p-6">
            {returnRequestsLoading ? (
              <Loader message={"Loading Return Requests..."} />
            ) : returnRequests?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Inbox className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-xl font-semibold mb-2">No return requests found</p>
                <p className="text-md">There are currently no pending or processed return requests.</p>
              </div>
            ) : (
              <>
                <ReturnRequestTable
                  returnRequests={Array.isArray(returnRequests) ? returnRequests : []}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                />
                <PaginationDemo 
                  currentPage={currentPage}
                  totalPages={returnRequestsTotalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
          <ReturnRequestDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setDetailsModalOpen(false)}
            returnRequest={selectedReturnRequest}
            onUpdateStatus={handleStatusChange}
          />
        </div>
    </div>
  );
};

export default ManageReturnRequests;
