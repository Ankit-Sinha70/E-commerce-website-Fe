import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// GET all products
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async ({ accessToken, searchTerm = "", category = "All" }) => {
    const query = new URLSearchParams();
    if (searchTerm) query.append("name", searchTerm);
    if (category && category !== "All") query.append("category", category);

    const response = await axios.get(
      `${API_URL}/api/product/list?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.products;
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
    return response.data.product;
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
    return response.data.product;
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
    loading: false,
    error: null,
  },
  reducers: {
    clearProduct(state) {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
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
        state.product = action.payload;
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
        state.products.push(action.payload);
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