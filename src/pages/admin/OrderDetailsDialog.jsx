import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/component/common/Loader";
import { getStatusBadge } from "../../lib/orderUtils";
import { FileText, MapPin, Package, User } from "lucide-react";
import { useRef, useState } from "react";
import html2pdf from "html2pdf.js";

const OrderDetailsDialog = ({ open, onOpenChange, order }) => {
  const orderDetailsRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  // PDF export handler
  const handleExportToPDF = async () => {
    if (!orderDetailsRef.current) return;
    setExporting(true);
    const element = orderDetailsRef.current;

    // PDF options
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Order_${order?._id || "Details"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(element).save();
    setExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[90vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 ">
            Order Details - <span className="text-blue-600">{order?._id}</span>
          </DialogTitle>
          <DialogDescription>
            Comprehensive information about the selected order.
          </DialogDescription>
        </DialogHeader>
        {order ? (
          <div
            ref={orderDetailsRef}
            className="pdf-export bg-white rounded-lg p-6 space-y-6"
          >
            {/* Customer Information */}
            <section className="border rounded-lg p-4 bg-gray-50">
              <h2 className="flex items-center text-lg font-semibold mb-2">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Customer Information
              </h2>
              <div className="text-gray-700 space-y-1">
                <div>
                  <span className="font-semibold">Name:</span>{" "}
                  {order?.user?.name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  {order?.user?.email}
                </div>
                <div>
                  <span className="font-semibold">Order Date:</span>{" "}
                  {new Date(order.updatedAt).toLocaleString()}
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="border rounded-lg p-4 bg-gray-50">
              <h2 className="flex items-center text-lg font-semibold mb-2">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                Delivery Address
              </h2>
              <div className="text-gray-700 space-y-1">
                <div>
                  <span className="font-semibold">Name:</span>{" "}
                  {order?.shippingAddress?.fullName}
                </div>
                <div>
                  <span className="font-semibold">Address:</span>{" "}
                  {order?.shippingAddress?.addressLine}
                </div>
                <div>
                  <span className="font-semibold">City:</span>{" "}
                  {order?.shippingAddress?.city}
                </div>
                <div>
                  <span className="font-semibold">State:</span>{" "}
                  {order?.shippingAddress?.state}
                </div>
                <div>
                  <span className="font-semibold">Country:</span>{" "}
                  {order?.shippingAddress?.country}
                </div>
                <div>
                  <span className="font-semibold">Postal Code:</span>{" "}
                  {order?.shippingAddress?.postalCode}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span>{" "}
                  {order?.shippingAddress?.phoneNumber}
                </div>
              </div>
            </section>

            {/* Order Items */}
            <section className="border rounded-lg p-4 bg-gray-50">
              <h2 className="flex items-center text-lg font-semibold mb-2">
                <Package className="h-5 w-5 mr-2 text-green-500" />
                Order Items
              </h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Image</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Product ID</th>
                    <th className="p-2 border">Qty</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={item._id || idx} className="text-center">
                        <td className="p-2 border">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </td>
                        <td className="p-2 border">{item.name}</td>
                        <td className="p-2 border">{item.category}</td>
                        <td className="p-2 border">{item.productId}</td>
                        <td className="p-2 border">{item.quantity}</td>
                        <td className="p-2 border">{item.price} AED</td>
                        <td className="p-2 border font-semibold">
                          {(item.quantity * item.price).toFixed(2)} AED
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-2 border text-gray-500">
                        No items found for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Order Summary */}
            <section className="border rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-center">
              <div className="text-xl font-bold text-gray-800">
                Order Total:{" "}
                <span className="text-blue-700">{order.totalAmount} AED</span>
              </div>
              <div className="text-lg font-semibold text-gray-800 mt-2 md:mt-0">
                Current Status:{" "}
                <span
                  className={`ml-2 px-4 py-1 rounded-full font-bold ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </section>
          </div>
        ) : (
          <Loader message="Loading..." />
        )}
        <DialogFooter className="mt-6">
          <Button
            onClick={handleExportToPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center"
            disabled={exporting}
          >
            <FileText className="h-4 w-4 mr-2" />{" "}
            {exporting ? "Exporting..." : "Export to PDF"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
