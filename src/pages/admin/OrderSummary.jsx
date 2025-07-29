// src/pages/admin/OrderSummary.jsx
const OrderSummary = ({ orders }) => {
    const total = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avg = orders.length > 0 ? Math.round(total / orders.length) : 0;
  
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-gray-600">
            Showing {orders.length} orders
          </p>
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
            <span>
              Total Revenue: <strong>{total} AED</strong>
            </span>
            <span>
              Avg Order: <strong>{avg} AED</strong>
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  export default OrderSummary;