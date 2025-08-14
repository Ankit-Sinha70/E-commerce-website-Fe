import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch all orders
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string from params
      const query = new URLSearchParams();
      if (params.name) query.append("name", params.name);
      if (params.status) query.append("status", params.status);
      if (params.date) query.append("date", params.date);
      if (params.page) query.append("page", params.page);
      if (params.limit) query.append("limit", params.limit);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await axios.get(
        `${API_URL}/api/order/orders${queryString}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch my orders
export const fetchMyOrders = createAsyncThunk(
  "order/fetchMyOrders",
  async ({ userId, accessToken, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/order/user-orders/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: { page, limit },
        }
      );
      return {
        orders: response.data.orders,
        page: response.data.page,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems,
        limit: response.data.limit,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch single order
export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/order/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/order/update-status/${orderId}`,
        { status }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete order
export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/order/orders/${orderId}`);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Return order
export const returnOrder = createAsyncThunk(
  "order/returnOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/order/orders/${orderId}/return`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Return order request
export const returnOrderRequest = createAsyncThunk(
  "order/returnOrderRequest",
  async ({ orderId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/order/return-request/${orderId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Cancel return request
export const cancelReturnRequest = createAsyncThunk(
  "order/cancelReturnRequest",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/order/cancel-return-request/${orderId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ADMIN: Fetch all return requests
export const fetchAllReturnRequests = createAsyncThunk(
  "order/fetchAllReturnRequests",
  async ({ page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/order/return-request`, {
        params: { page },
      });
      console.log(response?.data, "jjjj")
      // Match the backend response structure
      return {
        data: response?.data?.returnRequest || [], 
        totalPages: response?.data?.totalPages || 1,
        page: response?.data?.page || 1,
        totalItems: response?.data?.totalItems || 0
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch return requests");
    }
  }
);

export const fetchUserReturnRequest = createAsyncThunk(
  "order/fetchUserReturnRequest",
  async ({ userId, accessToken, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { page, limit, _ts: Date.now() };
      const config = accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}`, 'Cache-Control': 'no-cache' }, params }
        : { params };
      const response = await axios.get(
        `${API_URL}/api/order/user-return-request/${userId}`,
        config
      );
      const serverItems = Array.isArray(response.data.returnRequests)
        ? response.data.returnRequests
        : [];
      const serverLimit = Number(response.data.limit) || Number(limit) || 10;
      const serverPage = Number(response.data.page) || Number(page) || 1;
      const serverTotal = Number(response.data.totalItems) || serverItems.length;
      const computedTotalPages = Math.max(1, Math.ceil(serverTotal / serverLimit));
      return {
        data: serverItems,
        page: serverPage,
        totalPages: Number(response.data.totalPages) || computedTotalPages,
        totalItems: serverTotal,
        limit: serverLimit,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ADMIN: Update return request status
export const updateReturnRequestStatus = createAsyncThunk(
  "order/updateReturnRequestStatus",
  async ({ returnRequestId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/order/update-return-request/${returnRequestId}`,
        { status }
      );
      return response.data.returnOrder;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Cancel order thunk (keep this)
export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/order/orders/${orderId}/cancel`
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Track order
export const trackOrder = createAsyncThunk(
  "order/trackOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/order/orders/track/${orderId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch recent orders for admin dashboard
export const fetchRecentOrders = createAsyncThunk(
  "order/fetchRecentOrders",
  // we expect an object with accessToken (string) optional pageSize
  async ({ accessToken, limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const config = accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : {};
      const response = await axios.get(
        `${API_URL}/api/order/recent-orders?limit=${limit}`,
        config
      );
      // backend returns { success: true, orders: [...] } per earlier code — adjust if different
      return response.data.orders ?? response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch yearly revenue for admin dashboard
export const fetchYearlyRevenue = createAsyncThunk(
  "order/fetchYearlyRevenue",
  async ({ accessToken }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/order/revenue`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.totalRevenue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add this thunk to fetch sales overview
export const getSalesOverview = createAsyncThunk(
  'orders/getSalesOverview',
  async ({ accessToken }, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/api/order/sales-overview`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch sales overview');
    }
  }
);

// Initiate return refund
export const initiateReturnRefund = createAsyncThunk(
  'orders/initiateReturnRefund',
  async (returnOrderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/payment/initiate-refund/returned-order/${returnOrderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    order: null, // for single order view
    loading: false,
    error: null,
    cancelLoading: false,
    cancelError: null,
    fetchOrderLoading: false,
    fetchOrderError: null,
    updateStatusLoading: false,
    updateStatusError: null,
    deleteLoading: false,
    deleteError: null,
    returnLoading: false,
    returnError: null,
    returnSuccess: null,
    tracking: null,
    trackingLoading: false,
    trackingError: null,
    returnRequestLoading: false,
    returnRequestError: null,
    cancelReturnRequestLoading: false,
    cancelReturnRequestError: null,
    // Admin state
    returnRequests: [],
    returnRequestsLoading: false,
    returnRequestsError: null,
    returnRequestsTotalPages: 0,
    returnRequestsCurrentPage: 1,
    returnRequestsLimit: 10,
    returnRequestsTotalItems: 0,
    recentOrders: [],
    recentOrdersLoading: false,
    recentOrdersError: null,
    yearlyRevenue: 0,
    yearlyRevenueLoading: false,
    yearlyRevenueError: null,
    salesOverview: [],
    salesOverviewLoading: false,
    salesOverviewError: null,
    initiateReturnRefundLoading: false,
    initiateReturnRefundError: null,
    // My orders pagination
    myOrdersTotalPages: 1,
    myOrdersCurrentPage: 1,
    myOrdersLimit: 10,
    myOrdersTotalItems: 0,
  },
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.loading = false;
      state.error = null;
    },
    clearOrder: (state) => {
      state.order = null;
      state.fetchOrderError = null;
    },
    clearReturnStatus: (state) => {
      state.returnError = null;
      state.returnSuccess = null;
    },
    clearTracking: (state) => {
      state.tracking = null;
      state.trackingLoading = false;
      state.trackingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        const sorted = (action.payload.orders || []).slice().sort((a, b) => {
          const aDate = new Date(a?.createdAt || a?.orderDate || 0);
          const bDate = new Date(b?.createdAt || b?.orderDate || 0);
          return bDate - aDate;
        });
        state.orders = sorted;
        state.myOrdersCurrentPage = action.payload.page;
        state.myOrdersLimit = action.payload.limit;
        state.myOrdersTotalPages = action.payload.totalPages;
        state.myOrdersTotalItems = action.payload.totalItems;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      })

      // Fetch single order
      .addCase(fetchOrderById.pending, (state) => {
        state.fetchOrderLoading = true;
        state.fetchOrderError = null;
        state.order = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.fetchOrderLoading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.fetchOrderLoading = false;
        state.fetchOrderError = action.payload;
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateStatusLoading = true;
        state.updateStatusError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updateStatusLoading = false;
        // Update the order in the orders array
        state.orders = state.orders.map((order) =>
          order._id === action.payload.order._id ? action.payload.order : order
        );
        // If viewing this order, update it too
        if (state.order && state.order._id === action.payload.order._id) {
          state.order = action.payload.order;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateStatusLoading = false;
        state.updateStatusError = action.payload;
      })

      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })

      // Return order
      .addCase(returnOrder.pending, (state) => {
        state.returnLoading = true;
        state.returnError = null;
        state.returnSuccess = null;
      })
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.returnLoading = false;
        state.returnSuccess =
          action.payload?.message || "Return request placed successfully.";
        // Optionally update order status in list
        if (action.payload?.order) {
          state.orders = state.orders.map((order) =>
            order._id === action.payload.order._id
              ? action.payload.order
              : order
          );
          if (state.order && state.order._id === action.payload.order._id) {
            state.order = action.payload.order;
          }
        }
      })
      .addCase(returnOrder.rejected, (state, action) => {
        state.returnLoading = false;
        state.returnError = action.payload;
      })

      // Return order request
      .addCase(returnOrderRequest.pending, (state) => {
        state.returnRequestLoading = true;
        state.returnRequestError = null;
      })
      .addCase(returnOrderRequest.fulfilled, (state, action) => {
        state.returnRequestLoading = false;
        const { returnOrder } = action.payload;
        const orderIndex = state.orders.findIndex((o) => o._id === returnOrder.orderId);

        if (orderIndex !== -1) {
          const orderToUpdate = state.orders[orderIndex];
          // Update item quantities immutably
          const updatedItems = orderToUpdate.items.map(item => {
            const returnedItem = returnOrder.items.find(ri => ri.productId === item.productId);
            if (returnedItem) {
              return {
                ...item,
                returnedQuantity: (item.returnedQuantity || 0) + returnedItem.quantity,
              };
            }
            return item;
          });
          state.orders[orderIndex] = { ...orderToUpdate, items: updatedItems };
        }
      })
      .addCase(returnOrderRequest.rejected, (state, action) => {
        state.returnRequestLoading = false;
        state.returnRequestError = action.payload;
      })

      // Cancel return request
      .addCase(cancelReturnRequest.pending, (state) => {
        state.cancelReturnRequestLoading = true;
        state.cancelReturnRequestError = null;
      })
      .addCase(cancelReturnRequest.fulfilled, (state, action) => {
        state.cancelReturnRequestLoading = false;
        const index = state.returnRequests.findIndex(
          (returnRequest) => returnRequest._id === action.payload._id
        );
        if (index !== -1) {
          state.returnRequests[index] = action.payload;
        }
      })
      .addCase(cancelReturnRequest.rejected, (state, action) => {
        state.cancelReturnRequestLoading = false;
        state.cancelReturnRequestError = action.payload;
      })

      // ADMIN: Fetch all return requests
      .addCase(fetchAllReturnRequests.pending, (state) => {
        state.returnRequestsLoading = true;
      })
     // In orderSlice.js
.addCase(fetchAllReturnRequests.fulfilled, (state, action) => {
  state.returnRequestsLoading = false;
  state.returnRequests = action.payload.data || [];  // Ensure this is an array
  state.returnRequestsTotalPages = action.payload.totalPages || 1;
  state.returnRequestsCurrentPage = action.payload.page || 1;
  state.returnRequestsError = null;
})
      .addCase(fetchAllReturnRequests.rejected, (state, action) => {
        state.returnRequestsLoading = false;
        state.returnRequestsError = action.payload;
      })

      .addCase(fetchUserReturnRequest.pending, (state) => {
        state.returnRequestsLoading = true;
        state.returnRequestsError = null;
      })
      .addCase(fetchUserReturnRequest.fulfilled, (state, action) => {
        state.returnRequestsLoading = false;
        state.returnRequests = action.payload.data || [];
        state.returnRequestsTotalPages = action.payload.totalPages || 1;
        state.returnRequestsCurrentPage = action.payload.page || 1;
        state.returnRequestsLimit = action.payload.limit || state.returnRequestsLimit;
        state.returnRequestsTotalItems = action.payload.totalItems || 0;
      })
      .addCase(fetchUserReturnRequest.rejected, (state, action) => {
        state.returnRequestsLoading = false;
        state.returnRequestsError = action.payload || action.error?.message || null;
      })

      // ADMIN: Update return request status
      .addCase(updateReturnRequestStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const index = state.returnRequests.findIndex(
          (req) => req._id === updatedOrder._id
        );
        if (index !== -1) {
          state.returnRequests[index] = updatedOrder;
        }
      })

      // Cancel order (keep this)
      .addCase(cancelOrder.pending, (state) => {
        state.cancelLoading = true;
        state.cancelError = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelLoading = false;
        const updatedOrder = action.payload;
        state.orders = state.orders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = action.payload;
      })

      // Track order
      .addCase(trackOrder.pending, (state) => {
        state.trackingLoading = true;
        state.trackingError = null;
        state.tracking = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.trackingLoading = false;
        state.tracking = action.payload;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.trackingLoading = false;
        state.trackingError = action.payload;
      })
      // Fetch recent orders
      .addCase(fetchRecentOrders.pending, (state) => {
        state.recentOrdersLoading = true;
        state.recentOrdersError = null;
      })
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentOrdersLoading = false;
        state.recentOrders = action.payload || [];
      })
      .addCase(fetchRecentOrders.rejected, (state, action) => {
        state.recentOrdersLoading = false;
        state.recentOrdersError = action.payload || action.error?.message;
      })
      // Fetch yearly revenue
      .addCase(fetchYearlyRevenue.pending, (state) => {
        state.yearlyRevenueLoading = true;
        state.yearlyRevenueError = null;
      })
      .addCase(fetchYearlyRevenue.fulfilled, (state, action) => {
        state.yearlyRevenueLoading = false;
        state.yearlyRevenue = action.payload;
      })
      .addCase(fetchYearlyRevenue.rejected, (state, action) => {
        state.yearlyRevenueLoading = false;
        state.yearlyRevenueError = action.payload;
      })
      // Fetch sales overview
      .addCase(getSalesOverview.pending, state => {
        state.salesOverviewLoading = true;
        state.salesOverviewError = null;
      })
      .addCase(getSalesOverview.fulfilled, (state, action) => {
        state.salesOverviewLoading = false;
        state.salesOverview = action.payload || [];
      })
      .addCase(getSalesOverview.rejected, (state, action) => {
        state.salesOverviewLoading = false;
        state.salesOverviewError = action.payload;
      })
      // Initiate return refund
      .addCase(initiateReturnRefund.pending, (state) => {
        state.initiateReturnRefundLoading = true;
        state.initiateReturnRefundError = null;
      })
      .addCase(initiateReturnRefund.fulfilled, (state) => {
        state.initiateReturnRefundLoading = false;
        // Optionally update state based on response
      })
      .addCase(initiateReturnRefund.rejected, (state, action) => {
        state.initiateReturnRefundLoading = false;
        state.initiateReturnRefundError = action.payload;
      });      
  },
});

export const { clearOrders, clearOrder, clearReturnStatus, clearTracking } = orderSlice.actions;

export default orderSlice.reducer;
