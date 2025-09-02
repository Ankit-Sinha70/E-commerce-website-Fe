import { Loader } from "@/component/Common/Loader.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const slugify = (s = "") =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const CategoryListingPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/category?status=Active&page=1&limit=100`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load categories");
        const cats = data?.categories || data?.data || [];
        setItems(Array.isArray(cats) ? cats : []);
      } catch (e) {
        setError(e.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader message="Loading categories..." /></div>;
  if (error) return <div className="text-center text-red-400 py-16">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 mt-20">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-3" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><Link to="/" className="hover:text-white">Home</Link></li>
          <li>/</li>
          <li className="text-white">Categories</li>
        </ol>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Shop by Category</h1>
      {items.length === 0 ? (
        <div className="text-gray-400">No categories found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((c) => (
            <Link
              key={c._id}
              to={`/c/${slugify(c.name) || c._id}`}
              state={{ id: c._id }}
              className="bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-white"
            >
              <div className="font-semibold line-clamp-2">{c.name}</div>
              {c.image && (
                <img src={c.image} alt={c.name} className="mt-3 w-full h-28 object-cover rounded" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryListingPage;
