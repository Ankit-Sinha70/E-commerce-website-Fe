import {
  Facebook,
  Linkedin,
  ShoppingCart,
  Twitter,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import AddToCartConfirmationPopup from "../../component/AddToCartConfirmationPopup";
import { addItemToCart } from "../../features/cart/cartSlice";
import {
  clearProduct,
  fetchProductById,
} from "../../features/product/productSlice";
import {
  fetchReviewsByProductId,
  clearReviews,
} from "../../features/review/reviewSlice";
import ReviewList from "@/component/ReviewList/ReviewList";
import ReviewForm from "@/component/ReviewForm/ReviewForm";
import RatingsSummary from "@/component/RatingsSummary/RatingsSummary";
import { formatCurrency } from "@/lib/currency";
import { Loader } from "../../component/Common/Loader.jsx";

const ProductDetailsPage = () => {
  const { id } = useParams();
  console.log("id", id);
  const dispatch = useDispatch();

  // --- Redux State ---
  const { product, relatedProducts, loading } = useSelector((state) => state.product);
  const { accessToken } = useSelector((state) => state.auth);
  const { loading: cartLoading } = useSelector((state) => state.cart);
  const { reviews, status: reviewStatus } = useSelector(
    (state) => state.reviews
  );
  console.log("reviews", reviews);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [imageError, setImageError] = useState(false);

  // --- New Magnifier State and Ref ---
  const imgRef = useRef(null); // Ref for the main product image
  const [magnifierState, setMagnifierState] = useState({
    visible: false,
    top: 0,
    left: 0,
    scale: 2, // Initial zoom level
    tx: 0, // pixel translate X
    ty: 0, // pixel translate Y
    lastRelX: 0, // last mouse X relative to displayed image (px)
    lastRelY: 0, // last mouse Y relative to displayed image (px)
    imgW: 0, // displayed image width
    imgH: 0, // displayed image height
  });

  const placeholderImage = "https://placehold.co/800x800?text=No+Image";
  const API_URL = import.meta.env.VITE_API_URL;

  // --- Data Fetching Effect ---
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

  // --- Helper Functions ---
  const getProductImageUrl = (p) => {
    try {
      const candidates = [];
      if (Array.isArray(p?.images)) candidates.push(p.images[0]);
      if (p?.image) candidates.push(p.image);
      if (p?.thumbnail) candidates.push(p.thumbnail);
      if (p?.mainImage) candidates.push(p.mainImage);

      for (const c of candidates) {
        if (!c) continue;
        let url = typeof c === "string" ? c : c?.url || c?.path || c?.src || c?.secure_url || null;
        if (!url) continue;
        url = String(url).replace(/\\/g, "/");
        const isAbsolute = /^(https?:)?\/\//i.test(url) || url.startsWith("data:");
        if (isAbsolute) return url;
        const clean = url.replace(/^\//, "");
        const base = String(API_URL || "").replace(/\/$/, "");
        return base ? `${base}/${clean}` : `/${clean}`;
      }
      return null;
    } catch (e) {
      console.error("Failed to resolve product image URL", e);
      return null;
    }
  };

  let isUser = null;
  try {
    const userString = localStorage.getItem("user");
    if (userString) isUser = JSON.parse(userString);
  } catch (e) {
    console.error("Failed to parse user from localStorage:", e);
  }

  // --- Event Handlers ---
  const handleQuantityChange = (type) => {
    setQuantity((prev) =>
      type === "increment" ? prev + 1 : Math.max(1, prev - 1)
    );
  };

  const handleAddToCart = async () => {
    const prod = Array.isArray(product)
      ? product.find((p) => String(p?._id) === String(id))
      : product;
    if (!prod) {
      toast.error("Product details not loaded.", { className: "toast-danger" });
      return;
    }
    if (!isUser || !isUser.role || !accessToken) {
      toast.error("Please log in to add items to your cart.", {
        className: "toast-danger",
      });
      return;
    }
    try {
      const resultAction = await dispatch(
        addItemToCart({
          productId: prod._id,
          quantity,
          price: prod?.discountPrice ?? prod?.price,
          userId: isUser._id,
          accessToken,
        })
      );
      if (addItemToCart.fulfilled.match(resultAction)) {
        setShowConfirmationPopup(true);
      } else {
        const error =
          resultAction.payload ||
          resultAction.error.message ||
          "Something went wrong.";
        toast.error(`Failed to add to cart: ${error}`, {
          className: "toast-danger",
        });
      }
    } catch (err) {
      console.log("err", err);
      toast.error("An unexpected error occurred.", {
        className: "toast-danger",
      });
    }
  };

  const handleCloseConfirmationPopup = () => {
    setShowConfirmationPopup(false);
  };

  // --- New Magnifier Event Handlers ---
  const handleMouseMove = (e) => {
    if (!imgRef.current || imageError) return;

    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const relX = e.clientX - left; // relative to image (viewport coords)
    const relY = e.clientY - top;

    if (relX < 0 || relY < 0 || relX > width || relY > height) {
      if (magnifierState.visible)
        setMagnifierState((prev) => ({ ...prev, visible: false }));
      return;
    }

    const lensSize = 300;
    const half = lensSize / 2;
    const scale = magnifierState.scale;

    let tx = -(relX * scale - half);
    let ty = -(relY * scale - half);

    const minTx = lensSize - width * scale;
    const minTy = lensSize - height * scale;
    tx = Math.max(minTx, Math.min(0, tx));
    ty = Math.max(minTy, Math.min(0, ty));

    setMagnifierState((prev) => ({
      ...prev,
      visible: true,
      top: e.clientY - half,
      left: e.clientX - half,
      tx,
      ty,
      lastRelX: relX,
      lastRelY: relY,
      imgW: width,
      imgH: height,
    }));
  };

  const handleMouseLeave = () => {
    setMagnifierState((prev) => ({ ...prev, visible: false }));
  };

  const handleWheel = (e) => {
    if (!magnifierState.visible) return;
    e.preventDefault();
    const scrollingUp = e.deltaY < 0;

    setMagnifierState((prev) => {
      const newScale = scrollingUp
        ? Math.min(3, prev.scale + 0.1)
        : Math.max(1, prev.scale - 0.1);
      const scale = Math.round(newScale * 10) / 10;

      const width =
        prev.imgW || imgRef.current?.getBoundingClientRect().width || 1;
      const height =
        prev.imgH || imgRef.current?.getBoundingClientRect().height || 1;
      const lensSize = 300;
      const half = lensSize / 2;
      let tx = -(prev.lastRelX * scale - half);
      let ty = -(prev.lastRelY * scale - half);
      const minTx = lensSize - width * scale;
      const minTy = lensSize - height * scale;
      tx = Math.max(minTx, Math.min(0, tx));
      ty = Math.max(minTy, Math.min(0, ty));

      return { ...prev, scale, tx, ty };
    });
  };

  const prod = Array.isArray(product)
    ? product.find((p) => String(p?._id) === String(id))
    : product;

  if (loading) return <Loader message={"Loading Product Details..."} />;

  if (!prod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Product not found.</p>
      </div>
    );
  }

  const productImgUrl = getProductImageUrl(prod);

  return (
    <div className="min-h-screen bg-[#1e293b]">
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
        <div className="bg-gray-600 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* ====== Product Image Section with Magnifier ====== */}
            <div
              className="magnifier-container"
              onMouseMove={!imageError ? handleMouseMove : undefined}
              onMouseLeave={!imageError ? handleMouseLeave : undefined}
              onWheel={!imageError ? handleWheel : undefined}
            >
              <img
                ref={imgRef}
                src={productImgUrl || placeholderImage}
                alt={prod?.name || "Product"}
                className="image-preview"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
              {!imageError && productImgUrl && (
                <div
                  className="magnifier"
                  style={{
                    display: magnifierState.visible ? "block" : "none",
                    top: `${magnifierState.top}px`,
                    left: `${magnifierState.left}px`,
                  }}
                >
                  <img
                    className="magnifier__img"
                    src={productImgUrl}
                    alt="Zoomed"
                    style={{
                      width: `${magnifierState.imgW || 0}px`,
                      height: `${magnifierState.imgH || 0}px`,
                      transform: `translate(${magnifierState.tx}px, ${magnifierState.ty}px) scale(${magnifierState.scale})`,
                    }}
                  />
                </div>
              )}
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                BEST SELLING
              </div>
            </div>

            {/* Product Details Section */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-300 mb-2">
                  {prod?.name}
                </h1>
                <p className="text-3xl font-bold text-blue-500">
                  {formatCurrency(prod?.discountPrice ?? prod?.price)}
                </p>
                {prod?.originalPrice && prod?.discountPrice && (
                  <p className="text-gray-300 line-through text-sm">
                    {formatCurrency(prod.originalPrice)}
                  </p>
                )}
                {(() => {
                  const pct = typeof prod?.discountPercentage === 'number'
                    ? Math.round(prod.discountPercentage)
                    : (prod?.originalPrice && prod?.discountPrice
                        ? Math.round(100 - (Number(prod.discountPrice) / Number(prod.originalPrice)) * 100)
                        : null);
                  return (pct && isFinite(pct) && pct > 0) ? (
                    <span className="inline-block mt-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      {pct}% OFF
                    </span>
                  ) : null;
                })()}
              </div>

              {prod?.shortDescription && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-300 mb-2">
                    {prod?.shortDescription}
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    {prod?.description}
                  </p>
                </div>
              )}

              {prod?.size && (
                <div>
                  <p className="text-gray-300">
                    <strong>Ice Ball Size:</strong> {prod?.size}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded text-gray-300 bg-gray-700">
                  <button
                    className="px-3 py-2 hover:bg-gray-500 text-lg font-medium"
                    onClick={() => handleQuantityChange("decrement")}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-16 text-center border-x border-gray-500 py-2 focus:outline-none bg-gray-700 text-gray-300"
                  />
                  <button
                    className="px-3 py-2 hover:bg-gray-500 text-lg font-medium"
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
                    "Adding..."
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> ADD TO CART
                    </>
                  )}
                </button>
              </div>

              {/* Category */}
              <div className="border-t pt-4">
                <p className="text-gray-300">
                  <strong>Category:</strong>
                  <span className="ml-2 text-gray-400">
                    {prod?.category?.name || "Uncategorized"}
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
                      }&text=${encodeURIComponent(prod?.name || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-blue-600"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${
                        window.location.href
                      }&title=${encodeURIComponent(prod?.name || "")}`}
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
                  activeTab === "description"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-300 border-transparent hover:text-gray-500"
                }`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "reviews"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-300 border-transparent hover:text-gray-500"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({reviews?.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-2">
                    {product?.name}
                  </h3>
                  <p className="text-gray-400 mb-4">{product?.description}</p>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {reviewStatus === "loading" ? (
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
            <h2 className="text-xl font-bold text-gray-300 mb-6">
              Related products
            </h2>
            {Array.isArray(relatedProducts) && relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rp) => {
                  const rpImg = getProductImageUrl(rp) || "https://placehold.co/400x400?text=No+Image";
                  return (
                    <Link
                      to={`/product/${rp._id}`}
                      key={rp._id}
                      className="relative bg-gray-500 rounded-lg p-4 hover:shadow-md transition-shadow block"
                    >
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        BEST SELLING
                      </div>
                      <img
                        src={rpImg}
                        alt={rp?.name || "Related product"}
                        className="w-full h-40 object-contain mb-3"
                        loading="lazy"
                      />
                      <h3 className="font-medium text-gray-300 text-center mb-2 line-clamp-2">
                        {rp?.name}
                      </h3>
                      <div className="text-center">
                        <p className="text-gray-300 font-semibold">
                          {formatCurrency(rp?.discountPrice ?? rp?.price)}
                        </p>
                        {rp?.originalPrice && rp?.discountPrice && (
                          <p className="text-gray-400 line-through text-sm">
                            {formatCurrency(rp.originalPrice)}
                          </p>
                        )}
                        {(() => {
                          const pct = typeof rp?.discountPercentage === 'number'
                            ? Math.round(rp.discountPercentage)
                            : (rp?.originalPrice && rp?.discountPrice
                                ? Math.round(100 - (Number(rp.discountPrice) / Number(rp.originalPrice)) * 100)
                                : null);
                          return (pct && isFinite(pct) && pct > 0) ? (
                            <span className="inline-block mt-1 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                              -{pct}%
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-300">No related products found.</p>
            )}
          </div>
        </div>
      </div>

      <AddToCartConfirmationPopup
        isVisible={showConfirmationPopup}
        productName={prod?.name}
        quantity={quantity}
        onClose={handleCloseConfirmationPopup}
      />
    </div>
  );
};

export default ProductDetailsPage;
