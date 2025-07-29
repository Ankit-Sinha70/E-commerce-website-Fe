// File: src/pages/WishlistPage.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL;

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    const fetchItems = async () => {
      const items = await Promise.all(
        stored.map(async () => {
          try {
            const res = await fetch(`${API_URL}/api/wishlist/list`);
            return await res.json();
          } catch {
            return null;
          }
        })
      );
      setWishlist(items.filter(Boolean));
    };
    fetchItems();
  }, []);

  return (
    <div className="pt-24 px-4">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="text-gray-600">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg bg-white shadow p-4"
            >
              <img
                src={`${API_URL}/uploads/${product.image}`}
                alt={product.name}
                className="w-full h-40 object-cover mb-3 rounded"
                onError={(e) => (e.currentTarget.src = "/src/image_22_3.jpeg")}
              />
              <h4 className="text-lg font-semibold mb-1">{product.name}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {product.description}
              </p>
              <p className="font-bold text-blue-600 mb-2">
                {product.price} AED
              </p>
              <Button>Add to Cart</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
