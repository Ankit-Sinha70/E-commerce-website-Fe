// File: src/pages/DashboardHomePage.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, ShoppingCart, Package, Users, BarChart2, ChevronDown } from 'lucide-react'; // Icons from Lucide React
import { Link } from 'react-router-dom';

const DashboardHomePage = () => {
  const statsCards = [
    {
      title: 'Total Revenue',
      value: '$54,239',
      change: '+12.5%',
      trend: 'up', // 'up' or 'down' for color
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Total Orders',
      value: '1,429',
      change: '+8.2%',
      trend: 'up',
      icon: <ShoppingCart className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Total Products',
      value: '342',
      change: '+5.1%',
      trend: 'up',
      icon: <Package className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Active Customers',
      value: '892',
      change: '-2.3%',
      trend: 'down',
      icon: <Users className="h-6 w-6 text-blue-600" />,
    },
  ];

  const recentOrders = [
    { customer: 'John Doe', item: 'Wireless Headphones', price: '$299.99', status: 'completed' },
    { customer: 'Jane Smith', item: 'Smart Watch', price: '$199.99', status: 'pending' },
    { customer: 'Mike Johnson', item: 'Laptop Stand', price: '$79.99', status: 'completed' },
    { customer: 'Sarah Wilson', item: 'USB-C Cable', price: '$24.99', status: 'cancelled' },
  ];

  const getStatusClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 bg-gray-100 flex-1 overflow-y-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Dashboard</h1>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              <p className={`text-sm mt-1 ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {card.change} from last month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Sales Overview and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Sales Overview</h3>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart2 className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">Sales Chart Placeholder</p>
              <p className="text-sm">Integrate with your preferred charting library</p>
            </div>
          </div>
        </div>

        {/* Recent Orders Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900">{order.customer}</p>
                  <p className="text-sm text-gray-600">{order.item}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{order.price}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getStatusClasses(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/orders" className="text-blue-600 hover:underline text-sm block text-center mt-6">
            View all orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;