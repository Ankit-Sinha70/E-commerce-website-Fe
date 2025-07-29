import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// GET all categories with optional search and filter
export const getCategories = createAsyncThunk(
  "category/getCategories",
  async (
    { accessToken, searchTerm = "", status = "All" },
    { rejectWithValue }
  ) => {
    try {
      const query = new URLSearchParams();
      if (searchTerm) {
        query.append("name", searchTerm);
      }
      if (status && status !== "All") {
        query.append("status", status);
      }

      const response = await axios.get(
        `${API_URL}/api/category?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch categories";
      return rejectWithValue(errorMessage);
    }
  }
);

//fetch a single category by ID
export const getCategoryById = createAsyncThunk(
  "category/getCategoryById",
  async ({ id, accessToken }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/category/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.category;
    } catch (error) {
      console.error("Error fetching single category:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch category details";
      return rejectWithValue(errorMessage);
    }
  }
);

//create a new category
export const createCategory = createAsyncThunk(
  "category/createCategory",
  async ({ categoryData, accessToken }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/category/create`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.category;
    } catch (error) {
      console.error("Error creating category:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create category";
      return rejectWithValue(errorMessage);
    }
  }
);

//update an existing category
export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ _id, updateData, accessToken }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/category/update/${_id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.category;
    } catch (error) {
      console.error("Error updating category:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update category";
      return rejectWithValue(errorMessage);
    }
  }
);

//delete a category
export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async ({ _id, accessToken }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/category/delete/${_id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        transformResponse: [
          (data) => {
            if (data === "") return null;
            try {
              return JSON.parse(data);
            } catch (e) {
              console.error(
                "JSON parsing error for non-empty delete response:",
                e,
                "Data:",
                data
              );
              throw e;
            }
          },
        ],
      });
      return _id;
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete category";
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearCategoryState: (state) => {
      state.categories = [];
      state.currentCategory = null;
      state.loading = false;
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Categories
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Category By ID
      .addCase(getCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentCategory = null;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
        state.error = null;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.currentCategory = action.payload;
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updatedCategory = action.meta.arg._id;
        state.categories = state.categories.map((category) =>
          category._id === updatedCategory._id ? updatedCategory : category
        );
        if (
          state.currentCategory &&
          state.currentCategory._id === updatedCategory._id
        ) {
          state.currentCategory = updatedCategory;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        const deletedCategoryId = action.payload;
        state.categories = state.categories.filter(
          (category) => category._id !== deletedCategoryId
        );
        if (
          state.currentCategory &&
          state.currentCategory._id === deletedCategoryId
        ) {
          state.currentCategory = null;
        }
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryState, clearCurrentCategory } =
  categorySlice.actions;
export default categorySlice.reducer;
