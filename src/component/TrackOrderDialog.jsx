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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Track Order</DialogTitle>
          <DialogDescription>
            {trackingId && (
              <span className="font-mono text-xs text-gray-500">
                Tracking ID: #{trackingId}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        {trackingLoading && <div>Loading tracking info...</div>}
        {trackingError && (
          <div className="text-red-500">Error: {trackingError}</div>
        )}
        {tracking && (
          <div>
            <div className="mb-2">
              <span className="font-semibold">Status:</span> {tracking.status}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Estimated Delivery:</span>{" "}
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
              <span className="font-semibold">Current Location:</span>{" "}
              {tracking.currentLocation || "N/A"}
            </div>
            <div className="flex flex-col gap-2">
              {tracking.trackingHistory?.map((item, idx) => {
                const stepStatus = getStepStatus(idx, currentStepIdx);
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-lg w-6 text-center">
                      {statusIcons[stepStatus]}
                    </span>
                    <div>
                      <div className="font-medium">{item.status}</div>
                      <div className="text-xs text-gray-500 flex flex-col">
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
          <Button variant="outline" onClick={() => onClose(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
