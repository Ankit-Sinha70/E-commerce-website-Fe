import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit,
  Trash2,
  PackageOpen,
  XCircle,
  CheckCircle2,
  X,
  Search,
  RotateCcw,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Toaster } from "../../components/ui/sonner";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../features/category/categorySlice";
import useDebounce from "../../lib/useDebounce";
import Loader from "@/component/common/Loader";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ManageCategory = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.category);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = React.useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [categoryToDelete, setCategoryToDelete] = React.useState(null);
  const [categoryName, setCategoryName] = React.useState("");
  const [categoryDescription, setCategoryDescription] = React.useState("");
  const [categoryStatus, setCategoryStatus] = React.useState("Active");
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  const [filterStatus, setFilterStatus] = React.useState("all");

  const fetchCategoriesData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No access token found for fetching categories.");
      toast.warning("Authentication required. Please log in.");
      return;
    }
    dispatch(
      getCategories({
        accessToken: token,
        searchTerm: debouncedSearchTerm,
        status: filterStatus,
      })
    );
  };

  useEffect(() => {
    fetchCategoriesData();
  }, [dispatch, debouncedSearchTerm, filterStatus]);

  const hasCategories = categories && categories.length > 0;

  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryStatus("Active");
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setCategoryStatus(category.status);
    setIsAddEditModalOpen(true);
  };

  const handleSubmitCategory = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No access token found for creating/updating category.");
      toast.warning("Authentication required. Please log in.");
      return;
    }

    const categoryData = {
      name: categoryName,
      description: categoryDescription,
      status: categoryStatus,
    };

    if (editingCategory) {
      dispatch(
        updateCategory({
          _id: editingCategory._id,
          updateData: categoryData,
          accessToken: token,
        })
      )
        .unwrap()
        .then(() => {
          setIsAddEditModalOpen(false);
          fetchCategoriesData();
          toast.success("Category updated successfully!");
        })
        .catch((err) => {
          console.error("Failed to update category:", err);
          toast.error(
            `Failed to update category: ${err.message || "Unknown error"}`
          );
        });
    } else {
      dispatch(createCategory({ categoryData, accessToken: token }))
        .unwrap()
        .then(() => {
          setIsAddEditModalOpen(false);
          fetchCategoriesData();
          toast.success("Category created successfully!");
        })
        .catch((err) => {
          console.error("Failed to create category:", err);
          toast.error(
            `Failed to create category: ${err.message || "Unknown error"}`
          );
        });
    }
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("No access token found for deleting category.");
        toast.warning("Authentication required. Please log in.");
        return;
      }
      dispatch(
        deleteCategory({ _id: categoryToDelete._id, accessToken: token })
      )
        .unwrap()
        .then(() => {
          setCategoryToDelete(null);
          setIsDeleteConfirmModalOpen(false);
          fetchCategoriesData();
          toast.success("Category deleted successfully!");
        })
        .catch((err) => {
          console.error("Failed to delete category:", err);
          toast.error(
            `Failed to delete category: ${err.message || "Unknown error"}`
          );
        });
    }
  };

  const handleToggleStatus = (category) => {
    const newStatus = category.status === "Active" ? "Inactive" : "Active";
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No access token found for updating category status.");
      toast.warning("Authentication required. Please log in.");
      return;
    }
    dispatch(
      updateCategory({
        _id: category._id,
        updateData: { status: newStatus },
        accessToken: token,
      })
    )
      .unwrap()
      .then(() => {
        fetchCategoriesData();
        toast.success(`Category status updated to ${newStatus}.`);
      })
      .catch((err) => {
        console.error("Failed to toggle category status:", err);
        toast.error(
          `Failed to update status: ${err.message || "Unknown error"}`
        );
      });
  };

  useEffect(() => {
    if (error) {
      console.error("Category operation error:", error);
      toast.error(
        `Category operation error: ${error.message || "Unknown error"}`
      );
    }
  }, [error]);

  const handleSearch = () => {
    fetchCategoriesData();
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilterStatus("all");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold tracking-tight">
            Categories Management
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="flex-1 min-w-[250px]">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Search by name or description..."
                  className="flex-1 rounded-r-none border-r-0"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="bg-yellow-500 hover:bg-yellow-600 text-white w-full sm:w-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
              </Button>
              <Dialog
                open={isAddEditModalOpen}
                onOpenChange={setIsAddEditModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={handleAddCategoryClick}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory
                        ? "Edit Category"
                        : "Create New Category"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCategory
                        ? "Make changes to your category here."
                        : "Add a new category to your application."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName" className="text-left">
                        Category Name
                      </Label>
                      <Input
                        id="categoryName"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Enter category name"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-left">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        placeholder="Enter category description"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-left">
                        Status
                      </Label>
                      <Select
                        value={categoryStatus}
                        onValueChange={setCategoryStatus}
                      >
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleSubmitCategory}
                    >
                      {editingCategory ? "Update Category" : "Create Category"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {loading ? (
            <Loader message={"Loading Categories..."} />
          ) : !hasCategories ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <PackageOpen className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-xl font-semibold mb-2">No categories found</p>
              <p className="text-md">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full bg-white">
                  <thead className="text-center">
                    <tr className="bg-gray-800 text-white text-left">
                      <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">
                        Category Name
                      </th>
                      <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider hidden md:table-cell">
                        Description
                      </th>
                      <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories?.map((category) => (
                      <tr
                        key={String(category?._id)}
                        className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">
                            {category?.name?.charAt(0)?.toUpperCase() +
                              category?.name?.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="text-sm text-gray-700 max-w-xs truncate">
                            {category?.description
                              ? category?.description
                                  ?.charAt(0)
                                  ?.toUpperCase() +
                                category?.description?.slice(1)
                              : "No description"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              category?.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {category?.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(category?.createdAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(category?.updatedAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2 justify-end">
                            {/* Edit */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline"
                                  className="cursor-pointer text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors"
                                  onClick={() => handleEdit(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Category</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Toggle Status */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline"
                                  className={`cursor-pointer p-1 rounded-md transition-colors ${
                                    category?.status === "Active"
                                      ? "text-red-600 hover:text-red-800 hover:bg-red-100"
                                      : "text-green-600 hover:text-green-800 hover:bg-green-50"
                                  }`}
                                  onClick={() => handleToggleStatus(category)}
                                >
                                  {category?.status === "Active" ? (
                                    <XCircle className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {category?.status === "Active"
                                    ? "Deactivate Category"
                                    : "Activate Category"}
                                </p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Delete */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline"
                                  className="cursor-pointer text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100 transition-colors"
                                  onClick={() => handleDelete(category)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Category</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <AlertDialog
        open={isDeleteConfirmModalOpen}
        onOpenChange={setIsDeleteConfirmModalOpen}
      >
        <AlertDialogContent className="w-96">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="default">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster richColors />
    </div>
  );
};

export default ManageCategory;
