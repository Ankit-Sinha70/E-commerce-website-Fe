import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// GET all products
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async ({ accessToken, searchTerm = "", category, subcategory, minPrice, maxPrice, sortBy, page = 1, limit = 10 }) => {
    const query = new URLSearchParams();
    if (searchTerm) query.append("name", searchTerm);
    if (category && category !== "All") query.append("category", category);
    if (subcategory) query.append("subcategory", subcategory);
    if (minPrice != null && minPrice !== "") query.append("minPrice", minPrice);
    if (maxPrice != null && maxPrice !== "") query.append("maxPrice", maxPrice);
    if (sortBy) query.append("sortBy", sortBy);
    query.append("page", page);
    query.append("limit", limit);

    const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

    const response = await axios.get(
      `${API_URL}/api/product/list?${query.toString()}`,
      config
    );

    return response.data;
  }
);

// GET single product by ID
export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async ({ id, accessToken }) => {
    const response = await axios.get(`${API_URL}/api/product/single/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('response', response)
    return response.data;
  }
);

// CREATE new product with image
export const createProduct = createAsyncThunk(
  "product/createProduct",
  async ({ formData, accessToken }) => {
    const response = await axios.post(`${API_URL}/api/product/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('response', response)
    return response.data.data;
  }
);

// UPDATE product
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ id, formData, accessToken }) => {
    const response = await axios.put(`${API_URL}/api/product/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  }
);

// DELETE product
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async ({ id, accessToken }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/product/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        transformResponse: [(data) => {
          if (data === '') {
            return null;
          }
          try {
            return JSON.parse(data);
          } catch (e) {
            console.error("JSON parsing error for non-empty response:", e, "Data:", data);
            throw e;
          }
        }]
      });
      return id;
    } catch (error) {
      console.error("Error during product deletion in thunk:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete product";
      return rejectWithValue(errorMessage);
    }
  }
);


const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    product: null,
    relatedProducts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProduct(state) {
      state.product = null;
      state.relatedProducts = [];
    },
    // Optimistically prepend a product to the current list
    prependProduct(state, action) {
      if (!state.products) state.products = [];
      state.products.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Show newer first by sorting only on ObjectId descending (no createdAt)
        const fetchedProducts = action.payload.data || [];
        state.products = [...fetchedProducts].sort((a, b) =>
          String(b?._id || "").localeCompare(String(a?._id || ""))
        );
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize: some APIs return { product }, some { data }, some the entity/array directly
        state.product = action.payload?.product || action.payload?.data?.product || action.payload?.data || action.payload;
        state.relatedProducts = action.payload?.data?.relatedProducts || action.payload?.relatedProducts || [];
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Prepend the newly created product so it appears at the top of lists
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;