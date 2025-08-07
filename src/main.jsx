import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Toaster } from "@/components/ui/sonner";
import { Provider } from "react-redux";
import { persistor, store } from "./app/store";
import axios from "axios";
import { logout, refreshToken } from "./features/auth/authSlice.js";
import { PersistGate } from "redux-persist/integration/react";

const API_URL = import.meta.env.VITE_API_URL;
const axiosToIntercept = axios;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosToIntercept.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    if (accessToken && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosToIntercept.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (originalRequest.url.endsWith("/api/user/login")) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      originalRequest._refreshAttempted = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosToIntercept(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const resultAction = await store.dispatch(refreshToken());

        if (refreshToken.fulfilled.match(resultAction)) {
          const newAccessToken = resultAction.payload.accessToken;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return axiosToIntercept(originalRequest);
        } else {
          store.dispatch(logout());
          processQueue(resultAction.error, null);
          return Promise.reject(resultAction.error);
        }
      } catch (err) {
        store.dispatch(logout());
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest._refreshAttempted
    ) {
      store.dispatch(logout());
    }

    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </BrowserRouter>
    <Toaster />
  </>
);
