import { Loader } from "../../component/Common/Loader.jsx";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const slugify = (s = "") =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const SubcategoryListingPage = () => {
  const { categorySlugOrId } = useParams();
  const location = useLocation();
  const initialCategoryId = location.state?.id;

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveCategory = async () => {
    // If we already have id from navigation state, fetch the category by id to get name (optional)
    try {
      if (initialCategoryId) {
        const res = await fetch(`${API_URL}/api/category/${initialCategoryId}`);
        const data = await res.json();
        if (res.ok) return data?.data || data || { _id: initialCategoryId };
      }
      // Try by assuming it's an ObjectId and fetching directly
      const maybeId = categorySlugOrId;
      if (maybeId && /^[a-f\d]{24}$/i.test(maybeId)) {
        const res = await fetch(`${API_URL}/api/category/${maybeId}`);
        const data = await res.json();
        if (res.ok) return data?.data || data;
      }
      // Fallback: list active categories and match slug by name
      const listRes = await fetch(`${API_URL}/api/category?status=Active&page=1&limit=200`);
      const listData = await listRes.json();
      const cats = listData?.categories || listData?.data || [];
      const match = cats.find((c) => slugify(c.name) === String(categorySlugOrId));
      return match || null;
    } catch (e) {
      setError(e.message || "Failed to resolve category");
      return null;
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const cat = await resolveCategory();
      setCategory(cat);
      if (!cat?._id) {
        setSubcategories([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${API_URL}/api/subcategory?category=${encodeURIComponent(cat._id)}&status=Active&page=1&limit=200`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load subcategories");
        // Tolerate different payload shapes
        const raw = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.subcategories)
          ? data.subcategories
          : [];
        const filtered = raw.filter((s) => s && s.status !== "Inactive");
        setSubcategories(filtered);
      } catch (e) {
        setError(e.message || "Failed to load subcategories");
        setSubcategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlugOrId]);

  if (loading) return <div className="flex justify-center py-16"><Loader message="Loading subcategories..." /></div>;
  if (error) return <div className="text-center text-red-400 py-16">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 mt-20">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-3" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><Link to="/" className="hover:text-white">Home</Link></li>
          <li>/</li>
          <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
          <li className="text-white">{category?.name || "Subcategories"}</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{category?.name || "Subcategories"}</h1>
        <Link to="/categories" className="text-sm text-blue-400 hover:text-blue-300">&larr; Back to Categories</Link>
      </div>
      {subcategories.length === 0 ? (
        <div className="text-gray-400">No subcategories found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 mt-6">
          {subcategories.map((s) => (
            <Link
              key={s._id}
              to={`/c/${categorySlugOrId}/s/${slugify(s.name) || s._id}`}
              state={{ categoryId: category?._id, subcategoryId: s._id }}
              className="bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-white"
            >
              <div className="font-semibold line-clamp-2">{s.name}</div>
              {s.image && (
                <img src={s.image} alt={s.name} className="mt-3 w-full h-28 object-cover rounded" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubcategoryListingPage;
