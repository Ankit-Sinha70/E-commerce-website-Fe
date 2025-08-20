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
import Loader from "@/component/Common/Loader";
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
      <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[90vh] bg-gray-900 text-white shadow-xl rounded-lg border border-gray-700 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Order Details - <span className="text-blue-500">{order?._id}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Comprehensive information about the selected order.
          </DialogDescription>
        </DialogHeader>
        {order ? (
          <div
            ref={orderDetailsRef}
            className="pdf-export rounded-lg p-6 space-y-6"
          >
            {/* Customer Information */}
            <section className="border rounded-lg p-4 bg-gray-800 border-gray-700 shadow-md text-gray-300">
              <h2 className="flex items-center text-lg font-semibold mb-2 text-white">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Customer Information
              </h2>
              <div className="text-gray-400 space-y-1">
                <div>
                  <span className="font-semibold text-gray-300">Name:</span>{" "}
                  {order?.user?.name}
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Email:</span>{" "}
                  {order?.user?.email}
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Order Date:</span>{" "}
                  {new Date(order.updatedAt).toLocaleString()}
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="border rounded-lg p-4 bg-gray-800 border-gray-700 shadow-md text-gray-300">
              <h2 className="flex items-center text-lg font-semibold mb-2 text-white">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                Delivery Address
              </h2>
              <div className="text-gray-400 space-y-1">
                <div>
                  <span className="font-semibold text-gray-300">Name:</span>{" "}
                  {order?.shippingAddress?.fullName}
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Address:</span>{" "}
                  {order?.shippingAddress?.addressLine}
                </div>
                <div>
                  <span className="font-semibold text-gray-300">City:</span>{" "}
                  {order?.shippingAddress?.city}
                </div>
                <div>
                  <span className="font-semibold text-gray-300">State:</span>{" "}
                  {order?.shippingAddress?.state}
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Country:</span>{" "}
                  {order?.shippingAddress?.country}
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Postal Code:</span>{" "}
                  {order?.shippingAddress?.postalCode}
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Phone:</span>{" "}
                  {order?.shippingAddress?.phoneNumber}
                </div>
              </div>
            </section>

            {/* Order Items */}
            <section className="border rounded-lg p-4 bg-gray-800 border-gray-700 shadow-md text-gray-300">
              <h2 className="flex items-center text-lg font-semibold mb-2 text-white">
                <Package className="h-5 w-5 mr-2 text-green-500" />
                Order Items
              </h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="p-2 border border-gray-600">Image</th>
                    <th className="p-2 border border-gray-600">Name</th>
                    <th className="p-2 border border-gray-600">Category</th>
                    <th className="p-2 border border-gray-600">Product ID</th>
                    <th className="p-2 border border-gray-600">Qty</th>
                    <th className="p-2 border border-gray-600">Price</th>
                    <th className="p-2 border border-gray-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={item._id || idx} className="text-center text-gray-300">
                        <td className="p-2 border border-gray-600">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded shadow-md"
                          />
                        </td>
                        <td className="p-2 border border-gray-600">{item.name}</td>
                        <td className="p-2 border border-gray-600">{item.category}</td>
                        <td className="p-2 border border-gray-600">{item.productId}</td>
                        <td className="p-2 border border-gray-600">{item.quantity}</td>
                        <td className="p-2 border border-gray-600">{item.price} AED</td>
                        <td className="p-2 border border-gray-600 font-semibold">
                          {(item.quantity * item.price).toFixed(2)} AED
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-2 border border-gray-600 text-gray-500">
                        No items found for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Order Summary */}
            <section className="border rounded-lg p-4 bg-gray-800 border-gray-700 shadow-md flex flex-col md:flex-row justify-between items-center text-gray-300">
              <div className="text-xl font-bold text-white">
                Order Total:{" "}
                <span className="text-blue-500">{order.totalAmount} AED</span>
              </div>
              <div className="text-lg font-semibold text-white mt-2 md:mt-0">
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
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center shadow-md"
            disabled={exporting}
          >
            <FileText className="h-4 w-4 mr-2" />{" "}
            {exporting ? "Exporting..." : "Export to PDF"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="text-gray-400">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;