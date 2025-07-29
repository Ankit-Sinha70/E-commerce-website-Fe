import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye } from 'lucide-react';

const statusClasses = {
  Approved: 'bg-green-300 text-green-800 border-green-200',
  Picked: 'bg-blue-300 text-blue-800 border-blue-200',
  Refunded: 'bg-purple-300 text-purple-800 border-purple-200',
  Rejected: 'bg-red-300 text-red-800 border-red-200',
  Pending: 'bg-yellow-300 text-yellow-800 border-yellow-200',
};

function getStatusBadge(status) {
  return (
    <span
      className={`px-3 py-2 rounded-full text-xs font-semibold border ${
        statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}>
      {status}
    </span>
  );
}

const ReturnRequestTable = ({ returnRequests, onStatusChange, onViewDetails }) => {
  console.log('returnRequests', returnRequests)
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-800 text-white text-left p-2">
              <td className="px-8 py-1 font-sm">Order Name</td>
              <td className="px-8 py-1 font-sm">User</td>
              <td className="px-8 py-1 font-sm">Reason</td>
              <td className="px-8 py-1 font-sm">Status</td>
              <td className="px-8 py-1 font-sm text-center">Actions</td>
            </tr>
          </thead>
          <tbody className="text-left">
            {returnRequests.map((order) => (
              <tr key={order._id} className="border-b last:border-b-0 hover:bg-gray-100 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.items.map((item) => item.name).join(', ')}</td>
                <td className="px-2 py-1 text-sm font-medium text-gray-900">{order.user?.name || 'Guest'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{order.returnRequest.reason}</td>
                <td className="px-6 py-4">{getStatusBadge(order.returnRequest.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center items-center space-x-2">
                    <Select 
                      onValueChange={(value) => onStatusChange(order._id, value)} 
                      defaultValue={order.returnRequest.status}
                      disabled={['Rejected', 'Refunded'].includes(order.returnRequest.status)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approved" disabled={order.returnRequest.status !== 'Pending'}>
                          Approve
                        </SelectItem>
                        <SelectItem value="Rejected" disabled={order.returnRequest.status !== 'Pending'}>
                          Reject
                        </SelectItem>
                        <SelectItem value="Picked" disabled={order.returnRequest.status !== 'Approved'}>
                          Mark as Picked
                        </SelectItem>
                        <SelectItem value="Refunded" disabled={order.returnRequest.status !== 'Picked'}>
                          Mark as Refunded
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-200"
                          onClick={() => onViewDetails(order._id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View Details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {returnRequests.map((order) => (
          <div key={order._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900">{order.items.map((item) => item.name).join(', ')}</p>
                <p className="text-sm text-gray-500">{order.user?.name || 'Guest'}</p>
                <p className="text-sm text-gray-500">{order.returnRequest.reason}</p>
              </div>
              {getStatusBadge(order.returnRequest.status)}
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Select 
                onValueChange={(value) => onStatusChange(order._id, value)} 
                defaultValue={order.returnRequest.status}
                disabled={['Rejected', 'Refunded'].includes(order.returnRequest.status)}
              >
                <SelectTrigger className="flex-grow">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved" disabled={order.returnRequest.status !== 'Pending'}>
                    Approve
                  </SelectItem>
                  <SelectItem value="Rejected" disabled={order.returnRequest.status !== 'Pending'}>
                    Reject
                  </SelectItem>
                  <SelectItem value="Picked" disabled={order.returnRequest.status !== 'Approved'}>
                    Mark as Picked
                  </SelectItem>
                  <SelectItem value="Refunded" disabled={order.returnRequest.status !== 'Picked'}>
                    Mark as Refunded
                  </SelectItem>
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-200"
                    onClick={() => onViewDetails(order._id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReturnRequestTable;
