import {
  fetchRecentOrders,
  fetchYearlyRevenue, getSalesOverview
} from "@/features/order/orderSlice";
import {
  ChevronDown,
  CreditCard,
  Package,
  ShoppingCart,
  Users
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import Loader from "@/component/Common/Loader";

const DashboardHomePage = () => {
  const dispatch = useDispatch();

  const { users } = useSelector((state) => state.user);
  const { products } = useSelector((state) => state.product);
  const { orders } = useSelector((state) => state.order);
  const { yearlyRevenue, yearlyRevenueLoading } = useSelector(
    (state) => state.order
  );
  const {
    recentOrders,
    recentOrdersLoading,
    recentOrdersError,
    salesOverview,
    salesOverviewLoading,
    salesOverviewError,
  } = useSelector((state) => state.order);

  const accessToken =
    useSelector((state) => state.auth?.accessToken) ||
    localStorage.getItem("accessToken");

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchRecentOrders({ accessToken }));
      dispatch(fetchYearlyRevenue({ accessToken }));
      dispatch(getSalesOverview({ accessToken }));
    }
  }, [dispatch, accessToken]);

  const statsCards = [
    {
      title: "Total Revenue",
      value: yearlyRevenueLoading ? <Loader /> : formatCurrency(yearlyRevenue),
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
      className:"bg-blue-400"
    },
    {
      title: "Total Orders",
      value: orders?.length,
      icon: <ShoppingCart className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Total Products",
      value: products.length,
      icon: <Package className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Active Customers",
      value: users.length,
      icon: <Users className="h-6 w-6 text-blue-600" />,
    },
  ];

  const getStatusClasses = (status) => {
    switch (status) {
      case "Processing":
        return "bg-green-400 text-green-800";
      case "pending":
        return "bg-gray-300 text-yellow-800";
      case "Cancelled":
        return "bg-red-400 text-red-800";
      case "Delivered":
        return "bg-purple-500 text-purple-800";
      case "Shipped":
        return "bg-blue-400 text-blue-800";
      default:
        return "bg-red-400 text-gray-800";
    }
  };

  return (
    <div className="p-4 bg-[rgba(30,30,47,0.6)] flex-1 overflow-y-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-300 mb-4 md:mb-0">
          Dashboard
        </h1>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="bg-gray-800 p-6 rounded-lg shadow-sm border border-blue-600 flex items-center justify-between"
          >
            <div>
              <p className="text-gray-300 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-gray-300 mt-1">
                {card.value}
              </p>
            </div>
            <div className="bg-blue-300 p-3 rounded-full">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Sales Overview and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Card */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-sm border border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-300">
              Sales Overview
            </h3>
            <div className="relative">
              <select className="appearance-none bg-gray-800 border border-gray-700 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none h-4 w-4" />
            </div>
          </div>
          <div className="h-64">
            {salesOverviewLoading ? (
              <Loader message={"Loading sales overview..."}/>
            ) : salesOverviewError ? (
              <div className="flex items-center justify-center h-full text-red-500">
                Error loading chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" className={"text-red-500"}>
                <BarChart
                  data={salesOverview}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 6" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="totalSales"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-blue-500">
          <h3 className="text-xl font-semibold text-gray-300 mb-4">
            Recent Orders
          </h3>

          {recentOrdersLoading ? (
            <p className="text-sm text-gray-400">Loading recent orders...</p>
          ) : recentOrdersError ? (
            <p className="text-sm text-red-500">{recentOrdersError}</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No recent orders found.</p>
          ) : (
            <ul className="space-y-4">
              {recentOrders.map((order) => (
                <li
                  key={order._id}
                  className="flex justify-between items-center bg-gray-500 p-3 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-300">
                      {order.user?.name || "Unknown Customer"}
                    </p>
                    <p className="text-sm text-gray-300">
                      Order ID: {order.orderId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-300">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getStatusClasses(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
