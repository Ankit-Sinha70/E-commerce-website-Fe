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
import {
  getUserWishList,
  removeItemFromWishList,
} from "@/features/wishlist/wishlistSlice";
import { formatCurrency } from "@/lib/currency";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addItemToCart } from "../../features/cart/cartSlice";
import { Loader } from "../../component/Common/Loader.jsx";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const { wishlist, loading, error } = useSelector((state) => state.wishlist);
  const [showAddToCartDialog, setShowAddToCartDialog] = useState(false);
  const [dialogProductName, setDialogProductName] = useState("");
  const [dialogProductQuantity, setDialogProductQuantity] = useState(0);

  useEffect(() => {
    if (!accessToken) {
      toast.info("Please log in to view your wishlist.", {
        className: "toast-info",
      });
      return;
    }
    dispatch(getUserWishList());
  }, [dispatch, accessToken]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        className: "toast-danger",
      });
    }
  }, [error]);

  const handleRemoveFromWishlist = async (productId) => {
    if (!accessToken) {
      toast.error("Please log in to remove items from wishlist.", {
        className: "toast-danger",
      });
      return;
    }
    try {
      await dispatch(removeItemFromWishList(productId)).unwrap();
      toast.success("Item removed from wishlist!", { className: "toast-success" });
      // Optimistic UI: remove locally if state shape differs
      if (wishlist?.wishList?.products) {
        wishlist.wishList.products = wishlist.wishList.products.filter(p => p._id !== productId);
      }
    } catch (err) {
      toast.error(err || "Failed to remove item from wishlist", { className: "toast-danger" });
    }
  };

  const handleAddToCart = async (product) => {
    if (!user || !accessToken) {
      toast.error("Please log in to add items to cart.", {
        className: "toast-danger",
      });
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
        setDialogProductName(product.name);
        setDialogProductQuantity(quantity);
        setShowAddToCartDialog(true);
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to add product to cart.";
      toast.error(errorMessage, {
        className: "toast-danger",
      });
      console.error("Failed to add to cart:", error);
    }
  };

  if (loading) {
    return <Loader message="Loading Wishlist..." />;
  }

  const productsInWishlist = wishlist ? wishlist?.wishList?.products : [];

  return (
    <div className="min-h-screen bg-[#111827] text-slate-300 py-24">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-8">Your Wishlist</h2>
          <p className="text-lg text-slate-400">
            Items you've saved for later. Ready to make them yours?
          </p>
        </div>

        {productsInWishlist?.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center min-h-[40vh] bg-gray-800 rounded-2xl border border-gray-700 p-8">
            <div className="relative">
              <ShoppingBag className="relative w-24 h-24 text-blue-400 mb-6" />
            </div>
            <p className="text-slate-400 text-lg mb-6 max-w-md">
              Your wishlist is empty. Explore our products and add your
              favorites!
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsInWishlist?.map((product) => (
              <div
                key={product._id}
                className="group relative overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={product?.image}
                    alt={product?.name}
                    className="w-full h-64 object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-110"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "/src/assets/images/image_22_3.jpeg")
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-slate-300 mb-2 truncate">
                    {product?.name}
                  </h4>
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="font-bold text-blue-400 mb-3">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleAddToCart(product)}
                      className="text-blue-300 hover:bg-blue-700"
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="text-red-300 hover:bg-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add to Cart Confirmation Dialog */}
        <Dialog open={showAddToCartDialog} onOpenChange={setShowAddToCartDialog}>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 border border-gray-700 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-300">
                Item Added to Cart!
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {dialogProductName} has been added to your cart.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-slate-300">
                Quantity: {dialogProductQuantity}
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="text-slate-300 bg-gray-700 hover:bg-gray-600"
                >
                  Continue Shopping
                </Button>
              </DialogClose>
              <Button
                onClick={() => {
                  setShowAddToCartDialog(false);
                  window.location.href = "/cart";
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Go to Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WishlistPage;
