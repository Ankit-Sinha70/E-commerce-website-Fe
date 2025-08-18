import Loader from "@/component/common/Loader";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
  PackageOpen,
  Plus,
  RotateCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import AddProductFormContent from "../../component/AddProductFormContent";
import {
  deleteProduct,
  fetchProducts,
} from "../../features/product/productSlice";
import useDebounce from "../../lib/useDebounce";
import { formatCurrency } from "@/lib/currency";
import PaginationDemo from "@/component/common/Pagination";

const ManageProductsPage = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  console.log("products", products);
  const { categories } = useSelector((state) => state.category);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const [filterCategory, setFilterCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProductsData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Authentication Required", {
        className: "toast-danger",
      });
      return;
    }
    const resultAction = await dispatch(
      fetchProducts({
        accessToken: token,
        searchTerm: debouncedSearchTerm,
        category: filterCategory,
        page: currentPage,
        limit: 10,
      })
    );

    if (fetchProducts.fulfilled.match(resultAction)) {
      console.log("API Response Payload:", resultAction.payload);
      const totalPagesFromResponse = resultAction.payload.pages;
      if (totalPagesFromResponse) {
        setTotalPages(totalPagesFromResponse);
      } else {
        setTotalPages(1);
      }
    }
  };

  useEffect(() => {
    fetchProductsData();
    if (error) {
      toast.error("Error fetching products", {
        className: "toast-danger",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, filterCategory, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProductsData();
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilterCategory("All");
    setCurrentPage(1);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirmDialog(false);
    if (!productToDelete) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Authentication Required", {
        className: "toast-danger",
      });
      setProductToDelete(null);
      return;
    }
    try {
      await dispatch(
        deleteProduct({ id: productToDelete._id, accessToken: token })
      ).unwrap();

      toast.success("Product Deleted", {
        className: "toast-success",
      });
      setProductToDelete(null);

      fetchProductsData();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Error deleting product", {
        className: "toast-danger",  
      });
      setProductToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    fetchProductsData();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Ensure new products show at the top by returning to page 1 after add
  const handleProductAdded = () => {
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#0f172a] text-slate-300 relative px-4 py-4">
      {/* <div className="max-w-9xl mx-auto bg-[rgba(30,30,47,0.6)] backdrop-blur-lg border-r border-white/10 text-white rounded-lg shadow-xl p-4 lg:p-6"> */}
        {/* Header */}
        <div className="border-b border-gray-700 pb-4 lg:pb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-6">
            Products Management
          </h2>

          {/* Search, Filter and Add Product in One Row */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 flex-wrap">
            {/* Search Bar */}
            <div className="flex-1 min-w-[250px]">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Search by name or description..."
                  className="flex-1 rounded-r-none border-r-0 bg-gray-800 text-white border-gray-700 shadow-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <Button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-l-none px-4 shadow-md"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Search</span>
                </Button>
              </div>
            </div>

            {/* Reset Filters Button */}
            <div>
              <Button
                onClick={resetFilters}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>

            {/* Add Product Button */}
            <div>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-auto whitespace-nowrap shadow-md"
                onClick={() => {
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 lg:mr-2" />
                <span className="hidden sm:inline">Add Product</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Dialog for Add/Edit Product */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-800 text-slate-300 shadow-xl rounded-2xl border border-gray-700 no-scrollbar">
          <DialogHeader className="bg-blue-900 text-white p-4 rounded-t-2xl">
            <DialogTitle className="text-xl font-bold">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
            <AddProductFormContent
              onClose={handleCloseModal}
              onProductAdded={handleProductAdded}
              initialData={editingProduct}
              categories={categories}
              loading={loading}
              error={error}
            />
          </DialogContent>
        </Dialog>
        {/* End Dialog */}

        {/* Products Content */}
        <div className="min-h-screen">
          {products?.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <PackageOpen className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-xl font-semibold mb-2">No products found</p>
              <p className="text-md">Try adjusting your search or filters</p>
            </div>
          ) : products?.length > 0 && !loading ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto rounded-lg mt-5 shadow-xl">
                <table className="min-w-full bg-gray-800">
                  <thead className="text-white text-left">
                    <tr className="bg-gray-700">
                      <th className="px-6 py-4 font-medium">Image</th>
                      <th className="px-6 py-4 font-medium">Product Name</th>
                      <th className="px-6 py-4 font-medium">Category</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Stock</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((product) => (
                      <tr
                        key={product._id}
                        className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-md"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {product?.category?.name}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-300">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {/* Edit Button with Tooltip */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 shadow-md"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
                                <p>Edit Product</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Delete Button with Tooltip */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-400 hover:bg-red-900/20 shadow-md"
                                  onClick={() => handleDelete(product)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
                                <p>Delete Product</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {products?.map((product) => (
                  <div
                    key={product._id}
                    className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4"
                  >
                    <div className="flex space-x-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Category:</span>
                            <span className="ml-1 text-gray-300">
                              {product.category.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Price:</span>
                            <span className="ml-1 font-medium text-gray-300">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Stock:</span>
                            <span className="ml-1 text-gray-300">
                              {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 shadow-md"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400 hover:bg-red-900/20 shadow-md"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <PaginationDemo
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <Loader message={"Loading Products..."} />
          )}
        {/* </div> */}
      </div>

      <AlertDialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <AlertDialogContent className="bg-gray-800 text-slate-300 shadow-xl rounded-lg w-96">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-medium text-blue-500">
                "{productToDelete?.name}"
              </span>{" "}
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="text-gray-400 hover:bg-gray-700 hover:text-gray-300 shadow-md"
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                setProductToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white shadow-md"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       {/* Blue Effect Background */}
      {(isModalOpen || showDeleteConfirmDialog) && (
        <div className="fixed inset-0 bg-blue-900 opacity-50 z-40"></div>
      )}
    </div>
  );
};

export default ManageProductsPage;
