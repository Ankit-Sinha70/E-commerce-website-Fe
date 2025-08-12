// src/pages/admin/OrderStatusDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const OrderStatusDialog = ({
  open,
  onOpenChange,
  newStatus,
  setNewStatus,
  onUpdate,
  currentStatus, // <-- Add this prop
}) => {
  // Find the index of the current status
  const currentIndex = statusOptions.indexOf(currentStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-slate-300 shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Update Order Status</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select a new status for this order.
          </DialogDescription>
        </DialogHeader>
        <Select value={newStatus} onValueChange={setNewStatus}>
          <SelectTrigger className="w-full border rounded px-3 py-2 mt-4 bg-gray-700 text-white">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 text-white">
            {statusOptions.map((status, idx) => (
              <SelectItem
                key={status}
                value={status}
                disabled={idx < currentIndex} // Disable previous statuses
                className="hover:bg-gray-600"
              >
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button className="bg-blue-500 hover:bg-blue-700 text-white shadow-md" onClick={onUpdate}>Update</Button>
          <Button variant="outline" className="text-gray-400 hover:bg-gray-700 hover:text-gray-300 shadow-md" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusDialog;