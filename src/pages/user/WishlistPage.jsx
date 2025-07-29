import React, { useEffect, useState } from "react"; // Import useState
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { toast, Toaster } from "sonner"; // Keep toast for errors/removals
import {
  getUserWishList,
  removeItemFromWishList,
} from "@/features/wishlist/wishlistSlice";
import { addItemToCart } from "../../features/cart/cartSlice";
import Loader from "@/component/common/Loader";
import {
  // Import Dialog components
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose, // Added DialogClose for closing button
} from "@/components/ui/dialog";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const { wishlist, loading, error } = useSelector((state) => state.wishlist);
  console.log("wishlist", wishlist);

  // State for the Add to Cart confirmation dialog
  const [showAddToCartDialog, setShowAddToCartDialog] = useState(false);
  const [dialogProductName, setDialogProductName] = useState("");
  const [dialogProductQuantity, setDialogProductQuantity] = useState(0);


  useEffect(() => {
    if (!accessToken) {
      toast.info("Please log in to view your wishlist.");
      return;
    }
    dispatch(getUserWishList());
  }, [dispatch, accessToken]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRemoveFromWishlist = async (productId) => {
    if (!accessToken) {
      toast.error("Please log in to remove items from wishlist.");
      return;
    }
    const resultAction = await dispatch(removeItemFromWishList(productId));
    if (removeItemFromWishList.fulfilled.match(resultAction)) {
      toast.success("Item removed from wishlist!");
    }
  };

  const handleAddToCart = async (product) => {
    if (!user || !accessToken) {
      toast.error("Please log in to add items to cart.");
      return;
    }

    const quantity = 1;

    try {
      const resultAction = await dispatch(
        addItemToCart({
          productId: product._id,
          quantity: quantity,
          price: product.price,
          userId: user._id,
          accessToken: accessToken,
        })
      ).unwrap();

      if (addItemToCart.fulfilled.match(resultAction)) {
        // Instead of toast, set state to open the dialog
        setDialogProductName(product.name);
        setDialogProductQuantity(quantity);
        setShowAddToCartDialog(true);
        // Optional: Remove from wishlist after adding to cart
        // const removeResult = await dispatch(removeItemFromWishList(product._id));
        // if (removeItemFromWishList.fulfilled.match(removeResult)) {
        //   toast.info(`${product.name} also removed from wishlist.`);
        // }
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to add product to cart.";
      toast.error(errorMessage); // Still use toast for errors
      console.error("Failed to add to cart:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const productsInWishlist = wishlist ? wishlist.products : [];

  return (
    <div className="px-10 py-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Your Wishlist</h2>
      {productsInWishlist.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg mb-4">Your wishlist is empty.</p>
          <Button onClick={() => (window.location.href = "/")}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productsInWishlist.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg bg-white shadow p-4 flex flex-col"
            >
              <img
                src={product?.image}
                alt={product?.name}
                className="w-full h-40 object-cover mb-3 rounded"
                onError={(e) =>
                  (e.currentTarget.src = "/src/assets/images/image_22_3.jpeg")
                }
              />
              <h4 className="text-lg font-semibold mb-1">{product?.name}</h4>
              <p className="text-sm text-gray-600 mb-2 flex-grow">
                {product.description}
              </p>
              <p className="font-bold text-blue-600 mb-2">
                {product.price} AED
              </p>
              <div className="flex justify-end items-center mt-auto">
                <Button variant="ghost" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className="ml-2"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Toaster richColors position="top-right" />

      {/* Add to Cart Confirmation Dialog */}
      <Dialog open={showAddToCartDialog} onOpenChange={setShowAddToCartDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Item Added to Cart!</DialogTitle>
            <DialogDescription>
              {dialogProductName} has been added to your cart.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Quantity: {dialogProductQuantity}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Continue Shopping
              </Button>
            </DialogClose>
            {/* You can add another button here, e.g., to go to cart */}
            <Button
              onClick={() => {
                // Navigate to cart page if needed
                setShowAddToCartDialog(false); // Close dialog
                // window.location.href = "/cart"; // Example navigation
              }}
            >
              Go to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WishlistPage;
