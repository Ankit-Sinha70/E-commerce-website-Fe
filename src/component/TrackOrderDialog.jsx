import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearTracking, trackOrder } from "@/features/order/orderSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; 

const statusIcons = {
  completed: "✓",
  current: "🔄",
  pending: " ",
};

function getStepStatus(idx, currentIdx) {
  if (idx < currentIdx) return "completed";
  if (idx === currentIdx) return "current";
  return "pending";
}

export default function TrackOrderDialog({
  isOpen,
  onClose,
  trackingId,
  estimatedDeliveryDate,
}) {
  const dispatch = useDispatch();
  const { tracking, trackingLoading, trackingError } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    if (isOpen && trackingId) {
      dispatch(trackOrder(trackingId));
    }
    return () => {
      dispatch(clearTracking());
    };
  }, [dispatch, isOpen, trackingId]);

  // Find the current step index
  let currentStepIdx = -1;
  if (tracking?.trackingHistory?.length) {
    currentStepIdx = tracking.trackingHistory.findIndex(
      (item) => item.status === tracking.status
    );
    if (currentStepIdx === -1)
      currentStepIdx = tracking.trackingHistory.length - 1;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-lg text-slate-300">
        <DialogHeader className="border-b border-gray-700 pb-2">
          <DialogTitle className="text-white">Track Order</DialogTitle>
          <DialogDescription className="text-gray-400">
            {trackingId && (
              <span className="font-mono text-xs text-gray-400">
                Tracking ID: #{trackingId}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        {trackingLoading && <div className="text-gray-400">Loading tracking info...</div>}
        {trackingError && (
          <div className="text-red-500">Error: {trackingError}</div>
        )}
        {tracking && (
          <div className="space-y-3">
            <div className="mb-2">
              <span className="font-semibold text-slate-300">Status:</span> <span className="text-gray-300">{tracking.status}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-slate-300">Estimated Delivery:</span>{" "}
              {estimatedDeliveryDate
                ? new Date(estimatedDeliveryDate).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })
                : "N/A"}
            </div>

            <div className="mb-4">
              <span className="font-semibold text-slate-300">Current Location:</span>{" "}
              <span className="text-gray-300">{tracking.currentLocation || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-2">
              {tracking.trackingHistory?.map((item, idx) => {
                const stepStatus = getStepStatus(idx, currentStepIdx);
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <span className={`text-lg w-6 text-center ${stepStatus === 'completed' ? 'text-green-500' : stepStatus === 'current' ? 'text-blue-500' : 'text-gray-500'}`}>
                      {statusIcons[stepStatus]}
                    </span>
                    <div>
                      <div className="font-medium text-slate-300">{item.status}</div>
                      <div className="text-xs text-gray-400 flex flex-col">
                        <span>
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleDateString()
                            : "Pending"}
                        </span>
                        {item.location && <span>📍 {item.location}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Optionally show the next step if not delivered */}
              {tracking.status !== "delivered" && (
                <div className="flex items-start gap-2 opacity-60">
                  {/* <span className="text-lg w-6 text-center">[ ]</span> */}
                  {/* <div>
                    <div className="font-medium">Delivered</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div> */}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="outline" className="text-slate-300 border-gray-700 hover:bg-gray-300" onClick={() => onClose(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
