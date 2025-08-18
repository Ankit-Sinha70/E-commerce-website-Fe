import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye } from "lucide-react";
const statusClasses = {
  Approved: "bg-green-300 text-green-800 border-green-200",
  Picked: "bg-blue-300 text-blue-800 border-blue-200",
  Refunded: "bg-purple-300 text-purple-800 border-purple-200",
  Rejected: "bg-red-300 text-red-800 border-red-200",
  Requested: "bg-yellow-300 text-yellow-800 border-yellow-200",
};
export const isRefundProceed = (refundStatus) => {
  switch (refundStatus) {
    case "Pending":
      return false;
    case "Initiated":
      return true;
    case "Succeeded":
      return true;
    case "Failed":
      return false;
    default:
      return false;
  }
}

function getStatusBadge(status) {
  return (
    <span
      className={`px-3 py-2 rounded-full text-xs font-semibold border ${statusClasses[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
    >
      {status}
    </span>
  );
}

const ReturnRequestTable = ({
  returnRequests,
  onStatusChange,
  onViewDetails,
}) => {
  console.log('returnRequestsssssss', returnRequests)

  const isStatusDisabled = (currentStatus, optionStatus) => {
    switch (currentStatus) {
      case "Requested":
        return !["Approved", "Rejected"].includes(optionStatus);
      case "Approved":
        return optionStatus !== "Picked";
      case "Picked":
        return optionStatus !== "InitiateRefund";
      default:
        return true;
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-lg shadow-xl">
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr className="bg-gray-700 text-white text-left p-2">
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Order Name</td>
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">User</td>
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Reason</td>
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Status</td>
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">Actions</td>
            </tr>
          </thead>
          <tbody className="text-left">
            {returnRequests?.map((returnRequest) => (
              <tr key={returnRequest._id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-white">{returnRequest.items.map((item) => item.name).join(', ')}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-400">{returnRequest.user?.name || 'Guest'}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{returnRequest.reason}</td>
                <td className="px-6 py-4">{getStatusBadge(returnRequest.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center items-center space-x-2">
                    <Select
                      onValueChange={(value) => onStatusChange(returnRequest._id, value)}
                      value={returnRequest.status}
                      disabled={["Rejected", "Refunded"].includes(returnRequest.status)}
                    >
                      <SelectTrigger className="w-[150px] bg-gray-700 text-white border-gray-600 shadow-md">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-white">
                        <SelectItem 
                          value="Approved" 
                          disabled={isStatusDisabled(returnRequest.status, "Approved")}
                          className="hover:bg-gray-600"
                        >
                          Approve
                        </SelectItem>
                        <SelectItem 
                          value="Rejected" 
                          disabled={isStatusDisabled(returnRequest.status, "Rejected")}
                          className="hover:bg-gray-600"
                        >
                          Reject
                        </SelectItem>
                        <SelectItem 
                          value="Picked" 
                          disabled={isStatusDisabled(returnRequest.status, "Picked")}
                          className="hover:bg-gray-600"
                        >
                          Mark as Picked
                        </SelectItem>
                        <SelectItem 
                          value="InitiateRefund" 
                          disabled={isStatusDisabled(returnRequest.status, "InitiateRefund") || isRefundProceed(returnRequest.refundStatus)}
                          className="hover:bg-gray-600"
                        >
                          Initiate Refund
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 shadow-md"
                          onClick={() => onViewDetails(returnRequest)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
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
        {returnRequests?.map((returnRequest) => (
          <div
            key={returnRequest._id}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-white">
                  {returnRequest.items.map((item) => item.name).join(", ")}
                </p>
                <p className="text-sm text-gray-500">
                  {returnRequest.user?.name || "Guest"}
                </p>
                <p className="text-sm text-gray-500">
                  {returnRequest?.reason}
                </p>
              </div>
              {getStatusBadge(returnRequest?.status)}
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Select
                onValueChange={(value) => onStatusChange(returnRequest._id, value)}
                value={returnRequest.status}
                disabled={["Rejected", "Refunded"].includes(returnRequest.status)}
              >
                <SelectTrigger className="flex-grow bg-gray-700 text-white border-gray-600 shadow-md">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white">
                  <SelectItem 
                    value="Approved" 
                    disabled={isStatusDisabled(returnRequest.status, "Approved")}
                    className="hover:bg-gray-600"
                  >
                    Approve
                  </SelectItem>
                  <SelectItem 
                    value="Rejected" 
                    disabled={isStatusDisabled(returnRequest.status, "Rejected")}
                    className="hover:bg-gray-600"
                  >
                    Reject
                  </SelectItem>
                  <SelectItem 
                    value="Picked" 
                    disabled={isStatusDisabled(returnRequest.status, "Picked")}
                    className="hover:bg-gray-600"
                  >
                    Mark as Picked
                  </SelectItem>
                  <SelectItem 
                    value="InitiateRefund" 
                    disabled={isStatusDisabled(returnRequest.status, "InitiateRefund") || isRefundProceed(returnRequest.refundStatus)}
                    className="hover:bg-gray-600"
                  >
                    Initiate Refund
                  </SelectItem>
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 shadow-md"
                    onClick={() => onViewDetails(returnRequest._id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
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
