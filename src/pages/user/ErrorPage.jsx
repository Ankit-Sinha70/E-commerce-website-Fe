import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, Home, ShoppingCart } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-red-600 mb-4">Payment Cancelled!</h2>
        <p className="text-gray-700 text-lg mb-6">
          Your payment was cancelled or an error occurred. No charges have been made.
        </p>
        <div className="flex flex-col space-y-4">
          <Link
            to="/cart"
            className="bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" /> Return to Cart
          </Link>
          <Link
            to="/"
            className="text-blue-600 hover:underline flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 