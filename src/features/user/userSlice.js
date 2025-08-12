import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch all users (admin only)
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async ({ name = "", page = 1, accessToken }, { rejectWithValue }) => {
    try {
      const params = { page };
      if (name) params.name = name;
      const response = await axios.get(`${API_URL}/api/user/all-users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });
      // The backend returns the full pagination object
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch users"
        );
      } else if (axios.isAxiosError(error) && error.request) {
        return rejectWithValue("No response received from server.");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Delete a user (admin or self)
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async ({ id, accessToken }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/api/user/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // The backend returns { success, message }
      return { id, message: response.data.message };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to delete user"
        );
      } else if (axios.isAxiosError(error) && error.request) {
        return rejectWithValue("No response received from server.");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
  profile: null,
  deleteSuccess: null,
  totalPages: 0,
  currentPage: 1,
  totalItems: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUsers: (state) => {
      state.users = [];
      state.error = null;
      state.loading = false;
    },
    clearUserProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
    clearDeleteSuccess: (state) => {
      state.deleteSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.totalItems = action.payload.totalItems;
        state.currentPage = action.payload.page;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.users = [];
        state.error = action.payload || "Failed to fetch users";
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload.id);
        state.deleteSuccess = action.payload.message;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.deleteSuccess = null;
        state.error = action.payload || "Failed to delete user";
      });
  },
});

export const { clearUsers, clearUserProfile, clearDeleteSuccess } =
  userSlice.actions;
export default userSlice.reducer;
