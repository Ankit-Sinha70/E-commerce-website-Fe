import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// GET subcategories with optional filters
export const getSubcategories = createAsyncThunk(
  "subcategory/getSubcategories",
  async (
    { accessToken, searchTerm = "", status = "all", category = "", page = 1, limit = 10 } = {},
    { rejectWithValue }
  ) => {
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append("name", searchTerm);
      if (status && status !== "all") query.append("status", status);
      if (category) query.append("category", category);
      query.append("page", page);
      query.append("limit", limit);

      const config = {};
      if (accessToken) config.headers = { Authorization: `Bearer ${accessToken}` };

      const res = await axios.get(`${API_URL}/api/subcategory?${query.toString()}` , config);
      return res.data; // expect { data, totalPages? }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// CREATE subcategory
export const createSubcategory = createAsyncThunk(
  "subcategory/createSubcategory",
  async ({ formData, accessToken }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/subcategory/create`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data; // saved subcategory
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// UPDATE subcategory
export const updateSubcategory = createAsyncThunk(
  "subcategory/updateSubcategory",
  async ({ _id, formData, accessToken }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/subcategory/update/${_id}`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data; // updated subcategory (object)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// DELETE subcategory
export const deleteSubcategory = createAsyncThunk(
  "subcategory/deleteSubcategory",
  async ({ _id, accessToken }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/subcategory/delete/${_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        transformResponse: [
          (data) => {
            if (data === "") return null;
            try { return JSON.parse(data); } catch { return null; }
          }
        ]
      });
      return _id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  totalPages: 1,
};

const subcategorySlice = createSlice({
  name: "subcategory",
  initialState,
  reducers: {
    clearSubcategories: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubcategories.pending, (state) => { state.loading = true; })
      .addCase(getSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const list = payload.data || payload.items || payload.subcategories || [];
        state.items = Array.isArray(list) ? list : [];
        state.totalPages = payload.totalPages || 1;
        state.error = null;
      })
      .addCase(getSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(createSubcategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(updateSubcategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.items = state.items.map((s) => (s._id === updated._id ? updated : s));
      })
      .addCase(updateSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(deleteSubcategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.items = state.items.filter((s) => s._id !== id);
      })
      .addCase(deleteSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSubcategories } = subcategorySlice.actions;
export default subcategorySlice.reducer;
