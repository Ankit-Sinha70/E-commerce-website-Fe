import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCategories } from "@/features/category/categorySlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "./Common/Loader";

const API_URL = import.meta.env.VITE_API_URL;

const AddProductFormContent = ({ onClose, onProductAdded, initialData }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const { accessToken } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discountPrice: "",
    category: "",
    subcategory: "",
    image: "",
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcats, setLoadingSubcats] = useState(false);

  // Load categories when component mounts
  useEffect(() => {
    dispatch(getCategories({ accessToken }));
  }, [dispatch]);

  // Helper: fetch subcategories of a category
  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      setLoadingSubcats(true);
      const res = await fetch(
        `${API_URL}/api/subcategory?category=${encodeURIComponent(categoryId)}&page=1&limit=100`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load subcategories");
      // storefront/admin: show all to admins, but we can still surface status for info
      const items = Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : [];
      setSubcategories(items);
    } catch (e) {
      console.error("Failed to fetch subcategories", e);
      setSubcategories([]);
      toast.error(e.message || "Failed to fetch subcategories", { className: "toast-danger" });
    } finally {
      setLoadingSubcats(false);
    }
  };

  useEffect(() => {
    if (initialData && categories && categories.length > 0) {
      let categoryToSet = "";
      let subcategoryToSet = "";
      // Resolve category
      if (initialData.category) {
        if (typeof initialData.category === "object" && initialData.category._id) {
          categoryToSet = String(initialData.category._id);
        } else if (typeof initialData.category === "string" || typeof initialData.category === "number") {
          const byId = categories.find((cat) => String(cat._id) === String(initialData.category));
          if (byId) categoryToSet = String(byId._id);
        }
      }
      // Resolve subcategory
      if (initialData.subcategory) {
        if (typeof initialData.subcategory === "object" && initialData.subcategory._id) {
          subcategoryToSet = String(initialData.subcategory._id);
        } else if (typeof initialData.subcategory === "string" || typeof initialData.subcategory === "number") {
          subcategoryToSet = String(initialData.subcategory);
        }
      }
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        originalPrice: initialData.originalPrice ? String(initialData.originalPrice) : "",
        discountPrice: initialData.discountPrice ? String(initialData.discountPrice) : "",
        category: categoryToSet,
        subcategory: subcategoryToSet,
        image: initialData.image || (Array.isArray(initialData.images) ? initialData.images[0] : ""),
      });
      if (categoryToSet) fetchSubcategories(categoryToSet);
    } else if (!initialData) {
      // For add mode, reset form
      setForm({
        name: "",
        description: "",
        originalPrice: "",
        discountPrice: "",
        category: "",
        subcategory: "",
        image: null,
      });
      setSubcategories([]);
    }
  }, [initialData, categories]);

  useEffect(() => {
    if (form.image) {
      if (typeof form.image === "string") {
        setImagePreviewUrl(form.image);
      } else if (form.image instanceof File) {
        const objectUrl = URL.createObjectURL(form.image);
        setImagePreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
      }
    } else {
      setImagePreviewUrl(null);
    }
  }, [form.image]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleCategoryChange = async (e) => {
    const nextCat = e.target.value;
    setForm((f) => ({ ...f, category: nextCat, subcategory: "" }));
    await fetchSubcategories(nextCat);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Authentication Required", {
        className: "toast-danger",
        description: "Please log in to perform this action.",
      });
      onClose();
      return;
    }

    // Validation: ensure required fields and price relationship
    const original = parseFloat(form.originalPrice);
    const discount = parseFloat(form.discountPrice);
    if (isNaN(original) || isNaN(discount)) {
      toast.error("Please enter valid numeric prices", { className: "toast-danger" });
      return;
    }
    if (original <= discount) {
      toast.error("Original price must be greater than discount price", { className: "toast-danger" });
      return;
    }
    if (!form.subcategory) {
      toast.error("Please select a subcategory", { className: "toast-danger" });
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("originalPrice", original);
    formData.append("discountPrice", discount);
    formData.append("subcategory", form.subcategory);

    if (form.image) {
      formData.append("image", form.image);
    }

    const method = initialData ? "PUT" : "POST";
    const url = initialData
      ? `${API_URL}/api/product/update/${initialData._id}`
      : `${API_URL}/api/product/create`;

    try {
      setIsSubmitting(true);
      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.message || `Failed to ${initialData ? "update" : "add"} product.`
        );
      }

      toast.success(
        data.message || `Product ${initialData ? "updated" : "added"} successfully!`,
        { className: "toast-success" }
      );
      setForm({
        name: "",
        description: "",
        originalPrice: "",
        discountPrice: "",
        category: "",
        subcategory: "",
        image: "",
      });
      onProductAdded();
      onClose();
    } catch (err) {
      console.error(`Error ${initialData ? "updating" : "adding"} product:`, err);
      toast.error("Error", {
        description: err.message || `An unexpected error occurred while ${initialData ? "updating" : "adding"} the product.`,
        className: "toast-danger",
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the selected category name for display (not rendered but useful if needed)
  categories?.find((cat) => cat._id === form.category)?.name || "";

  return (
    <div className="relative bg-[#0f172a] text-slate-300 h-full overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader message="Saving..." />
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4 h-full overflow-y-auto hide-scrollbar"
      >
        <div>
          <label htmlFor="name" className="text-slate-300">
            Product Name
          </label>
          <Input
            type="text"
            id="name"
            name="name"
            placeholder="e.g., Crystal Clear Ice Cubes"
            value={form.name}
            onChange={handleChange}
            required
            className="bg-gray-700 border-gray-600 text-slate-200 placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="description" className="text-slate-300">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="A detailed description of the product..."
            value={form.description}
            onChange={handleChange}
            required
            className="bg-gray-700 border-gray-600 text-slate-200 placeholder-gray-400"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="originalPrice" className="text-slate-300">
              Original Price (AED)
            </label>
            <Input
              type="number"
              id="originalPrice"
              name="originalPrice"
              placeholder="e.g., 25.00"
              value={form.originalPrice}
              onChange={handleChange}
              required
              step="0.01"
              className="bg-gray-700 border-gray-600 text-slate-200 placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="discountPrice" className="text-slate-300">
              Discount Price (AED)
            </label>
            <Input
              type="number"
              id="discountPrice"
              name="discountPrice"
              placeholder="e.g., 20.00"
              value={form.discountPrice}
              onChange={handleChange}
              required
              step="0.01"
              className="bg-gray-700 border-gray-600 text-slate-200 placeholder-gray-400"
            />
          </div>
        </div>
        <div>
          <label htmlFor="category" className="text-slate-300">
            Category
          </label>
          <select
            name="category"
            value={form.category || ""}
            onChange={handleCategoryChange}
            required
            className="w-full border rounded p-2 bg-gray-700 border-gray-600 text-slate-200"
          >
            <option value="">Select Category</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subcategory" className="text-slate-300">
            Subcategory
          </label>
          <select
            name="subcategory"
            value={form.subcategory || ""}
            onChange={handleChange}
            required
            disabled={!form.category || loadingSubcats}
            className="w-full border rounded p-2 bg-gray-700 border-gray-600 text-slate-200 disabled:opacity-60"
          >
            <option value="">{loadingSubcats ? "Loading..." : "Select Subcategory"}</option>
            {subcategories
              ?.filter((s) => s?.status !== "Inactive")
              ?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          {imagePreviewUrl && (
            <div className="mt-2">
              <span className="block text-sm text-slate-300 mb-1">Current Image:</span>
              <a
                href={imagePreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-gray-600 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <img
                  src={imagePreviewUrl}
                  alt="Current Product Image"
                  className="w-24 h-24 object-cover object-center rounded-md"
                />
              </a>
              <p className="text-sm text-gray-400 mt-1">Upload new to replace</p>
            </div>
          )}
          <label htmlFor="image" className="text-slate-300">
            {imagePreviewUrl ? "Update image" : "Add Image"}
          </label>
          <Input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required={!initialData || !initialData.image}
            className="bg-gray-700 border-gray-600 text-slate-200"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-gray-600 text-slate-300 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader message={initialData ? "Updating..." : "Adding..."} />
            ) : initialData ? (
              "Update Product"
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProductFormContent;
