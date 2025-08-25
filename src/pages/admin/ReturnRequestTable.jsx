import React, { useEffect, useState } from "react";
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
  Approved: "bg-green-400 text-green-800 border-green-200",
  Picked: "bg-blue-400 text-blue-800 border-blue-200",
  Refunded: "bg-purple-400 text-purple-800 border-purple-200",
  Rejected: "bg-red-400 text-red-800 border-red-200",
  Requested: "bg-yellow-400 text-yellow-800 border-yellow-200",
};

function getStatusBadge(status, refundStatus) {
  const baseClass =
    statusClasses[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-3 py-2 rounded-full text-xs font-semibold border ${baseClass}`}
      >
        {status}
      </span>
      {refundStatus && (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
            // map common refundStatus values to styles
            refundStatus.toLowerCase() === "initiated"
              ? "bg-purple-200 text-purple-800"
              : refundStatus.toLowerCase() === "succeeded"
              ? "bg-green-200 text-green-800"
              : refundStatus.toLowerCase() === "failed"
              ? "bg-red-200 text-red-800"
              : "bg-yellow-200 text-yellow-800"
          }`}
        >
          {refundStatus}
        </span>
      )}
    </div>
  );
}

const ReturnRequestTable = ({
  returnRequests,
  onStatusChange,
  /**
   * Optional: function fetchUpdatedRequest(id) => Promise<updatedRequest>
   * Parent should provide this if status changes may be completed asynchronously (e.g. webhook).
   */
  fetchUpdatedRequest,
  onViewDetails,
}) => {
  // local copy so we can optimistically update UI
  const [localRequests, setLocalRequests] = useState(returnRequests || []);

  useEffect(() => {
    setLocalRequests(returnRequests || []);
  }, [returnRequests]);

  // small helper to poll for an updated request (used when refund is async)
  const pollForUpdate = async (id, tries = 6, interval = 1000) => {
    if (typeof fetchUpdatedRequest !== "function") return null;
    for (let i = 0; i < tries; i++) {
      try {
        const updated = await fetchUpdatedRequest(id);
        if (updated) {
          // consider refund finished if refundStatus indicates succeeded/refunded
          const rs = (updated.refundStatus || "").toLowerCase();
          if (rs === "succeeded" || rs === "refunded" || updated.status === "Refunded") {
            return updated;
          }
          // also return if status changed (non-refund paths)
          if (updated.status && updated.status !== localRequests.find(r=>r._id===id)?.status) {
            return updated;
          }
        }
      } catch (err) {
        // ignore and retry
      }
      // wait
      await new Promise((res) => setTimeout(res, interval));
    }
    return null;
  };

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

  const handleSelectChange = async (id, value) => {
    // keep previous state for rollback
    const prev = localRequests;

    // optimistic update
    setLocalRequests((prevList) =>
      prevList.map((r) => {
        if (r._id !== id) return r;
        if (value === "InitiateRefund") {
          return { ...r, refundStatus: "Initiated" };
        }
        return { ...r, status: value };
      })
    );

    if (typeof onStatusChange === "function") {
      try {
        // onStatusChange should ideally return the updated request from server
        const res = await onStatusChange(id, value);

        if (res && typeof res === "object" && res._id) {
          // merge server-updated object immediately
          setLocalRequests((prevList) =>
            prevList.map((r) => (r._id === res._id ? { ...r, ...res } : r))
          );
          return;
        }

        // If the action was to initiate an async refund and parent provided fetchUpdatedRequest,
        // poll backend for final status and merge when available.
        if (value === "InitiateRefund" && typeof fetchUpdatedRequest === "function") {
          const updated = await pollForUpdate(id, 8, 1500); // try ~12s total
          if (updated) {
            setLocalRequests((prevList) =>
              prevList.map((r) => (r._id === updated._id ? { ...r, ...updated } : r))
            );
            return;
          }
        }

        // otherwise assume success; you may rely on parent to refresh props
      } catch (err) {
        // rollback on error
        console.error("Failed to update status/refund:", err);
        setLocalRequests(prev);
      }
    }
  };
  
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-lg shadow-xl">
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr className="bg-gray-700 text-white text-left p-2">
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">
                Order Name
              </td>
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">
                User
              </td>
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">
                Reason
              </td>
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">
                Status
              </td>
              <td className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                Actions
              </td>
            </tr>
          </thead>
          <tbody className="text-left">
            {localRequests?.map((returnRequest) => (
              <tr
                key={returnRequest._id}
                className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-white">
                  {returnRequest.items.map((item) => item.name).join(", ")}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-400">
                  {returnRequest.user?.name || "Guest"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {returnRequest.reason}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(returnRequest.status, returnRequest.refundStatus)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center items-center space-x-2">
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange(returnRequest._id, value)
                      }
                      value={returnRequest.status}
                      disabled={["Rejected", "Refunded"].includes(
                        returnRequest.status
                      )}
                    >
                      <SelectTrigger className="w-[150px] bg-gray-700 text-white border-gray-600 shadow-md">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-white">
                        <SelectItem
                          value="Approved"
                          disabled={isStatusDisabled(
                            returnRequest.status,
                            "Approved"
                          )}
                          className="hover:bg-gray-600"
                        >
                          Approve
                        </SelectItem>
                        <SelectItem
                          value="Rejected"
                          disabled={isStatusDisabled(
                            returnRequest.status,
                            "Rejected"
                          )}
                          className="hover:bg-gray-600"
                        >
                          Reject
                        </SelectItem>
                        <SelectItem
                          value="Picked"
                          disabled={isStatusDisabled(
                            returnRequest.status,
                            "Picked"
                          )}
                          className="hover:bg-gray-600"
                        >
                          Mark as Picked
                        </SelectItem>
                        <SelectItem
                          value="InitiateRefund"
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
        {localRequests?.map((returnRequest) => (
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
                <p className="text-sm text-gray-500">{returnRequest?.reason}</p>
              </div>
              {getStatusBadge(returnRequest?.status, returnRequest?.refundStatus)}
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Select
                onValueChange={(value) =>
                  handleSelectChange(returnRequest._id, value)
                }
                value={returnRequest.status}
                disabled={["Rejected", "Refunded"].includes(
                  returnRequest.status
                )}
              >
                <SelectTrigger className="flex-grow bg-gray-700 text-white border-gray-600 shadow-md">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white">
                  <SelectItem
                    value="Approved"
                    disabled={isStatusDisabled(
                      returnRequest.status,
                      "Approved"
                    )}
                    className="hover:bg-gray-600"
                  >
                    Approve
                  </SelectItem>
                  <SelectItem
                    value="Rejected"
                    disabled={isStatusDisabled(
                      returnRequest.status,
                      "Rejected"
                    )}
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
                    disabled={
                      isStatusDisabled(
                        returnRequest.status,
                        "InitiateRefund"
                      ) || returnRequest.refundStatus
                    }
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
