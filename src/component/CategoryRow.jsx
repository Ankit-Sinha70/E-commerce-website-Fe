import React from "react";
import {
  Edit,
  Trash2,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CategoryRow = ({ category, handleEdit, handleToggleStatus, handleDelete, level }) => {
  return (
    <React.Fragment>
      <tr
        key={String(category?._id)}
        className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors"
      >
        <td className="px-6 py-4">
          <div className="font-bold text-white">
            <span style={{ marginLeft: `${level * 20}px` }}>
              {category?.name?.charAt(0)?.toUpperCase() + category?.name?.slice(1)}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 hidden md:table-cell">
          <div className="text-sm text-gray-400 max-w-xs truncate">
            {category?.description
              ? category?.description?.charAt(0)?.toUpperCase() +
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
        <td className="px-6 py-4 text-gray-400">
          {new Date(category?.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </td>
        <td className="px-6 py-4 text-gray-400">
          {category?.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-12 h-12 object-cover rounded-md"
            />
          ) : (
            "No Image"
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex space-x-2 justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 p-1 rounded-md transition-colors shadow-md"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
                <p>Edit Category</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`p-1 rounded-md transition-colors shadow-md ${
                    category?.status === "Active"
                      ? "text-red-500 hover:text-red-400 hover:bg-red-900/20"
                      : "text-green-500 hover:text-green-400 hover:bg-green-900/20"
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
              <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
                <p>
                  {category?.status === "Active"
                    ? "Deactivate Category"
                    : "Activate Category"}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-400 hover:bg-red-900/20 p-1 rounded-md transition-colors shadow-md"
                  onClick={() => handleDelete(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md shadow-md">
                <p>Delete Category</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </td>
      </tr>
      {category.children &&
        category.children.map((childCategory) => (
          <CategoryRow
            key={String(childCategory?._id)}
            category={childCategory}
            handleEdit={handleEdit}
            handleToggleStatus={handleToggleStatus}
            handleDelete={handleDelete}
            level={level + 1}
          />
        ))}
    </React.Fragment>
  );
};

export default CategoryRow;
