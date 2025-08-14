import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCancelledOrders, initiateRefund, setCurrentPage } from '../../features/order/cancelledOrderSlice';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const CancelledOrdersPage = () => {
  const dispatch = useDispatch();
  const { 
    orders, 
    loading, 
    pagination: { currentPage, totalPages, totalItems, itemsPerPage } 
  } = useSelector((state) => state.cancelledOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(getCancelledOrders({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  const handleInitiateRefund = async (orderId) => {
    const result = await dispatch(initiateRefund(orderId));
    if (initiateRefund.fulfilled.match(result)) {
      toast.success('Refund initiated successfully!');
    } else {
      toast.error('Failed to initiate refund.');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-[#0f172a] text-slate-300 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Cancelled Orders</h1>
        {totalItems > 0 && (
          <div className="text-sm text-slate-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} orders
          </div>
        )}
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-gray-800 border border-gray-700 rounded-lg shadow-md overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">{order.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{order.user?.name || 'Guest'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{order.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 border-gray-700"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>View Items</p></TooltipContent>
                      </Tooltip>
                      <Button 
                        onClick={() => handleInitiateRefund(order._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                        disabled={loading || order.refundStatus === 'Initiated' || order.refundStatus === 'Succeeded'}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (order.refundStatus === 'Initiated' ? 'Initiated' : (order.refundStatus === 'Succeeded' ? 'Refunded' : 'Initiate Refund'))}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  No cancelled orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-slate-300">Order #{order.orderId}</p>
                  <p className="text-sm text-slate-400">{order.user?.name || 'Guest'}</p>
                  <p className="text-sm text-slate-400">{order.email}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-700 text-slate-300"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => handleInitiateRefund(order._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-sm"
                    disabled={loading || order.refundStatus === 'Initiated' || order.refundStatus === 'Succeeded'}
                  >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : (order.refundStatus === 'Initiated' ? 'Initiated' : (order.refundStatus === 'Succeeded' ? 'Refunded' : 'Refund'))}
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-400">
            No cancelled orders found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 text-sm border-gray-700 text-slate-300 hover:bg-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="ml-3 px-4 py-2 text-sm border-gray-700 text-slate-300 hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Showing <span className="font-medium text-slate-300">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                <span className="font-medium text-slate-300">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                of <span className="font-medium text-slate-300">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-slate-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">First</span>
                  <ChevronsLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-slate-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-900/30 border-blue-500 text-blue-300'
                          : 'bg-gray-800 border-gray-700 text-slate-300 hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-slate-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-slate-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Last</span>
                  <ChevronsRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-gray-800 border border-gray-700 text-slate-300">
          <DialogHeader>
            <DialogTitle className="text-white">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-slate-300">Order ID</h3>
                  <p className="text-slate-400">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Order Date</h3>
                  <p className="text-slate-400">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Customer</h3>
                  <p className="text-slate-400">{selectedOrder.user?.name || 'Guest'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Email</h3>
                  <p className="text-slate-400">{selectedOrder.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Phone</h3>
                  <p className="text-slate-400">{selectedOrder.user?.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-300">Status</h3>
                  <p className="text-slate-400 capitalize">{selectedOrder.status}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2 text-slate-300">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-600 rounded overflow-hidden">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-300">{item.name}</p>
                          <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-slate-300">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="text-slate-300">₹{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Shipping</span>
                  <span className="text-slate-300">₹{selectedOrder.shippingFee}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2 mt-2">
                  <span className="text-white">Total</span>
                  <span className="text-white">₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CancelledOrdersPage;
