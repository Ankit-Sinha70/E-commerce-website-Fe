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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Select a new status for this order.
            </DialogDescription>
          </DialogHeader>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-full border rounded px-3 py-2 mt-4">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status, idx) => (
                <SelectItem
                  key={status}
                  value={status}
                  disabled={idx < currentIndex} // Disable previous statuses
                >
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={onUpdate}>Update</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default OrderStatusDialog;