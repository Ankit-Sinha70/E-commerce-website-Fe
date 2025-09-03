import PaginationDemo from "@/component/common/Pagination";
import axios from "axios";
import { PackageOpen, SlidersHorizontal, ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getCategories } from "../../features/category/categorySlice";
import { Loader } from "@/component/common/Loader";

const API_URL = import.meta.env.VITE_API_URL;

const CategoryPage = () => {
  const dispatch = useDispatch();
  const {
    categories = [],
    loading,
    error,
  } = useSelector((state) => state.category);
  
  const { accessToken } = useSelector((state) => state.auth);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(null);
  console.log('selectedCategory', selectedCategory)
  const [categoryDetails, setCategoryDetails] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fetch initial categories
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

  // Fetch category details with nested structure
  const fetchCategoryDetails = async (categoryId) => {
    if (categoryDetails[categoryId]) return categoryDetails[categoryId];
    
    try {
      const config = accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : {};
      const res = await axios.get(
        `${API_URL}/api/category/${categoryId}?nested=true`,
        config
      );
      const categoryData = res.data?.category || res.data?.data || res.data;
      
      setCategoryDetails(prev => ({
        ...prev,
        [categoryId]: categoryData
      }));
      
      return categoryData;
    } catch (e) {
      console.error("Failed to fetch category details", e);
      return null;
    }
  };

  // Toggle category expansion
  const toggleCategory = async (categoryId) => {
    const newExpanded = new Set(expandedCategories);

    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
      setExpandedCategories(newExpanded); 
    } else {
      newExpanded.add(categoryId);
      setExpandedCategories(newExpanded);
      setLoadingCategories((prev) => new Set(prev).add(categoryId));
      await fetchCategoryDetails(categoryId);
      setLoadingCategories((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
    
    setExpandedCategories(newExpanded);
  };

  // Handle category/subcategory selection
  const handleCategorySelect = async (categoryId, isSubcategory = false) => {
    const categoryData = await fetchCategoryDetails(categoryId);
    setSelectedCategory({
      id: categoryId,
      data: categoryData,
      isSubcategory
    });

    // Extract products from selected category
    if (categoryData) {
      const products = extractProductsFromCategory(categoryData);
      setSelectedProducts(products);
    }
  };

  // Extract all products from a category (including nested)
  const extractProductsFromCategory = (category) => {
    if (!category) return [];
    
    let products = [];
    
    // Add direct products
    if (Array.isArray(category.products)) {
      products = [...products, ...category.products];
    }
    
    // Add products from children recursively
    const children = category?.children ?? category?.subcategories ?? category?.subCategories ?? category?.childCategories ?? [];
    if (Array.isArray(children)) {
      children.forEach(child => {
        products = [...products, ...extractProductsFromCategory(child)];
      });
    }
    
    return products;
  };

  // Get product image URL
  const getProductImageUrl = (product) => {
    try {
      const candidates = [];
      if (Array.isArray(product?.images)) candidates.push(product.images[0]);
      if (product?.image) candidates.push(product.image);
      if (product?.thumbnail) candidates.push(product.thumbnail);
      if (product?.mainImage) candidates.push(product.mainImage);

      let first = candidates.find(Boolean);
      if (!first) return null;

      let url = typeof first === "string" ? first : first.url || first.path || first.src || null;
      if (!url) return null;

      const isAbsolute = /^(https?:)?\/\//i.test(url);
      if (isAbsolute) return url;
      
      url = url.replace(/^\//, "");
      return `${API_URL}/${url}`;
    } catch (e) {
      console.error("Failed to get product image URL", e);
      return null;
    }
  };

  // Render category tree recursively
  const renderCategoryTree = (categoryList, level = 0) => {
    return categoryList.map((category) => {
      const isExpanded = expandedCategories.has(category._id);
      const categoryDetail = categoryDetails[category._id];
      const childrenList = categoryDetail ? (categoryDetail.children ?? categoryDetail.subcategories ?? categoryDetail.subCategories ?? categoryDetail.childCategories ?? []) : [];
      const hasChildren = Array.isArray(childrenList) && childrenList.length > 0;
      const isSelected = selectedCategory?.id === category._id;
      const isLoading = loadingCategories.has(category._id);
 
      return (
        <div key={category._id} className="select-none">
          <div
            className={`flex items-center py-2 px-2 rounded cursor-pointer transition-colors duration-200 ${
              isSelected
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {/* Expand/Collapse button */}
            <button
              onClick={() => toggleCategory(category._id)}
              className="flex items-center justify-center w-6 h-6 mr-2"
            >
              {hasChildren || !categoryDetail ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>

            {/* Category name */}
            <button
              onClick={() => handleCategorySelect(category._id, level > 0)}
              className="flex-1 text-left text-sm font-medium"
              title={category.name}
            >
              {category.name}
            </button>
          </div>

          {/* Render children if expanded */}
          {isExpanded && (
            <div className="mt-1">
              {isLoading ? (
                <div className="text-gray-400 text-sm py-1" style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}>
                  Loading...
                </div>
              ) : hasChildren ? (
                renderCategoryTree(childrenList, level + 1)
              ) : categoryDetail ? (
                <div className="text-gray-500 text-sm py-1" style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}>
                  No subcategories
                </div>
              ) : null}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h1 className="text-xl font-semibold text-white">
              {selectedCategory?.data?.name || "Categories"}
            </h1>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm">Categories</span>
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`w-full lg:w-80 bg-gray-800 ${
            showFilters ? "block" : "hidden"
          } lg:block lg:min-h-screen border-b lg:border-b-0 lg:border-r border-gray-700`}
        >
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
              <div className="border-b border-gray-600 pb-2"></div>
            </div>

            {/* Category Tree */}
            <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
              {loading ? (
                <div className="text-gray-400 text-center py-4">Loading categories...</div>
              ) : error ? (
                <div className="text-red-400 text-center py-4">Error: {error}</div>
              ) : categories.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No categories found</div>
              ) : (
                renderCategoryTree(categories.filter((c) => !c?.parentCategory))
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Desktop Header */}
          <div className="mb-6 lg:mb-8 hidden lg:block">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              {selectedCategory?.data?.name || "Select a Category"}
            </h1>
            {selectedCategory?.isSubcategory && (
              <p className="text-gray-400 mt-2">Subcategory</p>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader message="Loading categories..." />
            </div>
          ) : !selectedCategory ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <PackageOpen className="h-16 w-16 mb-4" />
              <p className="text-xl font-semibold mb-2">Select a category</p>
              <p className="text-md">Choose a category from the sidebar to view products.</p>
            </div>
          ) : selectedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <PackageOpen className="h-16 w-16 mb-4" />
              <p className="text-xl font-semibold mb-2">No products found</p>
              <p className="text-md">This category doesn't have any products yet.</p>
            </div>
          ) : (
            <>
              {/* Products Count */}
              <div className="mb-6">
                <p className="text-gray-400">
                  Showing {selectedProducts.length} products in {selectedCategory.data?.name}
                </p>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {selectedProducts.map((product) => {
                  const imgUrl = getProductImageUrl(product);
                  return (
                    <div
                      key={product._id}
                      className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors duration-200 border border-gray-700 hover:border-gray-600"
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
                      <div className="p-3 sm:p-4">
                        <div className="mb-2">
                          <h3 className="font-semibold text-white text-base sm:text-lg leading-tight line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                            <span>
                              ${product?.discountPrice ?? product?.price ?? 0}
                            </span>
                            {product?.originalPrice && product?.discountPrice && (
                              <span className="text-gray-400 line-through text-sm font-normal">
                                ${product.originalPrice}
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
            </>
          )}
        </div>
      </div>

      {/* Pagination (if needed) */}
      {totalPages > 1 && (
        <div className="flex justify-center py-8 bg-gray-900">
          <PaginationDemo 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
    </div>
  );
};

export default CategoryPage;