import React from "react";

const InvoicePage = () => {
  const invoice = JSON.parse(localStorage.getItem("latestInvoice")) || null;

  if (!invoice) {
    return (
      <div className="pt-24 text-center text-gray-600">No invoice found.</div>
    );
  }

  return (
    <div className="pt-24 max-w-3xl mx-auto px-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-700 text-center mb-6">
          Invoice
        </h2>

        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-1">Customer Info:</h4>
          <p>
            <strong>Name:</strong> {invoice.name}
          </p>
          <p>
            <strong>Phone:</strong> {invoice.phone}
          </p>
          <p>
            <strong>Email:</strong> {invoice.email}
          </p>
          <p>
            <strong>Address:</strong> {invoice.address}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-2">Order Summary:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">
                      {item.price * item.quantity} AED
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-right mt-4 font-bold text-blue-700 text-lg">
            Total: {invoice.total} AED
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
