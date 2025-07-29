import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCategories } from "@/features/category/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const AddProductFormContent = ({ onClose, onProductAdded, initialData }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const { accessToken } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Load categories when component mounts
  useEffect(() => {
    dispatch(getCategories({ accessToken }));
  }, [dispatch]);

  useEffect(() => {
    if (initialData && categories && categories.length > 0) {
      let categoryToSet = "";
      if (initialData.category) {
        if (
          typeof initialData.category === "object" &&
          initialData.category._id
        ) {
          categoryToSet = String(initialData.category._id);
        } else if (
          typeof initialData.category === "string" ||
          typeof initialData.category === "number"
        ) {
          // Try to find by ID or name
          const byId = categories.find(
            (cat) => String(cat._id) === String(initialData.category)
          );
          if (byId) {
            categoryToSet = String(byId._id);
          } else {
            const byName = categories.find(
              (cat) =>
                cat.name.toLowerCase() ===
                String(initialData.category).toLowerCase()
            );
            if (byName) categoryToSet = String(byName._id);
          }
        }
      }
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price ? initialData.price.toString() : "",
        category: categoryToSet,
        image: initialData.image || "",
      });
    } else if (!initialData) {
      // For add mode, reset form
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
      });
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

  // const handleSelectChange = (value) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     category: value,
  //   }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Authentication Required", {
        description: "Please log in to perform this action.",
      });
      onClose();
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      if (key !== "image") {
        formData.append(key, form[key]);
      }
    }
    formData.set("price", parseFloat(form.price));

    if (form.image) {
      formData.append("image", form.image);
    }

    const method = initialData ? "PUT" : "POST";
    const url = initialData
      ? `${API_URL}/api/product/update/${initialData._id}`
      : `${API_URL}/api/product/create`;

    try {
      setIsSubmitting(true);
      setFormError(null);
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

      toast.success("Success", {
        description:
          data.message ||
          `Product ${initialData ? "updated" : "added"} successfully!`,
      });
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
      });
      onProductAdded();
      onClose();
    } catch (err) {
      console.error(
        `Error ${initialData ? "updating" : "adding"} product:`,
        err
      );
      setFormError(
        err.message ||
          `An unexpected error occurred while ${
            initialData ? "updating" : "adding"
          } the product.`
      );
      toast.error("Error", {
        description:
          err.message ||
          `An unexpected error occurred while ${
            initialData ? "updating" : "adding"
          } the product.`,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleCategorySelectOpenChange = (open) => {
  //   if (open && categories?.length === 0) {
  //     dispatch(getCategories());
  //   }
  // };

  // Get the selected category name for display
    categories?.find((cat) => cat._id === form.category)?.name || "";
  

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-2 overflow-y-auto hide-scrollbar"
      >
        <div>
          <label htmlFor="name">Product Name</label>
          <Input
            type="text"
            id="name"
            name="name"
            placeholder="e.g., Crystal Clear Ice Cubes"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <Textarea
            id="description"
            name="description"
            placeholder="A detailed description of the product..."
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="price">Price (AED)</label>
          <Input
            type="number"
            id="price"
            name="price"
            placeholder="e.g., 25.00"
            value={form.price}
            onChange={handleChange}
            required
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select
            name="category"
            value={form.category || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            required
            className="w-full border rounded p-2"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          {imagePreviewUrl && (
            <div className="mt-2">
              <span className="block text-sm text-gray-700 mb-1">
                Current Image:
              </span>
              <a
                href={imagePreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={imagePreviewUrl}
                  alt="Current Product Image"
                  className="w-24 h-24 object-cover object-center rounded-md"
                />
              </a>
              <p className="text-sm text-gray-500 mt-1">
                Upload new to replace
              </p>
            </div>
          )}
          <label htmlFor="image">
            {imagePreviewUrl ? "Update image" : "Add Image"}
          </label>
          <Input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required={!initialData || !initialData.image}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading...</p>
                  </div>
                </div>
                {initialData ? "Updating..." : "Adding..."}
              </span>
            ) : initialData ? (
              "Update Product"
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
        {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
      </form>
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductFormContent;
