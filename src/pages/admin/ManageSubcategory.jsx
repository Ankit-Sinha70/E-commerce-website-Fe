import PaginationDemo from "../../component/Common/Pagination.jsx";
import { PackageOpen, Plus, RotateCcw, Search } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCategories } from "@/features/category/categorySlice";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  updateSubcategory,
} from "@/features/subcategory/subcategorySlice";
import { Loader } from "@/component/Common/Loader.jsx";

const ManageSubcategory = () => {
  const dispatch = useDispatch();
  const { items, loading, totalPages } = useSelector((s) => s.subcategory);
  const { categories } = useSelector((s) => s.category);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = React.useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [toDelete, setToDelete] = React.useState(null);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState(null);
  const [category, setCategory] = React.useState("");
  const [status, setStatus] = React.useState("Active");

  const [searchInput, setSearchInput] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterCategory, setFilterCategory] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  const fetchList = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.warning("Authentication required. Please log in.", { className: "toast-warning" });
      return;
    }
    const categoryParam = filterCategory === "all" ? "" : filterCategory;
    await dispatch(getSubcategories({
      accessToken: token,
      searchTerm: searchInput,
      status: filterStatus,
      category: categoryParam,
      page: currentPage,
      limit: 10,
    }));
  }, [dispatch, searchInput, filterStatus, filterCategory, currentPage]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    // ensure categories are loaded for select inputs
    const token = localStorage.getItem("accessToken");
    dispatch(getCategories({ accessToken: token, page: 1, limit: 200 }));
  }, [dispatch]);

  const openAdd = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setImage(null);
    setCategory("");
    setStatus("Active");
    setIsAddEditModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setName(item.name || "");
    setDescription(item.description || "");
    setStatus(item.status || "Active");
    setImage(null);
    setCategory(item?.category?._id || item?.category || "");
    setIsAddEditModalOpen(true);
  };

  const handleSubmit = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.warning("Authentication required. Please log in.");
      return;
    }
    if (!name || !category) {
      toast.error("Name and Category are required", { className: "toast-danger" });
      return;
    }
    const fd = new FormData();
    fd.append("name", name);
    if (description) fd.append("description", description);
    fd.append("status", status);
    fd.append("category", category);
    if (image instanceof File) fd.append("image", image);

    const action = editingItem
      ? updateSubcategory({ _id: editingItem._id, formData: fd, accessToken: token })
      : createSubcategory({ formData: fd, accessToken: token });

    dispatch(action)
      .unwrap()
      .then(() => {
        setIsAddEditModalOpen(false);
        fetchList();
        toast.success(`Subcategory ${editingItem ? "updated" : "created"} successfully!`, { className: "toast-success" });
      })
      .catch((err) => {
        toast.error(`Failed to ${editingItem ? "update" : "create"} subcategory: ${err || "Unknown error"}`, { className: "toast-danger" });
      });
  };

  const handleDelete = (item) => {
    setToDelete(item);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const token = localStorage.getItem("accessToken");
    dispatch(deleteSubcategory({ _id: toDelete._id, accessToken: token }))
      .unwrap()
      .then(() => {
        setToDelete(null);
        setIsDeleteConfirmModalOpen(false);
        fetchList();
        toast.success("Subcategory deleted successfully!", { className: "toast-success" });
      })
      .catch((err) => {
        toast.error(`Failed to delete subcategory: ${err || "Unknown error"}`, { className: "toast-danger" });
      });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchList();
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilterStatus("all");
    setFilterCategory("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="bg-[#0f172a] text-slate-300 min-h-screen">
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <h2 className="text-3xl font-bold tracking-tight text-white">Subcategories Management</h2>

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
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white rounded-l-none px-4 shadow-md">
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
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[220px] bg-gray-800 text-white border-gray-700 shadow-md">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters} className="bg-yellow-500 hover:bg-yellow-600 text-white w-full sm:w-auto shadow-md">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>

            <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto shadow-md">
                  <Plus className="mr-1 h-4 w-4" /> Add Subcategory
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-slate-300 shadow-xl rounded-lg sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-white">{editingItem ? "Edit Subcategory" : "Create New Subcategory"}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingItem ? "Make changes to your subcategory here." : "Add a new subcategory to your application."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-left">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter subcategory name" className="w-full bg-gray-700 text-white border-gray-600 shadow-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-left">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" className="w-full bg-gray-700 text-white border-gray-600 shadow-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-left">Image Upload</Label>
                    <Input id="image" type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full bg-gray-700 text-white border-gray-600 shadow-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-left">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="w-full bg-gray-700 text-white border-gray-600 shadow-md">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-white">
                        {categories?.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-left">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status" className="w-full bg-gray-700 text-white border-gray-600 shadow-md">
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
                    <Button variant="outline" className="text-gray-400 shadow-md">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md" onClick={handleSubmit}>
                    {editingItem ? "Update Subcategory" : "Create Subcategory"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {loading ? (
          <Loader message={"Loading Subcategories..."} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <PackageOpen className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-xl font-semibold mb-2">No subcategories found</p>
            <p className="text-md">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-xl">
              <table className="min-w-full bg-gray-800">
                <thead className="text-center">
                  <tr className="bg-gray-700 text-white text-left">
                    <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider hidden md:table-cell">Description</th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s._id} className="border-t border-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-white">{s.name}</td>
                      <td className="px-6 py-4 whitespace-pre-wrap text-gray-300 hidden md:table-cell">{s.description || "-"}</td>
                      <td className="px-6 py-4 text-gray-300">{s?.category?.name || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${s.status === 'Active' ? 'bg-green-700 text-white' : 'bg-gray-500 text-white'}`}>{s.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        {s.image ? (
                          <img src={s.image} alt={s.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <span className="text-gray-500 text-sm">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openEdit(s)}>Edit</Button>
                        <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={() => handleDelete(s)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <PaginationDemo currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>

      <AlertDialog open={isDeleteConfirmModalOpen} onOpenChange={setIsDeleteConfirmModalOpen}>
        <AlertDialogContent className="bg-gray-800 text-slate-300 shadow-xl rounded-lg w-96">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">Are you sure you want to delete the subcategory "{toDelete?.name}"? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-gray-400 shadow-md">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white shadow-md" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageSubcategory;
