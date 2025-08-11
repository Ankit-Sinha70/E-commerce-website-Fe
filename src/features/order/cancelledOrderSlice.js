import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getCancelledOrders = createAsyncThunk(
  'cancelledOrders/getCancelledOrders',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/order/cancelled-orders`, {
        params: { page, limit }
      });
      return response.data.cancelledOrders
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const initiateRefund = createAsyncThunk(
  'cancelledOrders/initiateRefund',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/payment/initiate-refund/cancelled-order/${orderId}`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const cancelledOrdersSlice = createSlice({
  name: 'cancelledOrders',
  initialState: {
    orders: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10
    }
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCancelledOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCancelledOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.pagination = {
          currentPage: action.payload.page,
          totalPages: action.payload.totalPages,
          totalItems: action.payload.totalItems,
          itemsPerPage: action.payload.limit
        };
      })
      .addCase(getCancelledOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(initiateRefund.pending, (state) => {
        state.loading = true;
      })
      .addCase(initiateRefund.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(initiateRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentPage } = cancelledOrdersSlice.actions;
export default cancelledOrdersSlice.reducer;
