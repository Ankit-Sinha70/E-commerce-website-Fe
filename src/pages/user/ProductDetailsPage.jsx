import { Facebook, Linkedin, ShoppingCart, Twitter, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import AddToCartConfirmationPopup from '../../component/AddToCartConfirmationPopup';
import { addItemToCart } from "../../features/cart/cartSlice";
import {
  clearProduct,
  fetchProductById,
} from "../../features/product/productSlice";
import { fetchReviewsByProductId, clearReviews } from '../../features/review/reviewSlice';
import Loader from "@/component/Common/Loader";
import ReviewList from "@/component/ReviewList/ReviewList";
import ReviewForm from "@/component/ReviewForm/ReviewForm";
import RatingsSummary from "@/component/RatingsSummary/RatingsSummary";
import { formatCurrency } from "@/lib/currency";

const ProductDetailsPage = () => {
  const { id } = useParams();
  console.log("id", id);
  const dispatch = useDispatch();

  const { product, loading, } = useSelector((state) => state.product);
  const { accessToken } = useSelector((state) => state.auth);
  const { loading: cartLoading } = useSelector((state) => state.cart);
  const { reviews, status: reviewStatus } = useSelector((state) => state.reviews);
  console.log('reviews', reviews)
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);

  // Retrieve and parse user from localStorage
  let isUser = null;
  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      isUser = JSON.parse(userString);
    }
  } catch (e) {
    console.error("Failed to parse user from localStorage:", e);
    toast.error("User data corrupted. Please log in again.", {
      className: "toast-danger",
    });
  }

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById({ id, accessToken: null }));
      dispatch(fetchReviewsByProductId(id));
    }
    return () => {
      dispatch(clearProduct());
      dispatch(clearReviews());
    };
  }, [id, dispatch]);

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      toast.error("Product details not loaded. Please try again.", {
        className: "toast-danger",
      });
      return;
    }

    // Ensure user object exists, has a role, and accessToken exists
    if (!isUser || !isUser.role || !accessToken) {
      toast.error("Please log in to add items to your cart.", {
        className: "toast-danger",
      });
      return;
    }

    try {
      const resultAction = await dispatch(
        addItemToCart({
          productId: product._id,
          quantity: quantity,
          price: product.price,
          userId: isUser._id,
          accessToken: accessToken,
        })
      );

      if (addItemToCart.fulfilled.match(resultAction)) {
        setShowConfirmationPopup(true);
      } else if (addItemToCart.rejected.match(resultAction)) {
        const errorMessage =
          resultAction.payload ||
          resultAction.error.message ||
          "Something went wrong.";
        toast.error(`Failed to add ${product.name} to cart: ${errorMessage}`, {
          className: "toast-danger",
        });
        console.error("Failed to add to cart:", errorMessage);
      }
    } catch (err) {
      toast.error("An unexpected error occurred while adding to cart.", {
        className: "toast-danger",
      });
      console.error("Unexpected error in handleAddToCart:", err);
    }
  };

  const handleCloseConfirmationPopup = () => {
    setShowConfirmationPopup(false);
  };

  const handleMouseEnter = () => {
    setZoomVisible(true);
  };

  const handleMouseLeave = () => {
    setZoomVisible(false);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current || !product?.image) return;

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;

    const viewWidth = width;
    const viewHeight = height;

    const zoomWidth = 800;
    const zoomHeight = 800;

    const zoomFactorX = zoomWidth / viewWidth;
    const zoomFactorY = zoomHeight / viewHeight;

    const newLeft = -(mouseX * (zoomFactorX - 1));
    const newTop = -(mouseY * (zoomFactorY - 1));

    const clampedLeft = Math.max(-(zoomWidth - viewWidth), Math.min(0, newLeft));
    const clampedTop = Math.max(-(zoomHeight - viewHeight), Math.min(0, newTop));

    setZoomPosition({ x: clampedLeft, y: clampedTop });
  };

  if (loading) {
    return (
      <Loader message={"Loading Product Details..."}/>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Product not found.</p>
      </div>
    );
  }

  return (
		<div className="min-h-screen bg-[#1e293b]">
			{/* Back to products - fixed top-left, responsive */}
			<Link
				to="/#products"
				aria-label="Back to products"
				className="fixed top-20 left-4 z-40 inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-800/80 text-slate-300 border border-gray-700 backdrop-blur hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:hidden"
			>
				<ArrowLeft className="h-5 w-5" />
			</Link>
			<Link
				to="/#products"
				className="fixed top-25 left-8 z-40 hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-800/80 text-slate-300 border border-gray-700 backdrop-blur hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<ArrowLeft className="h-5 w-5" />
				<span className="text-sm font-medium">Back</span>
			</Link>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mt-36">
        {/* Main Product Section */}
        <div className="bg-gray-600 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Image */}
            <div className="relative">
              <div
                className="relative bg-gray-600 rounded-lg overflow-hidden"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                ref={imageContainerRef}
              >
                <img
                  src={product.image || "/src/image_22_3.jpeg"}
                  alt={product.name}
                  className="w-full h-auto max-h-[500px] object-contain transition-opacity duration-300 cursor-grid hover:cursor-grid"
                  style={{ opacity: zoomVisible ? 0 : 1 }}
                />
                {zoomVisible && (
                  <img
                    src={product.image || "/src/image_22_3.jpeg"}
                    alt={`${product.name} zoomed`}
                    style={{
                      position: 'absolute',
                      top: zoomPosition.y,
                      left: zoomPosition.x,
                      width: '800px',
                      height: '800px',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      opacity: 1,
                      pointerEvents: 'none',
                      transform: 'translateZ(0)',
                    }}
                    className="object-contain cursor-grid hover:cursor-grid"
                  />
                )}
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  BEST SELLING
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-300 mb-2">
                  {product.name}
                </h1>
                <p className="text-3xl font-bold text-blue-500">
                  {formatCurrency(product.price)}
                </p>
              </div>

              {product.shortDescription && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-300 mb-2">
                    {product.shortDescription}
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.size && (
                <div>
                  <p className="text-gray-300">
                    <strong>Ice Ball Size:</strong> {product.size}
                  </p>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    className="px-3 py-2 hover:bg-gray-100 text-lg font-medium"
                    onClick={() => handleQuantityChange("decrement")}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                  />
                  <button
                    className="px-3 py-2 hover:bg-gray-100 text-lg font-medium"
                    onClick={() => handleQuantityChange("increment")}
                  >
                    +
                  </button>
                </div>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 flex items-center gap-2 rounded disabled:opacity-50"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  {cartLoading ? (
                    "Adding to Cart..."
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      ADD TO CART
                    </>
                  )}
                </button>
              </div>

              {/* Category */}
              <div className="border-t pt-4">
                <p className="text-gray-300">
                  <strong>Category:</strong>
                  <span className="ml-2 text-gray-300">
                    {product.category?.name || "Ice"}
                  </span>
                </p>
              </div>

              {/* Share */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-4">
                  <strong className="text-gray-300">Share:</strong>
                  <div className="flex gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-blue-800"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${
                        window.location.href
                      }&text=${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-blue-600"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${
                        window.location.href
                      }&title=${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-blue-900"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Reviews Tabs */}
        <div className="bg-gray-600 rounded-lg shadow-sm mb-8">
          <div className="border-b">
            <div className="flex">
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'description'
                    ? 'text-blue-600 border-blue-500'
                    : 'text-gray-300 border-transparent hover:text-gray-500'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-300 border-transparent hover:text-gray-500'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviews?.length})
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-2">{product?.name}</h3>
                  <p className="text-gray-400 mb-4">
                    {product?.description}
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                {reviewStatus === 'loading' ? (
                  <Loader message="Loading reviews..." />
                ) : (
                  <>
                    <RatingsSummary reviews={reviews} />
                    <ReviewList reviews={reviews} />
                    <ReviewForm productId={id} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="bg-gray-600 rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-300 mb-6">Related products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sample Related Products */}
              {[
                { name: "Ice Ball (6pcs)", price: "30.00 AED - 40.00 AED", image: "/api/placeholder/200/200" },
                { name: "Ice Tubes", price: "1.50 AED - 37.50 AED", image: "/api/placeholder/200/200" },
                { name: "Ice Cubes", price: "2.75 AED", image: "/api/placeholder/200/200" },
                { name: "Ice Ball Mint (6pcs)", price: "36.00 AED", image: "/api/placeholder/200/200" }
              ].map((relatedProduct, index) => (
                <div key={index} className="relative bg-gray-500 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    BEST SELLING
                  </div>
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-40 object-contain mb-3 cursor-grid hover:cursor-grid"
                  />
                  <h3 className="font-medium text-gray-300 text-center mb-2">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-gray-300 font-semibold text-center">
                    {relatedProduct.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddToCartConfirmationPopup
        isVisible={showConfirmationPopup}
        productName={product?.name}
        quantity={quantity}
        onClose={handleCloseConfirmationPopup}
      />
    </div>
  );
};

export default ProductDetailsPage;