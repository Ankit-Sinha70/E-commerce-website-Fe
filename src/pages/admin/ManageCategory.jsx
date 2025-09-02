import CategoryRow from "@/component/CategoryRow";
import PaginationDemo from "../../component/Common/Pagination.jsx";
import {
  PackageOpen,
  Plus,
  RotateCcw,
  Search
} from "lucide-react";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
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
import { Button } from "../../components/ui/button";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../features/category/categorySlice";
import useDebounce from "../../lib/useDebounce";
import { Loader } from "@/component/Common/Loader.jsx";

const buildCategoryTree = (categories, parentId = null, level = 0) => {
  const nestedCategories = [];
  categories
    .filter((cat) => {
      if (parentId === null) {
        return !cat.parentCategory || cat.parentCategory === "" || cat.parentCategory === null;
      }
      return cat.parentCategory === parentId;
    })
    .forEach((cat) => {
      nestedCategories.push({
        ...cat,
        level,
        children: buildCategoryTree(categories, cat?._id, level + 1),
      });
    });
  return nestedCategories;
};

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
  const [categoryImage, setCategoryImage] = React.useState(null);
  const [parentCategory, setParentCategory] = React.useState("");
  const [categoryStatus, setCategoryStatus] = React.useState("Active");
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchCategoriesData = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.warning("Authentication required. Please log in.", {
        className: "toast-warning",
      });
      return;
    }
    const resultAction = await dispatch(
      getCategories({
        accessToken: token,
        searchTerm: debouncedSearchTerm,
        status: filterStatus,
        page: currentPage,
        limit: 10,
      })
    );

    if (getCategories.fulfilled.match(resultAction)) {
      setTotalPages(resultAction.payload.totalPages || 1);
    }
  }, [dispatch, debouncedSearchTerm, filterStatus, currentPage]);

  useEffect(() => {
    fetchCategoriesData();
  }, [fetchCategoriesData]);

  const hasCategories = categories && categories.length > 0;

  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryImage(null);
    setParentCategory("");
    setCategoryStatus("Active");
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name || "");
    setCategoryDescription(category.description || "");
    setCategoryStatus(category.status || "Active");
    setCategoryImage(null);
    setParentCategory(category?.parentCategory?._id || "");
    setIsAddEditModalOpen(true);
  };

  const handleSubmit = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.warning("Authentication required. Please log in.");
      return;
    }
  
    try {
      const formData = new FormData();
  
      // Only append fields if they have a value
      if (categoryName) formData.append("name", categoryName);
      if (categoryDescription) formData.append("description", categoryDescription);
      if (categoryStatus) formData.append("status", categoryStatus);
      if (parentCategory && parentCategory !== "") formData.append("parentCategory", parentCategory);
      if (categoryImage instanceof File) formData.append("image", categoryImage);
  
      const action = editingCategory
        ? updateCategory({
            _id: editingCategory._id,
            formData,
            accessToken: token,
          })
        : createCategory({
            formData,
            accessToken: token,
          });
  
      dispatch(action)
        .unwrap()
        .then(() => {
          setIsAddEditModalOpen(false);
          fetchCategoriesData();
          toast.success(
            `Category ${editingCategory ? "updated" : "created"} successfully!`,
            { className: "toast-success" }
          );
        })
        .catch((err) => {
          toast.error(
            `Failed to ${
              editingCategory ? "update" : "create"
            } category: ${err?.message || "Unknown error"}`,
            { className: "toast-danger" }
          );
        });
    } catch (error) {
      console.log('error', error)
      toast.error("Unexpected error occurred", { className: "toast-danger" });
    }
  };
  

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;

    // Check if the category to delete has any children
    const hasChildren = categories.some(
      (cat) => cat.parentCategory?._id === categoryToDelete._id
    );

    if (hasChildren) {
      toast.error("Cannot delete category with subcategories.", {
        className: "toast-danger",
      });
      setIsDeleteConfirmModalOpen(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.warning("Authentication required. Please log in.", {
        className: "toast-warning",
      });
      return;
    }

    dispatch(deleteCategory({ _id: categoryToDelete._id, accessToken: token }))
      .unwrap()
      .then(() => {
        setCategoryToDelete(null);
        setIsDeleteConfirmModalOpen(false);
        fetchCategoriesData();
        toast.success("Category deleted successfully!", {
          className: "toast-success",
        });
      })
      .catch((err) => {
        toast.error(
          `Failed to delete category: ${err?.message || "Unknown error"}`,
          { className: "toast-danger" }
        );
      });
  };

  const handleToggleStatus = (category) => {
    const newStatus = category.status === "Active" ? "Inactive" : "Active";
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found!");
      return;
    }
  
    const fd = new FormData();
    fd.append("status", newStatus);
  
    dispatch(
      updateCategory({
        _id: category._id,
        formData: fd,
        accessToken: token,
      })
    )
      .unwrap()
      .then(() => {
        console.log("Status updated successfully");
      })
      .catch((err) => {
        console.error("Failed to update status", err);
      });
  };
  

  useEffect(() => {
    if (error) {
      toast.error(`${error || "Unknown error"}`, {
        className: "toast-danger",
      });
    }
  }, [error]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategoriesData();
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const hierarchicalCategories = buildCategoryTree(categories);

  return (
    <div className="bg-[#0f172a] text-slate-300 min-h-screen">
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Categories Management
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <div className="flex-1 min-w-[250px]">
            <div className="flex">
              <Input
                type="text"
                placeholder="Search by name..."
                className="flex-1 rounded-r-none border-r-0 bg-gray-800 text-white border-gray-700 shadow-md focus:ring-blue-500 focus:border-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px] bg-gray-800 text-white border-gray-700 shadow-md">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="bg-yellow-500 hover:bg-yellow-600 text-white w-full sm:w-auto shadow-md"
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
                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto shadow-md"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-slate-300 shadow-xl rounded-lg sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingCategory ? "Edit Category" : "Create New Category"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
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
                      className="w-full bg-gray-700 text-white border-gray-600 shadow-md focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full bg-gray-700 text-white border-gray-600 shadow-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-left">
                      Image Upload
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      onChange={(e) => setCategoryImage(e.target.files[0])}
                      className="w-full bg-gray-700 text-white border-gray-600 shadow-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentCategory" className="text-left">
                      Parent Category (Optional)
                    </Label>
                    <Select
                      value={parentCategory}
                      onValueChange={(value) => setParentCategory(value === "none" ? "" : value)}
                    >
                      <SelectTrigger
                        id="parentCategory"
                        className="w-full bg-gray-700 text-white border-gray-600 shadow-md"
                      >
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-white">
                        {/* use empty string to represent "no parent" */}
                        <SelectItem value="none">No Parent Category</SelectItem>
                        {categories
                          .filter((cat) => cat?._id !== editingCategory?._id)
                          .map((cat) => (
                            <SelectItem key={cat?._id} value={cat?._id}>
                              {cat?.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-left">
                      Status
                    </Label>
                    <Select
                      value={categoryStatus}
                      onValueChange={setCategoryStatus}
                    >
                      <SelectTrigger
                        id="status"
                        className="w-full bg-gray-700 text-white border-gray-600 shadow-md"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-white">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="text-gray-400 shadow-md">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    onClick={handleSubmit}
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
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <PackageOpen className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-xl font-semibold mb-2">No categories found</p>
            <p className="text-md">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-xl">
              <table className="min-w-full bg-gray-800">
                <thead className="text-center">
                  <tr className="bg-gray-700 text-white text-left">
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
                      Image
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hierarchicalCategories?.map((category) => (
                    <CategoryRow
                      key={String(category?._id)}
                      category={category}
                      handleEdit={handleEdit}
                      handleToggleStatus={handleToggleStatus}
                      handleDelete={handleDelete}
                      level={0}
                    />
                  ))}

                  {hierarchicalCategories.length > 0 && categories.filter(c => !c.parentCategory).length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-400">
                        No root categories found. All categories might be subcategories.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <PaginationDemo
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>

      <AlertDialog
        open={isDeleteConfirmModalOpen}
        onOpenChange={setIsDeleteConfirmModalOpen}
      >
        <AlertDialogContent className="bg-gray-800 text-slate-300 shadow-xl rounded-lg w-96">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-gray-400 shadow-md">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white shadow-md"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageCategory;
