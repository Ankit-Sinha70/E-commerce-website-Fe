import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
// Utility function to get the authentication headers
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/notifications/${userId}`,
        getAuthHeaders()
      );
      if (data.notifications) {
        return data.notifications;
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      // The second argument for axios.put is the body, which is empty here.
      const { data } = await axios.put(
        `${API_URL}/api/notifications/read/${notificationId}`,
        {},
        getAuthHeaders()
      );
      return data.notification;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (userId, { rejectWithValue }) => {
    try {
      await axios.put(
        `${API_URL}/api/notifications/read-all/${userId}`,
        {},
        getAuthHeaders()
      );
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  "notifications/deleteAll",
  async ({ userId, notificationIds }, { rejectWithValue }) => {
    try {
      const config = {
        ...getAuthHeaders(),
        data: { notification: notificationIds },
      };
      await axios.delete(
        `${API_URL}/api/notifications/delete-all/${userId}`,
        config
      );
      return { notificationIds };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteUserNotification = createAsyncThunk(
  "notifications/deleteUserNotification",
  async (notificationId, { rejectWithValue }) => {    try {
      await axios.delete(
        `${API_URL}/api/notifications/delete/${notificationId}`,
        getAuthHeaders()
      );
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
      addNotification: (state, action) => {
        state.notifications.unshift(action.payload)
        state.unreadCount += 1;
      }
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(
          (notification) => (notification.isRead = true)
        );
        state.unreadCount = 0;
      })
      .addCase(deleteAllNotifications.fulfilled, (state, action) => {
        const { notificationIds } = action.payload;
        if (notificationIds && notificationIds.length > 0) {
          const deletedUnreadCount = state.notifications.filter(
            (n) => notificationIds.includes(n._id) && !n.isRead
          ).length;
          state.unreadCount = Math.max(
            0,
            state.unreadCount - deletedUnreadCount
          );
          state.notifications = state.notifications.filter(
            (n) => !notificationIds.includes(n._id)
          );
        } else {
          state.notifications = [];
          state.unreadCount = 0;
        }
      })
      .addCase(deleteUserNotification.fulfilled, (state, action) => {
        const deletedNotification = state.notifications.find(
          (n) => n._id === action.payload
        );
        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          (notification) => notification._id !== action.payload
        );
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n._id === action.payload._id
        );
        if (index !== -1) {
          if (!state.notifications[index].isRead && action.payload.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications[index] = action.payload;
        }
      });
  },
});

export default notificationSlice.reducer;
export const { addNotification } = notificationSlice.actions