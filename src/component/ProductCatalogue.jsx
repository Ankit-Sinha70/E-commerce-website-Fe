import { Button } from "@/components/ui/button";
import { ShoppingCart, Snowflake, Star, Heart } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { addItem, addItemToCart } from "../../src/features/cart/cartSlice";
import { addItemToWishList } from "../../src/features/wishlist/wishlistSlice";
import AddToCartConfirmationPopup from "./AddToCartConfirmationPopup";
import LoginRequiredPopup from "./LoginRequiredPopup";

const ProductCatalogue = ({ products, loading }) => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");
  const [addedProductQuantity, setAddedProductQuantity] = useState(0);

  let quantity = 1;

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!user) {
        if (!localStorage.getItem("guestId")) {
          localStorage.setItem("guestId", "GUEST_" + crypto.randomUUID());
        }
        dispatch(
          addItem({
            productId: product,
            quantity: quantity,
            price: product.price,
          })
        );
      } else {
        await dispatch(
          addItemToCart({
            productId: product._id,
            quantity: quantity,
            price: product.price,
            userId: user._id,
            accessToken: accessToken,
          })
        ).unwrap();
      }
      setAddedProductName(product.name);
      setAddedProductQuantity(quantity);
      setShowSuccessAlert(true);
    } catch (error) {
      const errorMessage = error.message || "Failed to add product to cart.";
      toast.error(errorMessage);
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <section className="py-8 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4 font-serif">
            Our Premium Collection
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-4 sm:mb-6 rounded-full" />
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-2">
            Discover our carefully curated selection of premium ice products,
            crafted to meet your highest standards
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg animate-pulse"
              >
                <div className="w-full h-40 sm:h-48 bg-slate-200 rounded-xl mb-3 sm:mb-4" />
                <div className="h-5 sm:h-6 bg-slate-200 rounded mb-2" />
                <div className="h-3 sm:h-4 bg-slate-200 rounded mb-3 sm:mb-4" />
                <div className="h-8 sm:h-10 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          /* Products grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 lg:gap-4">
            {products?.map((product, index) => (
              <div
                key={product._id}
                className="product-card group relative bg-sky-50 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Link wraps the image and details for navigation */}
                <Link
                  to={`/product/${product._id}`}
                  className="block cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) =>
                        (e.currentTarget.src = "/src/image_22_3.jpeg")
                      }
                      className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Buttons overlay - appears on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex space-x-2">
                        {" "}
                        {/* Container for both buttons */}
                        <Button
                          className="w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base group/btn"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover/btn:animate-bounce" />
                          Add to Cart
                        </Button>
                        {/* Add to Wishlist Button */}
                        <Button
                          className="w-auto bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base group/btn"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (!user) {
                              setShowLoginAlert(true);
                              return;
                            }

                            try {
                              // Dispatch the addItemToWishList thunk
                              await dispatch(
                                addItemToWishList(product._id)
                              ).unwrap();
                              toast.success(
                                `${product.name} added to wishlist!`
                              );
                            } catch (error) {
                              const errorMessage =
                                error.message || "Failed to add to wishlist.";
                              toast.error(errorMessage);
                              console.error(
                                "Failed to add to wishlist:",
                                error
                              );
                            }
                          }}
                        >
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover/btn:animate-bounce" />
                          Wishlist
                        </Button>
                      </div>{" "}
                      {/* End of buttons container */}
                    </div>
                  </div>

                  {/* Product details */}
                  <div className="p-4 sm:p-6">
                    {/* Category and Rating */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-blue-500 font-semibold uppercase">
                        {(product.category && product.category.name) ||
                          product.category ||
                          (product.type && product.type.name) ||
                          product.type ||
                          "CATEGORY"}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="ml-1 text-slate-500 text-xs">(0)</span>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-bold text-blue-600 transition-colors duration-300">
                          AED {Number(product.price).toFixed(2)}
                        </span>
                      </div>
                      {/* Small Shopping Bag Icon - positioned relative to the card, appears on hover */}
                      <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products?.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <Snowflake className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-600 mb-2">
              No products available
            </h3>
            <p className="text-slate-500 text-sm sm:text-base">
              Check back soon for our premium ice collection
            </p>
          </div>
        )}
      </div>

      {/* Login Required Custom Popup */}
      <LoginRequiredPopup
        isVisible={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
      />

      {/* Product Added Success Custom Popup */}
      <AddToCartConfirmationPopup
        isVisible={showSuccessAlert}
        productName={addedProductName}
        quantity={addedProductQuantity}
        onClose={() => setShowSuccessAlert(false)}
      />
    </section>
  );
};

export default ProductCatalogue;
