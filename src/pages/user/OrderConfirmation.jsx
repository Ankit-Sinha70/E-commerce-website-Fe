// File: src/pages/OrderConfirmation.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const OrderConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-24 text-center px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Thank You!</h2>
        <p className="text-lg text-gray-700 mb-6">
          Your order has been placed successfully.
        </p>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
