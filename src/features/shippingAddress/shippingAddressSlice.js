import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to get authorization headers
const getConfig = () => {
  const token = localStorage.getItem("accessToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all shipping addresses for the user
export const getShippingAddresses = createAsyncThunk(
  "shippingAddress/getAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/get-address`,
        getConfig()
      );
      return response.data.addresses;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shipping addresses"
      );
    }
  }
);

// Create a new shipping address
export const createShippingAddress = createAsyncThunk(
  "shippingAddress/createAddress",
  async (addressData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/create-address`,
        addressData,
        getConfig()
      );
      dispatch(getShippingAddresses());
      return response.data; // include message/success if backend provides it
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create shipping address"
      );
    }
  }
);

// Update an existing shipping address
export const updateShippingAddress = createAsyncThunk(
  "shippingAddress/updateAddress",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/update-address/${id}`,
        addressData,
        getConfig()
      );
      return response.data.address;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update shipping address"
      );
    }
  }
);

// Delete a shipping address
export const deleteShippingAddress = createAsyncThunk(
  "shippingAddress/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/delete-address/${id}`,
        getConfig()
      );
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete shipping address"
      );
    }
  }
);

// Initial state for the shipping address slice
const initialState = {
  addresses: [],
  loading: false,
  error: null,
  success: false,
};

const shippingAddressSlice = createSlice({
  name: "shippingAddress",
  initialState,
  reducers: {
    clearShippingAddressError: (state) => {
      state.error = null;
    },
    clearShippingAddressSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShippingAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getShippingAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.error = null;
        state.success = true;
      })
      .addCase(getShippingAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.addresses = [];
        state.success = false;
      })
      // Create Address
      .addCase(createShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        // If backend returns the created address and message
        const createdAddress = action.payload?.address;
        if (createdAddress) {
          state.addresses = [createdAddress, ...state.addresses];
        }
        state.error = null;
        state.success = true;
      })
      .addCase(createShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Address
      .addCase(updateShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.map((address) =>
          address._id === action.payload._id ? action.payload : address
        );
        state.error = null;
        state.success = true;
      })
      .addCase(updateShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Address
      .addCase(deleteShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.filter(
          (address) => address._id !== action.payload
        );
        state.error = null;
        state.success = true;
      })
      .addCase(deleteShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearShippingAddressError, clearShippingAddressSuccess } =
  shippingAddressSlice.actions;

export default shippingAddressSlice.reducer;
