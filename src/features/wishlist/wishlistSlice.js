import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Adding Item to Wishlist
export const addItemToWishList = createAsyncThunk(
  "wishlist/addItem",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const accessToken = auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available.");
      }

      const response = await axios.post(
        `${API_URL}/api/wishlist/addToWishlist`,
        { productId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to add item to wishlist"
        );
      } else if (axios.isAxiosError(error) && error.request) {
        return rejectWithValue("No response received from server.");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Getting User's Wishlist
export const getUserWishList = createAsyncThunk(
  "wishlist/getWishlist",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const accessToken = auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available for fetching wishlist.");
      }

      const response = await axios.get(`${API_URL}/api/wishlist/wishlist`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch wishlist"
        );
      } else if (axios.isAxiosError(error) && error.request) {
        return rejectWithValue("No response received from server.");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Removing Item from Wishlist
export const removeItemFromWishList = createAsyncThunk(
  "wishlist/removeItem",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const accessToken = auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available for removing item.");
      }

      const response = await axios.delete(
        `${API_URL}/api/wishlist/remove/${productId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      console.log('response', response)
      return productId;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to remove item from wishlist"
        );
      } else if (axios.isAxiosError(error) && error.request) {
        return rejectWithValue("No response received from server.");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Clearing Wishlist
export const clearWishList = createAsyncThunk(
  "wishlist/clear",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const accessToken = auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available for clearing wishlist.");
      }

      const response = await axios.delete(`${API_URL}/wishlist/clear`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data; 
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to clear wishlist"
        );
      } else if (axios.isAxiosError(error) && error.request) {
        return rejectWithValue("No response received from server.");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

//Merging Wishlist Items
export const mergeWishListItems = createAsyncThunk(
  "wishlist/merge",
  async (productIds, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const accessToken = auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available for merging items.");
      }

      const response = await axios.post(
        `${API_URL}/wishlist/merge`,
        { products: productIds }, 
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data; 
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to merge wishlist items"
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
  wishlist: null, 
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistState: (state) => {
      state.wishlist = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Item to Wishlist
      .addCase(addItemToWishList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToWishList.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(addItemToWishList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add item to wishlist";
      })
      // Get User's Wishlist
      .addCase(getUserWishList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserWishList.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload; 
      })
      .addCase(getUserWishList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch wishlist";
        state.wishlist = null; 
      })
      .addCase(removeItemFromWishList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromWishList.fulfilled, (state, action) => {
        state.loading = false;
        if (state.wishlist && state.wishlist.products) {
          state.wishlist.products = state.wishlist.products.filter(
            (product) => product._id !== action.payload
          );
        }
      })
      .addCase(removeItemFromWishList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove item from wishlist";
      })
      // Clear Wishlist
      .addCase(clearWishList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishList.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(clearWishList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to clear wishlist";
      })
      // Merge Wishlist Items
      .addCase(mergeWishListItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeWishListItems.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload; 
      })
      .addCase(mergeWishListItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to merge wishlist items";
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
