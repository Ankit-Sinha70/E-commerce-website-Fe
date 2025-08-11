import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchUserReturnRequest, cancelReturnRequest } from '@/features/order/orderSlice';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { OrderItemDetails } from '@/pages/user/MyOrdersPage';
import { format } from 'date-fns';
import { Eye, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';
import PaginationDemo from "@/component/common/Pagination";

const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
        case "requested":
            return "bg-yellow-200 text-yellow-800";
        case "approved":
            return "bg-purple-200 text-purple-800";
        case "rejected":
            return "bg-red-200 text-red-800";
        case "picked":
            return "bg-blue-200 text-blue-800";
        case "cancelled":
            return "bg-red-200 text-red-800";
        case "refunded":
            return "bg-green-200 text-green-800";
        default:
            return "bg-gray-200 text-gray-800";
    }
};

const getRefundStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
        case "pending":
            return "bg-yellow-200 text-yellow-800";
        case "initiated":
            return "bg-purple-200 text-purple-800";
        case "succeeded":
            return "bg-green-200 text-green-800";
        case "failed":
            return "bg-red-200 text-red-800";
        default:
            return "bg-gray-200 text-gray-800";
    }
};

const ReturnRequest = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        returnRequests,
        cancelLoading,
        cancelError,
        returnRequestsTotalPages,
        returnRequestsLimit,
    } = useSelector((state) => state.order);
    console.log('returnRequestsLimit', returnRequestsLimit)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedReturnRequest, setSelectedReturnRequest] = useState(null);
    const [selectedReturnRequestId, setSelectedReturnRequestId] = useState(null);
    // Local page state
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (user?._id) {
            dispatch(
                fetchUserReturnRequest({
                    userId: user?._id,
                    page: currentPage,
                    limit: returnRequestsLimit || 10,
                })
            );
        }
    }, [dispatch, user, currentPage, returnRequestsLimit]);

    const handlePageChange = (page) => {
        if (page === currentPage) return;
        setCurrentPage(page);
        if (user?._id) {
            dispatch(
                fetchUserReturnRequest({
                    userId: user?._id,
                    page,
                    limit: returnRequestsLimit || 10,
                })
            );
        }
    };

    const handleViewDetails = (returnRequest) => {
        setSelectedReturnRequest(returnRequest);
        setIsDialogOpen(true);
    };

    const handleCancelReturn = async () => {
        if (selectedReturnRequestId) {
            try {
                await dispatch(cancelReturnRequest(selectedReturnRequestId)).unwrap();
                toast.success("Return request cancelled successfully");
                setSelectedReturnRequestId(null);
                // Refresh current page
                dispatch(
                    fetchUserReturnRequest({
                        userId: user?._id,
                        page: currentPage,
                        limit: returnRequestsLimit || 10,
                    })
                );
            } catch (err) {
                const errorMessage = err.message || (typeof err === 'string' ? err : "Failed to cancel return request");
                toast.error(errorMessage);
            }
        }
    }

    return (
        <div className="max-w-8xl mx-auto">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <div className="rounded-lg overflow-hidden shadow-md bg-white">
                    <div className="overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Return Request ID
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Products
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Return Date
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-middle text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Status
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-middle text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Amount
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Items
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-100">
                                {returnRequests?.map((returnRequest) => {
                                    const returnRequestDate = new Date(returnRequest.requestedAt);
                                    const numberOfItems = returnRequest.items ? returnRequest.items.length : 0;

                                    return (
                                        <TableRow
                                            key={returnRequest._id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="px-4 py-3 font-mono text-sm text-gray-700">
                                                {returnRequest._id}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 font-mono text-sm text-gray-700">
                                                {returnRequest.items.length > 1
                                                    ? `${returnRequest.items[0].name},...`
                                                    : returnRequest.items[0]?.name || "—"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm text-gray-600 text-left">
                                                {format(returnRequestDate, "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-middle">
                                                <span
                                                    className={`px-2 py-1 text-black rounded-full text-xs font-semibold ${getStatusClasses(
                                                        returnRequest.status
                                                    )}`}
                                                >
                                                    {returnRequest?.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-middle text-sm font-medium text-gray-800">
                                                {formatCurrency(returnRequest.refundAmount)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-right text-sm text-gray-600">
                                                {numberOfItems}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-right">
                                                <div className="flex flex-wrap gap-2 justify-end">
                                                    <DialogTrigger asChild>
                                                        <button
                                                            onClick={() => handleViewDetails(returnRequest)}
                                                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                                        >
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Details
                                                        </button>
                                                    </DialogTrigger>

                                                    {returnRequest.status?.toLowerCase() === "requested" && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <button
                                                                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                                                                    onClick={() =>
                                                                        setSelectedReturnRequestId(returnRequest._id)
                                                                    }
                                                                >
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                    Cancel
                                                                </button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Cancel Return Request
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to cancel this
                                                                        return request? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                    {cancelError && (
                                                                        <div className="text-red-500 text-sm">
                                                                            {cancelError}
                                                                        </div>
                                                                    )}
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel
                                                                        onClick={() => setSelectedReturnRequestId(null)}
                                                                    >
                                                                        No, keep return request
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        disabled={cancelLoading}
                                                                        onClick={handleCancelReturn}
                                                                    >
                                                                        {cancelLoading
                                                                            ? "Cancelling..."
                                                                            : "Yes, cancel return request"}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {returnRequestsTotalPages > 1 && (
                    <div className="p-4 border-t bg-white flex items-center justify-between">
                        <PaginationDemo
                            currentPage={currentPage}
                            totalPages={returnRequestsTotalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

                <DialogContent className="sm:max-w-[800px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {selectedReturnRequest && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    Return Request Details: {selectedReturnRequest._id?.substring(0, 25)}
                                </DialogTitle>
                                <DialogDescription>
                                    Details of your return request placed on{" "}
                                    {format(
                                        new Date(selectedReturnRequest.requestedAt),
                                        "MMMM d, yyyy 'at' hh:mm a"
                                    )}
                                    .
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Reason for Return</h3>
                                    <p className="text-gray-700">
                                        {selectedReturnRequest.reason || "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Comment</h3>
                                    <p className="text-gray-700">
                                        {selectedReturnRequest.comment || "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                        Return Items
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedReturnRequest.items.map((item, index) => (
                                            <OrderItemDetails key={index} item={item} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                        Return Information
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                        <p className="text-gray-700">
                                            <strong>Recipient:</strong>{" "}
                                            {selectedReturnRequest?.pickUpAddress?.fullName || "Customer Name"}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Address:</strong>{" "}
                                            {selectedReturnRequest?.pickUpAddress?.addressLine}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Phone:</strong>{" "}
                                            {selectedReturnRequest?.pickUpAddress?.phoneNumber}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>City:</strong> {selectedReturnRequest?.pickUpAddress?.city}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Postal Code:</strong>{" "}
                                            {selectedReturnRequest?.pickUpAddress?.postalCode}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>State</strong> {selectedReturnRequest?.pickUpAddress?.state}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Country</strong>{" "}
                                            {selectedReturnRequest?.pickUpAddress?.country}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                        Return Details
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                        <p className="text-gray-700">
                                            <strong>Refund Status:</strong>{" "}
                                            <span
                                                className={`px-2 py-1 text-black rounded-full text-xs font-semibold ${getRefundStatusClasses(
                                                    selectedReturnRequest?.status
                                                )}`}
                                            >
                                                {selectedReturnRequest?.status}
                                            </span>
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Refund Amount:</strong>{" "}
                                            {formatCurrency(selectedReturnRequest?.refundAmount)}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Refund Date:</strong>{" "}
                                            {selectedReturnRequest?.refundedAt ? format(new Date(selectedReturnRequest?.refundedAt), "MMM d, yyyy") : "N/A"}
                                        </p>

                                        {selectedReturnRequest?.refundStatus === "Failed" && (
                                            <p className="text-gray-700">
                                                <strong>Refund Failed Reason:</strong>{" "}
                                                {selectedReturnRequest?.refundFailureReason || "Not specified"}
                                            </p>
                                        )}

                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <button
                                    onClick={() => setIsDialogOpen(false)}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                                >
                                    Close
                                </button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ReturnRequest
