import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  RotateCw,
  Plus,
  Edit,
  Trash2,
  PackageOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AddProductFormContent from "../../component/AddProductFormContent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  deleteProduct,
} from "../../features/product/productSlice";
import useDebounce from "../../lib/useDebounce";
import Loader from "@/component/common/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ManageProductsPage = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const [filterCategory, setFilterCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProductsData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Authentication Required", {
        description: "Please login to view products.",
      });
      return;
    }
    dispatch(
      fetchProducts({
        accessToken: token,
        searchTerm: debouncedSearchTerm,
        category: filterCategory,
      })
    );
  };

  useEffect(() => {
    fetchProductsData();
    if (error) {
      toast.error("Error fetching products", { description: error });
    }
  }, [debouncedSearchTerm, filterCategory, dispatch, error]);

  // const productCategories = [
  //   "Ice Tubes",
  //   "Ice Cubes",
  //   "Crushed Ice",
  //   "Flakes Ice",
  //   "Solid Ice",
  //   "Ice Ball",
  //   "Ice Sculpture",
  //   "Custom Ice",
  //   "Ice Cup",
  //   "Dry Ice",
  //   "Block Ice",
  //   "Arctic Ice",
  //   "Luxury Box",
  //   "Freezers",
  //   "Machines",
  // ].sort();

  const handleSearch = () => {
    fetchProductsData();
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilterCategory("All");
  };

  // const handleEdit = (product) => {
  //   setEditingProduct(product);
  //   setIsModalOpen(true);
  // };

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
        description: "Please login to delete products.",
      });
      setProductToDelete(null);
      return;
    }
    try {
      await dispatch(
        deleteProduct({ id: productToDelete._id, accessToken: token })
      ).unwrap();

      toast.success("Product Deleted", {
        description: `Product "${productToDelete.name}" has been deleted successfully.`,
      });
      setProductToDelete(null);

      fetchProductsData();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Error deleting product", {
        description: typeof err === "string" ? err : err.message || String(err),
      });
      setProductToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    fetchProductsData();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 lg:mb-6">
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
                  className="flex-1 rounded-r-none border-r-0"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-l-none px-4"
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
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>

            {/* Add Product Button */}
            <div>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-auto whitespace-nowrap"
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
          <DialogContent className="no-scrollbar">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <AddProductFormContent
              onClose={handleCloseModal}
              onProductAdded={fetchProductsData}
              initialData={editingProduct}
              categories={categories}
              loading={loading}
              error={error}
            />
          </DialogContent>
        </Dialog>
        {/* End Dialog */}

        {/* Products Content */}
        <div className="p-4 lg:p-6">
          {loading ? (
            <Loader message={"Loading Products..."} />
          ) : products?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <PackageOpen className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-xl font-semibold mb-2">No products found</p>
              <p className="text-md">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-800 text-white text-left">
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
                        className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {product?.category?.name}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
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
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Product</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Delete Button with Tooltip */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                  onClick={() => handleDelete(product)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
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
                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                  >
                    <div className="flex space-x-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Category:</span>
                            <span className="ml-1 text-gray-900">
                              {product.category.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Stock:</span>
                            <span className="ml-1 text-gray-900">
                              {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
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
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <AlertDialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <AlertDialogContent className="w-96">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-medium text-foreground">
                "{productToDelete?.name}"
              </span>{" "}
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                setProductToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageProductsPage;
