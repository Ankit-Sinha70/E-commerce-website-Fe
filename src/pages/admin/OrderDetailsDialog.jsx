import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import html2pdf from "html2pdf.js";
import { FileText, MapPin, Package, User } from "lucide-react";
import { useRef, useState } from "react";
import { getStatusBadge } from "../../lib/orderUtils";
import { Loader } from "../../component/Common/Loader.jsx";

const OrderDetailsDialog = ({ open, onOpenChange, order }) => {
  const orderDetailsRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  // PDF export handler
  const handleExportToPDF = async () => {
    if (!orderDetailsRef.current) return;
    setExporting(true);
    const element = orderDetailsRef.current;

    // inject a print-safe stylesheet to avoid modern color functions (oklch) that html2canvas can't parse
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-pdf-override", "1");
    styleEl.textContent = `
      /* Force simple colors and remove shadows so html2canvas can parse them */
      .pdf-export, .pdf-export * {
        color: #0f172a !important; /* slate-900 */
        background-color: #ffffff !important;
        border-color: #e5e7eb !important; /* gray-200 */
        box-shadow: none !important;
      }
      .pdf-export table thead { background-color: #f8fafc !important; color: #0f172a !important; }
      .pdf-export img { filter: none !important; -webkit-filter: none !important; }
    `;
    document.head.appendChild(styleEl);

    // PDF options
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Order_${order?._id || "Details"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      // keep short; you can log if needed
      console.error("PDF export error:", err);
    } finally {
      // cleanup override style and end spinner
      if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[90vh] bg-slate-900/70 backdrop-blur-sm text-slate-100 shadow-xl rounded-lg border border-gray-700 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Order Details - <span className="text-blue-400">{order?._id}</span>
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
            <section className="border rounded-lg p-4 bg-slate-800 border-gray-700 shadow-sm"
            >
              <h2 className="flex items-center text-lg font-semibold mb-2 text-slate-100">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              <div className="space-y-1">
                <div className="text-sm text-gray-300">
                  <span className="font-semibold text-slate-200">Name:</span>{" "}
                  <span className="text-slate-100">{order?.user?.name}</span>
                </div>
                <div className="text-sm text-gray-300">
                  <span className="font-semibold text-slate-200">Email:</span>{" "}
                  <span className="text-slate-300">{order?.user?.email}</span>
                </div>
                <div className="text-sm text-gray-300">
                  <span className="font-semibold text-slate-200">
                    Order Date:
                  </span>{" "}
                  <span className="text-slate-300">
                    {new Date(order.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="border rounded-lg p-4 bg-slate-800/40 border-gray-700 shadow-sm">
              <h2 className="flex items-center text-lg font-semibold mb-2 text-slate-100">
                <MapPin className="h-5 w-5 mr-2 text-rose-400" />
                Delivery Address
              </h2>
              <div className="space-y-1 text-sm">
                <div className="text-slate-300">
                  <span className="font-semibold text-slate-200">Name:</span>{" "}
                  <span className="text-slate-100">
                    {order?.shippingAddress?.fullName}
                  </span>
                </div>
                <div className="text-slate-300">
                  <span className="font-semibold text-slate-200">Address:</span>{" "}
                  <span className="text-slate-300">
                    {order?.shippingAddress?.addressLine}
                  </span>
                </div>
                <div className="text-slate-300">
                  <span className="font-semibold text-slate-200">City:</span>{" "}
                  <span className="text-slate-300">
                    {order?.shippingAddress?.city}
                  </span>
                </div>
                <div className="text-slate-300">
                  <span className="font-semibold text-slate-200">State:</span>{" "}
                  <span className="text-slate-300">
                    {order?.shippingAddress?.state}
                  </span>
                </div>
                <div className="text-slate-300">
                  <span className="font-semibold text-slate-200">Country:</span>{" "}
                  <span className="text-slate-300">
                    {order?.shippingAddress?.country}
                  </span>
                </div>
                <div className="text-slate-300">
                  <span className="font-semibold text-slate-200">
                    Postal Code:
                  </span>{" "}
                  <span className="text-slate-300">
                    {order?.shippingAddress?.postalCode}
                  </span>
                </div>
                <div className="text-slate-300">
                  <span className="font-semibold text-slate-200">Phone:</span>{" "}
                  <span className="text-slate-300">
                    {order?.shippingAddress?.phoneNumber}
                  </span>
                </div>
              </div>
            </section>

            {/* Order Items */}
            <section className="border rounded-lg p-4 bg-slate-800/40 border-gray-700 shadow-sm">
              <h2 className="flex items-center text-lg font-semibold mb-2 text-slate-100">
                <Package className="h-5 w-5 mr-2 text-emerald-400" />
                Order Items
              </h2>
              <div className="overflow-x-auto rounded-md">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-gray-200">
                      <th className="p-2 border border-gray-700">Image</th>
                      <th className="p-2 border border-gray-700">Name</th>
                      <th className="p-2 border border-gray-700">Category</th>
                      <th className="p-2 border border-gray-700">Product ID</th>
                      <th className="p-2 border border-gray-700">Qty</th>
                      <th className="p-2 border border-gray-700">Price</th>
                      <th className="p-2 border border-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <tr
                          key={item._id || idx}
                          className="text-center text-slate-200"
                        >
                          <td className="p-2 border border-gray-700">
                            <img
                              src={
                                item.image ||
                                "https://via.placeholder.com/48/071226/ffffff?text=No"
                              }
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded shadow-sm mx-auto"
                            />
                          </td>
                          <td className="p-2 border border-gray-700 text-left pl-4">
                            {item.name}
                          </td>
                          <td className="p-2 border border-gray-700">
                            {item.category}
                          </td>
                          <td className="p-2 border border-gray-700">
                            {item.productId}
                          </td>
                          <td className="p-2 border border-gray-700">
                            {item.quantity}
                          </td>
                          <td className="p-2 border border-gray-700">
                            {item.price} AED
                          </td>
                          <td className="p-2 border border-gray-700 font-semibold">
                            {(item.quantity * item.price).toFixed(2)} AED
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-2 border border-gray-700 text-gray-400"
                        >
                          No items found for this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Order Summary */}
            <section className="border rounded-lg p-4 bg-slate-800/40 border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center">
              <div className="text-xl font-bold text-slate-100">
                Order Total:{" "}
                <span className="text-emerald-400">
                  {order.totalAmount} AED
                </span>
              </div>
              <div className="text-lg font-semibold text-slate-100 mt-2 md:mt-0">
                Current Status:{" "}
                <span
                  className={`p-2 items-center px-2 py-1.5 rounded-full font-bold ${getStatusBadge(
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
            <Button type="button" variant="ghost" className="text-gray-400">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;