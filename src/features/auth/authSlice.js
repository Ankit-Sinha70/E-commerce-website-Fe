import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Helper to get initial state from localStorage
// const loadAuthFromLocalStorage = () => {
//   try {
//     const userString = localStorage.getItem("user");
//     const accessTokenString = localStorage.getItem("accessToken");
//     if (userString) {
//       localStorage.removeItem("guestId");
//     }

//     const user = userString ? JSON.parse(userString) : null;
//     const accessToken = accessTokenString || null;
//     return {
//       user: user,
//       accessToken: accessToken,
//       isAdmin: user?.role === "admin" || false,
//     };
//   } catch (e) {
//     console.error("Failed to load auth state from localStorage:", e);
//     return {
//       user: null,
//       accessToken: null,
//       isAdmin: false,
//     };
//   }
// };

// add / replace initialState to read from localStorage
const initialState = {
  accessToken: localStorage.getItem("accessToken") || null,
  user: (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })(),
  loading: false,
  error: null,
  changePasswordStatus: "idle",
  changePasswordError: null,
  changePasswordSuccess: null,
};

//user registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/create`, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Registration failed"
        );
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/user/login`,
        credentials,
        {
          withCredentials: true,
        }
      );
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.userProfile));
      localStorage.removeItem("guestId");

      return {
        user: response.data.userProfile,
        accessToken: response.data.accessToken,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

// logging out a user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        `${API_URL}/api/user/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || "Logout failed");
      } else if (axios.isAxiosError(error) && error.request) {
        return rejectWithValue("No response received from server for logout.");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
//refreshing the access token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/user/refresh-token`,
        {},
        {
          withCredentials: true,
        }
      );
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return rejectWithValue(
        error.response?.data?.message || "Failed to refresh token"
      );
    }
  }
);

// getting user profile
export const getUserProfile = createAsyncThunk(
  "auth/getUserProfile",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const accessToken = auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available.");
      }
      const response = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch user profile"
        );
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// updating user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async ({ userId, userData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const accessToken = auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available.");
      }
      const response = await axios.put(
        `${API_URL}/api/user/update/${userId}`,
        userData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to update user profile"
        );
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// forgot password request
export const forgotPasswordRequest = createAsyncThunk(
  "auth/forgotPasswordRequest",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to send reset link"
        );
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// resetting password
export const resetPasswordConfirm = createAsyncThunk(
  "auth/resetPasswordConfirm",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/user/reset-password/${token}`,
        { password }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to reset password"
        );
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ oldPassword, newPassword, accessToken }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/user/update-password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to change password"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAdmin = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
    setSuperAdminStatus(state, action) {
      state.isAdmin = action.payload;
    },
    clearChangePasswordState(state) {
      state.changePasswordStatus = "idle";
      state.changePasswordError = null;
      state.changePasswordSuccess = null;
    },
    // set credentials when login/register via external flows (Google/Facebook)
    setCredentials(state, action) {
      const { accessToken, user } = action.payload || {};
      if (accessToken) {
        state.accessToken = accessToken;
        localStorage.setItem("accessToken", accessToken);
      }
      if (user) {
        state.user = user;
        localStorage.setItem("user", JSON.stringify(user));
      }
      state.loading = false;
      state.error = null;
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAdmin = action.payload.user?.role === "admin" || false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log("action", action);
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.accessToken = null;
        state.isAdmin = false;
      })

      // Handlers for logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAdmin = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.accessToken = null;
        state.isAdmin = false;
      })
      // Handlers for refreshToken
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAdmin = action.payload.user?.role === "admin" || false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.accessToken = null;
        state.isAdmin = false;
      })
      // Handlers for getUserProfile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAdmin = action.payload?.role === "admin" || false;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAdmin = false;
      })
      // Handlers for updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.updatedUser;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handlers for forgotPasswordRequest
      .addCase(forgotPasswordRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordRequest.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPasswordRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handlers for resetPasswordConfirm
      .addCase(resetPasswordConfirm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordConfirm.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPasswordConfirm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handlers for changePassword
      .addCase(changePassword.pending, (state) => {
        state.changePasswordStatus = "loading";
        state.changePasswordError = null;
        state.changePasswordSuccess = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.changePasswordStatus = "succeeded";
        state.changePasswordSuccess = action.payload.message;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordStatus = "failed";
        state.changePasswordError = action.payload;
      });
  },
});

export const {
  logout,
  setSuperAdminStatus,
  clearChangePasswordState,
  setCredentials,
  clearCredentials,
} = authSlice.actions;
export default authSlice.reducer;
