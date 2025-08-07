import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  reviews: [],
  status: 'idle',
  error: null,
};

export const fetchReviewsByProductId = createAsyncThunk(
  'reviews/fetchByProductId',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/review/${productId}`);
      return data.reviews;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async ({ productId, rating, comment, images }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      console.log('auth', auth)

      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('userId', auth.user._id);
      formData.append('rating', rating);
      formData.append('comment', comment);
      if (images) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }

      const { data } = await axios.post(`${API_URL}/api/review/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${auth.accessToken}`,
        },
      });
      return data.review;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByProductId.pending, (state) => {
        state.status = 'loading';
        state.reviews = []; // Clear previous reviews on new fetch
      })
      .addCase(fetchReviewsByProductId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsByProductId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviews.push(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearReviews } = reviewSlice.actions;

export default reviewSlice.reducer;
