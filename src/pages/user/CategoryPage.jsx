import Loader from "@/component/Common/Loader";
import PaginationDemo from "@/component/Common/Pagination";
import axios from "axios";
import { PackageOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getCategories } from "../../features/category/categorySlice";

const API_URL = import.meta.env.VITE_API_URL;

const CategoryPage = () => {
  const dispatch = useDispatch();
  const {
    categories = [],
    loading,
    error,
  } = useSelector((state) => state.category);
  console.log("categories", categories);
  const { accessToken } = useSelector((state) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPage = async () => {
      const resultAction = await dispatch(
        getCategories({
          accessToken,
          page: currentPage,
          limit: 10,
          nested: false,
        })
      );
      if (getCategories.fulfilled?.match?.(resultAction)) {
        setTotalPages(resultAction.payload?.totalPages || 1);
      }
    };
    fetchPage();
  }, [dispatch, accessToken, currentPage]);

  const fetchCategoryDetail = async (id) => {
    try {
      const config = accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : {};
      const res = await axios.get(
        `${API_URL}/api/category/${id}?nested=true`,
        config
      );
      const cat = res.data?.category || res.data?.data || res.data;
      setSelectedCategory(cat);
    } catch (e) {
      console.error("Failed to fetch category detail", e);
    }
  };

  const flattenProducts = useMemo(() => {
    const fn = (cat) => {
      if (!cat) return [];
      const own = Array.isArray(cat.products) ? cat.products : [];
      const children = Array.isArray(cat.children) ? cat.children : [];
      return children.reduce((acc, child) => acc.concat(fn(child)), [...own]);
    };
    return fn;
  }, []);

  const selectedProducts = useMemo(
    () => (selectedCategory ? flattenProducts(selectedCategory) : []),
    [selectedCategory, flattenProducts]
  );

  // Resolve a product image URL from common shapes
  const getProductImageUrl = (p) => {
    try {
      const candidates = [];
      if (Array.isArray(p?.images)) candidates.push(p.images[0]);
      if (p?.image) candidates.push(p.image);
      if (p?.thumbnail) candidates.push(p.thumbnail);
      if (p?.mainImage) candidates.push(p.mainImage);

      // pick the first truthy candidate
      let first = candidates.find(Boolean);
      if (!first) return null;

      // If it's an object, try common fields
      let url =
        typeof first === "string"
          ? first
          : first.url || first.path || first.src || null;
      if (!url) return null;

      // Prefix relative urls with API_URL
      const isAbsolute = /^(https?:)?\/\//i.test(url);
      if (isAbsolute) return url;
      // remove leading slash to prevent double slashes
      url = url.replace(/^\//, "");
      return `${API_URL}/${url}`;
    } catch (e) {
      console.error("Failed to get product image URL", e);
      return null;
    }
  };

  useEffect(() => {
    if (!loading && categories.length > 0 && !selectedCategory) {
      fetchCategoryDetail(categories[0]._id);
    }
  }, [loading, categories, selectedCategory, fetchCategoryDetail]);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        <div className="w-64 bg-gray-800 min-h-screen p-6 border-r border-gray-700">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Filter</h2>
            <div className="border-b border-gray-600 pb-2 mb-4"></div>
            <h3 className="text-md font-medium text-white mb-3">Sort</h3>
            <div className="border-b border-gray-600 pb-2 mb-4"></div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Categories
            </h3>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : error ? (
              <div className="text-red-400">Error: {error}</div>
            ) : categories.length === 0 ? (
              <div className="text-gray-400">No categories found</div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className={`text-sm cursor-pointer py-2 px-3 rounded transition-colors duration-200 ${
                      selectedCategory?._id === category._id
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                    onClick={() => fetchCategoryDetail(category._id)}
                  >
                    {category.name}
                  </div>
                ))}

                {/* Pagination in sidebar */}
                <div className="mt-6 pt-4 border-t border-gray-600 hidden">
                  <PaginationDemo
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">
              {selectedCategory ? selectedCategory.name : "Categories"}
            </h1>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader message="Loading categories..." />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-red-400 text-xl">Error: {error}</div>
            </div>
          ) : !selectedCategory ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <PackageOpen className="h-16 w-16 mb-4" />
              <p className="text-xl font-semibold mb-2">Select a category</p>
              <p className="text-md">
                Choose a category from the sidebar to view products.
              </p>
            </div>
          ) : selectedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <PackageOpen className="h-16 w-16 mb-4" />
              <p className="text-xl font-semibold mb-2">No products found</p>
              <p className="text-md">
                This category doesn't have any products yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {selectedProducts.map((product) => {
                const imgUrl = getProductImageUrl(product);
                return (
                  <div
                    key={product._id}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors duration-200"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-700 flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <PackageOpen className="h-12 w-12 text-gray-500" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-white text-lg leading-tight">
                          {product.name}
                        </h3>
                      </div>

                      <div className="mb-3">
                        {/* <p className="text-gray-400 text-sm">Stock: {product.stock}</p> */}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-lg">
                          ${product.price}
                        </span>
                        <Link
                          to={`/product/${product._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
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
      </div>
    </div>
  );
};

export default CategoryPage;
