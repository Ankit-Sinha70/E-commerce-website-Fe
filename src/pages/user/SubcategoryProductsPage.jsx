import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import Loader from "@/component/Common/Loader";
import { fetchProducts } from "@/features/product/productSlice";
import { formatCurrency } from "@/lib/currency";

const API_URL = import.meta.env.VITE_API_URL;

const slugify = (s = "") =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const SubcategoryProductsPage = () => {
  const { categorySlugOrId, subcategorySlugOrId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { products, loading } = useSelector((s) => s.product);
  const { accessToken } = useSelector((s) => s.auth);
  console.log("access", accessToken);

  const [subcategory, setSubcategory] = useState(null);
  const [error, setError] = useState(null);

  const resolveCategory = async () => {
    // Try resolve category similarly as in SubcategoryListingPage
    try {
      const maybeId = location.state?.categoryId || categorySlugOrId;
      if (maybeId && /^[a-f\d]{24}$/i.test(maybeId)) {
        const res = await fetch(`${API_URL}/api/category/${maybeId}`);
        const data = await res.json();
        if (res.ok) return data?.data || data;
      }
      const listRes = await fetch(
        `${API_URL}/api/category?status=Active&page=1&limit=200`
      );
      const listData = await listRes.json();
      const cats = listData?.categories || listData?.data || [];
      const match = cats.find(
        (c) => slugify(c.name) === String(categorySlugOrId)
      );
      return match || null;
    } catch (e) {
      setError(e.message || "Failed to resolve category");
      return null;
    }
  };

  const resolveSubcategory = async () => {
    try {
      const stateId = location.state?.subcategoryId;
      if (stateId) return { _id: stateId };
      // If subcategory param is an ObjectId, use it directly
      const maybeId = subcategorySlugOrId;
      if (maybeId && /^[a-f\d]{24}$/i.test(maybeId)) {
        return { _id: maybeId };
      }
      // Otherwise, list subcategories of resolved category and match slug
      const cat = await resolveCategory();
      if (!cat?._id) return null;
      const res = await fetch(
        `${API_URL}/api/subcategory?category=${encodeURIComponent(
          cat._id
        )}&status=Active&page=1&limit=200`
      );
      const data = await res.json();
      const arr = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.subcategories)
        ? data.subcategories
        : [];
      const match = arr.find(
        (s) => slugify(s.name) === String(subcategorySlugOrId)
      );
      return match || null;
    } catch (e) {
      setError(e.message || "Failed to resolve subcategory");
      return null;
    }
  };

  useEffect(() => {
    const load = async () => {
      setError(null);
      const sub = await resolveSubcategory();
      setSubcategory(sub);
      if (!sub?._id) return;
      dispatch(
        fetchProducts({
          accessToken: undefined,
          subcategory: sub._id,
          page: 1,
          limit: 24,
        })
      );
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlugOrId, subcategorySlugOrId]);

  if (loading && !products?.length)
    return (
      <div className="flex justify-center py-16">
        <Loader message="Loading products..." />
      </div>
    );
  if (error)
    return <div className="text-center text-red-400 py-16">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 mt-20">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-3" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/" className="hover:text-white">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/categories" className="hover:text-white">
              Categories
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to={`/c/${categorySlugOrId}`} className="hover:text-white">
              Subcategories
            </Link>
          </li>
          <li>/</li>
          <li className="text-white">{subcategory?.name || "Products"}</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {subcategory?.name || "Products"}
        </h1>
        <div className="flex gap-4 text-sm">
          <Link
            to={`/c/${categorySlugOrId}`}
            className="text-blue-400 hover:text-blue-300"
          >
            &larr; Back to Subcategories
          </Link>
          <Link to="/categories" className="text-blue-400 hover:text-blue-300">
            Back to Categories
          </Link>
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="text-gray-400">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const raw =
              product?.images?.[0] ||
              product?.image ||
              product?.thumbnail ||
              product?.mainImage;
            let imgUrl =
              typeof raw === "string"
                ? raw
                : raw?.url || raw?.path || raw?.src || "";
            if (imgUrl && !/^https?:\/\//i.test(imgUrl)) {
              imgUrl = `${String(API_URL || "").replace(/\/$/, "")}/${String(
                imgUrl
              ).replace(/^\//, "")}`;
            }
            return (
              <div
                key={product._id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors duration-200 border border-gray-700 hover:border-gray-600"
              >
                <div className="aspect-square bg-gray-700 flex items-center justify-center">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-gray-500">No Image</div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-white text-base sm:text-lg leading-tight line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-white font-bold text-base sm:text-lg flex flex-col">
                      <span>
                        {formatCurrency(
                          product?.discountPrice ?? product?.price ?? 0
                        )}
                      </span>
                      {product?.originalPrice && product?.discountPrice && (
                        <span className="text-gray-400 line-through text-sm font-normal">
                          {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/product/${product._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 rounded text-xs sm:text-sm font-medium transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubcategoryProductsPage;
