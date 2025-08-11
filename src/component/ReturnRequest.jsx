import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchUserReturnRequest, cancelReturnRequest } from '@/features/order/orderSlice';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { OrderItemDetails } from '@/pages/user/MyOrdersPage';
import { format } from 'date-fns';
import { Eye, XCircle, Package, RotateCcw, Calendar, CreditCard, MapPin, Clock, AlertTriangle, CheckCircle, RefreshCw, Ban, DollarSign, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';
import PaginationDemo from "@/component/common/Pagination";
import { Button } from '@/components/ui/button';

const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
        case "requested":
            return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200";
        case "approved":
            return "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200";
        case "rejected":
            return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200";
        case "picked":
            return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200";
        case "cancelled":
            return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
        case "refunded":
            return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200";
        default:
            return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
    }
};

const getRefundStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
        case "pending":
            return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200";
        case "initiated":
            return "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200";
        case "succeeded":
            return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200";
        case "failed":
            return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200";
        default:
            return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
    }
};

const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
        case "requested":
            return <Clock className="w-3 h-3" />;
        case "approved":
            return <CheckCircle className="w-3 h-3" />;
        case "rejected":
            return <XCircle className="w-3 h-3" />;
        case "picked":
            return <Package className="w-3 h-3" />;
        case "cancelled":
            return <Ban className="w-3 h-3" />;
        case "refunded":
            return <DollarSign className="w-3 h-3" />;
        default:
            return <RefreshCw className="w-3 h-3" />;
    }
};

// Return Request Card Component
const ReturnRequestCard = ({ returnRequest, onViewDetails, onCancelReturn }) => {
    const returnRequestDate = new Date(returnRequest.requestedAt);
    const numberOfItems = returnRequest.items ? returnRequest.items.length : 0;

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(returnRequest.status)}`}>
                    {getStatusIcon(returnRequest.status)}
                    <span>{returnRequest.status}</span>
                </span>
            </div>

            <div className="p-6">
                {/* Return Request Header */}
                <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate pr-4">
                            Return Request
                        </h3>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(returnRequestDate, "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {numberOfItems} item{numberOfItems !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Product Preview */}
                <div className="mb-4">
                    <div className="flex items-center space-x-3">
                        {returnRequest.items[0]?.image && (
                            <div className="relative">
                                <img
                                    src={returnRequest.items[0].image || "https://via.placeholder.com/48"}
                                    alt={returnRequest.items[0].name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent rounded-lg"></div>
                            </div>
                        )}
                        <div className="flex-grow">
                            <p className="font-medium text-gray-900 truncate mb-1">
                                {returnRequest.items.length > 1
                                    ? `${returnRequest.items[0].name} +${returnRequest.items.length - 1} more`
                                    : returnRequest.items[0]?.name || "—"}
                            </p>
                            <p className="text-lg font-bold text-orange-600">
                                {formatCurrency(returnRequest.refundAmount)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reason Preview */}
                {returnRequest.reason && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                        <p className="text-sm text-gray-600 mb-1 flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Reason:
                        </p>
                        <p className="text-sm font-medium text-gray-800 truncate">
                            {returnRequest.reason}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(returnRequest)}
                            className="flex-1 min-w-[120px] bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </Button>
                    </DialogTrigger>

                    {returnRequest.status?.toLowerCase() === "requested" && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                                    onClick={() => onCancelReturn(returnRequest._id)}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Return Request</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to cancel this return request? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>No, keep return request</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onCancelReturn(returnRequest._id)}>
                                        Yes, cancel return request
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReturnRequest = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        returnRequests,
        returnRequestsTotalPages,
        returnRequestsLimit,
    } = useSelector((state) => state.order);
    
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

    const handleCancelReturn = async (returnRequestId) => {
        setSelectedReturnRequestId(returnRequestId);
        try {
            await dispatch(cancelReturnRequest(returnRequestId)).unwrap();
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

    // Empty state
    if (returnRequests?.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center min-h-[60vh] bg-gradient-to-br from-orange-50 via-white to-red-50 rounded-2xl border border-gray-100">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <RotateCcw className="relative w-24 h-24 text-orange-400 mb-6" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">No Return Requests</h2>
                <p className="text-gray-600 text-lg mb-6 max-w-md">
                    You haven't made any return requests yet. When you do, they'll appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                {/* Return Request Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {returnRequests?.map((returnRequest) => (
                        <ReturnRequestCard
                            key={returnRequest._id}
                            returnRequest={returnRequest}
                            onViewDetails={handleViewDetails}
                            onCancelReturn={handleCancelReturn}
                        />
                    ))}
                </div>

                {/* Pagination Controls */}
                {returnRequestsTotalPages > 1 && (
                    <div className="flex items-center justify-center bg-white p-6 rounded-xl border border-gray-200">
                        <PaginationDemo
                            currentPage={currentPage}
                            totalPages={returnRequestsTotalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400">
                    {selectedReturnRequest && (
                        <>
                            <DialogHeader className="border-b border-gray-200 pb-4">
                                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                    <RotateCcw className="w-6 h-6 mr-2 text-orange-600" />
                                    Return Request Details
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                    Request ID: {selectedReturnRequest._id?.substring(0, 25)} • Created on{" "}
                                    {format(
                                        new Date(selectedReturnRequest.requestedAt),
                                        "MMMM d, yyyy 'at' hh:mm a"
                                    )}
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="py-6 space-y-8">
                                {/* Status Overview */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusClasses(selectedReturnRequest.status)}`}>
                                            {getStatusIcon(selectedReturnRequest.status)}
                                            <span>{selectedReturnRequest.status}</span>
                                        </span>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Refund Amount</p>
                                            <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedReturnRequest.refundAmount)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Return Reason & Comment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                            <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
                                            Reason for Return
                                        </h3>
                                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                                            <p className="text-gray-800 font-medium">
                                                {selectedReturnRequest.reason || "Not specified"}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                            <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                                            Comment
                                        </h3>
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                                            <p className="text-gray-800">
                                                {selectedReturnRequest.comment || "No additional comments"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Return Items */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <Package className="w-5 h-5 mr-2 text-green-600" />
                                        Return Items
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedReturnRequest.items.map((item, index) => (
                                            <OrderItemDetails key={index} item={item} />
                                        ))}
                                    </div>
                                </div>

                                {/* Pickup Address Information */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                                        Pickup Address
                                    </h3>
                                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Contact Person</p>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedReturnRequest?.pickUpAddress?.fullName || "Customer Name"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedReturnRequest?.pickUpAddress?.phoneNumber}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-gray-600 mb-1">Pickup Address</p>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedReturnRequest?.pickUpAddress?.addressLine}, {selectedReturnRequest?.pickUpAddress?.city}, {selectedReturnRequest?.pickUpAddress?.state} {selectedReturnRequest?.pickUpAddress?.postalCode}, {selectedReturnRequest?.pickUpAddress?.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Refund Details */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                                        Refund Details
                                    </h3>
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Refund Status</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRefundStatusClasses(selectedReturnRequest?.status)}`}>
                                                    {selectedReturnRequest?.status}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Refund Amount</p>
                                                <p className="font-bold text-lg text-gray-900">
                                                    {formatCurrency(selectedReturnRequest?.refundAmount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Refund Date</p>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedReturnRequest?.refundedAt 
                                                        ? format(new Date(selectedReturnRequest?.refundedAt), "MMM d, yyyy") 
                                                        : "Pending"
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {selectedReturnRequest?.refundStatus === "Failed" && (
                                            <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
                                                <p className="text-sm text-gray-600 mb-1">Refund Failed Reason</p>
                                                <p className="font-medium text-red-800">
                                                    {selectedReturnRequest?.refundFailureReason || "Not specified"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                                        Return Timeline
                                    </h3>
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">Return Request Created</p>
                                                    <p className="text-sm text-gray-600">
                                                        {format(new Date(selectedReturnRequest.requestedAt), "MMMM d, yyyy 'at' hh:mm a")}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {selectedReturnRequest.refundedAt && (
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Refund Processed</p>
                                                        <p className="text-sm text-gray-600">
                                                            {format(new Date(selectedReturnRequest.refundedAt), "MMMM d, yyyy 'at' hh:mm a")}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="border-t border-gray-200 pt-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsDialogOpen(false)}
                                    className="px-6"
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ReturnRequest