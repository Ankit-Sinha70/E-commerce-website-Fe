/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllReturnRequests,
  initiateReturnRefund,
  updateReturnRequestStatus,
} from "@/features/order/orderSlice";
import { Loader } from "@/component/Common/Loader";
import ReturnRequestDetailsModal from "@/component/admin/ReturnRequestDetailsModal";
import ReturnRequestTable from "@/pages/admin/ReturnRequestTable";
import { toast } from "sonner";
import PaginationDemo from "@/component/Common/Pagination";

const ManageReturnRequests = () => {
  const dispatch = useDispatch();
  const {
    returnRequests = [],
    returnRequestsLoading,
    returnRequestsTotalPages,
  } = useSelector((state) => state.order);

  console.log("returnRequests", returnRequests);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState(null);

  useEffect(() => {
    dispatch(fetchAllReturnRequests({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handleStatusChange = async (returnRequestId, status) => {
    if (!returnRequestId || !status) return;

    if (status === "InitiateRefund") {
      try {
        await dispatch(initiateReturnRefund(returnRequestId)).unwrap();
        toast.success("Refund initiated successfully!");
      } catch (error) {
        toast.error("Failed to initiate refund.");
        console.error(error);
      }
    } else {
      try {
        await dispatch(
          updateReturnRequestStatus({
            returnRequestId,
            status,
          })
        ).unwrap();
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

  return (
    <div className="bg-[#0f172a] min-h-screen text-slate-300 relative px-4 py-4">
      {returnRequestsLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <Loader message="Fetching return requests..." />
        </div>
      )}
      {/* <div className="mx-auto bg-[rgba(30,30,47,0.6)] backdrop-blur-lg border-r border-white/10 text-white rounded-lg shadow-xl p-4 lg:p-6"> */}
      <div className="p-2 lg:p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">
          Manage Return Requests
        </h1>
        {returnRequests?.length === 0 && !returnRequestsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Inbox className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-xl font-semibold mb-2">
              No return requests found
            </p>
            <p className="text-md">
              There are currently no pending or processed return requests.
            </p>
          </div>
        ) : returnRequests?.length > 0 && !returnRequestsLoading ? (
          <>
          <div className="border-t border-gray-700 mb-6"></div>
            <ReturnRequestTable
              returnRequests={
                Array.isArray(returnRequests) ? returnRequests : []
              }
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
            <PaginationDemo
              currentPage={currentPage}
              totalPages={returnRequestsTotalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : null}
      </div>
      {/* </div> */}
      <ReturnRequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        returnRequest={returnRequests}
        onUpdateStatus={handleStatusChange}
      />
    </div>
  );
};

export default ManageReturnRequests;
