import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch payment details by order ID
export const fetchPaymentDetailsByOrderId = createAsyncThunk(
  "payment/fetchPaymentDetailsByOrderId",
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/payment/payment-details/${orderId}`, {
        // headers: {
        //   Authorization: `Bearer ${accessToken}`,
        // },
      });
      // The backend returns { payment: ... }
      console.log('response', response)
      return response.data.payment
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch payment details"
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
  paymentDetails: null,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentDetails: (state) => {
      state.paymentDetails = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment details
      .addCase(fetchPaymentDetailsByOrderId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentDetailsByOrderId.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentDetails = action.payload;
        state.error = null;
      })
      .addCase(fetchPaymentDetailsByOrderId.rejected, (state, action) => {
        state.loading = false;
        state.paymentDetails = null;
        state.error = action.payload || "Failed to fetch payment details";
      });
  },
});

export const { clearPaymentDetails } = paymentSlice.actions;
export default paymentSlice.reducer;
